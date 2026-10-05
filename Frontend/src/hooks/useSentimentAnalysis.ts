import { useCallback } from 'react';
import { API_URL } from '../config';

export function useSentimentAnalysis() {
  const analyzeComment = useCallback(async (comment: string, eventId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/search/analyze-comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, eventId })
      });

      if (response.ok) {
        const analysis = await response.json();
        
        // Track sentiment as engagement signal
        const token = localStorage.getItem('token');
        if (token && analysis.sentiment !== 'neutral') {
          await fetch(`${API_URL}/api/engagement/track`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              eventId,
              action: `${analysis.sentiment}_comment`,
              value: comment,
              score: analysis.score
            })
          });
        }
        
        return analysis;
      }
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
    }
    return null;
  }, []);

  return { analyzeComment };
}