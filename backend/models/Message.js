class Message {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async create(messageData) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert([{
        group_id: messageData.groupId,
        user_id: messageData.userId,
        username: messageData.username,
        text: messageData.text,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByGroupId(groupId, limit = 50) {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async deleteById(messageId) {
    const { error } = await this.supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return true;
  }
}

module.exports = Message;
