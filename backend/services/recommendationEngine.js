class RecommendationEngine {
  constructor(supabase) {
    this.supabase = supabase;
    this.weights = {
      interested: 5,
      rating_5: 4,
      rating_4: 3,
      rating_3: 0,
      rating_2: -2,
      rating_1: -3,
      positive_comment: 3,
      negative_comment: -3,
      view_time: 1
    };
  }

  async getUserProfile(userId) {
    const [rsvps, ratings, comments] = await Promise.all([
      this.supabase.from('event_rsvps').select('event_id, events(category)').eq('user_id', userId),
      this.supabase.from('event_ratings').select('event_id, rating, events(category)').eq('user_id', userId),
      this.supabase.from('event_comments').select('event_id, comment, events(category)').eq('user_id', userId)
    ]);

    const categoryScores = {};

    rsvps.data?.forEach(rsvp => {
      const category = rsvp.events?.category;
      if (category) categoryScores[category] = (categoryScores[category] || 0) + this.weights.interested;
    });

    ratings.data?.forEach(rating => {
      const category = rating.events?.category;
      const weight = this.weights[`rating_${rating.rating}`] || 0;
      if (category) categoryScores[category] = (categoryScores[category] || 0) + weight;
    });

    comments.data?.forEach(comment => {
      const category = comment.events?.category;
      const sentiment = this.analyzeSentiment(comment.comment);
      const weight = sentiment > 0 ? this.weights.positive_comment : this.weights.negative_comment;
      if (category) categoryScores[category] = (categoryScores[category] || 0) + weight;
    });

    return { categoryScores };
  }

  analyzeSentiment(text) {
    const positive = ['great', 'amazing', 'love', 'awesome', 'fantastic', 'excellent', 'fun', 'enjoyed'];
    const negative = ['boring', 'bad', 'terrible', 'hate', 'awful', 'expensive', 'waste'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    words.forEach(word => {
      if (positive.includes(word)) score += 1;
      if (negative.includes(word)) score -= 1;
    });
    return score;
  }

  async getRecommendations(userId, limit = 20) {
    const profile = await this.getUserProfile(userId);
    
    const { data: events } = await this.supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .eq('status', 'approved');

    const scoredEvents = events.map(event => {
      let score = 0;
      
      if (profile.categoryScores[event.category]) {
        score += profile.categoryScores[event.category];
      }
      
      return { ...event, recommendationScore: score };
    });

    return scoredEvents
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  }
}

module.exports = RecommendationEngine;