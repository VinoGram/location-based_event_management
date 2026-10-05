const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new group
router.post('/create', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const supabase = req.app.get('supabase');
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: name.trim(),
        creator_id: req.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Group creation error:', error);
      return res.status(500).json({ message: 'Failed to create group', error: error.message });
    }

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: req.user.id,
        role: 'admin'
      });

    if (memberError) {
      console.error('Member creation error:', memberError);
    }
    
    res.status(201).json(group);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's groups
router.get('/my-groups', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');

    const { data: memberships, error: memErr } = await supabase
      .from('group_members')
      .select('group_id, role')
      .eq('user_id', req.user.id);
    if (memErr) throw memErr;
    if (!memberships || memberships.length === 0) return res.json([]);

    const groupIds = memberships.map(m => m.group_id);

    const { data: groups, error: grpErr } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds);
    if (grpErr) throw grpErr;

    // Fetch member counts for all groups in one query
    const { data: allMembers } = await supabase
      .from('group_members')
      .select('group_id, user_id, role')
      .in('group_id', groupIds);

    // Fetch member user details
    const memberUserIds = [...new Set((allMembers || []).map(m => m.user_id))];
    let userMap = {};
    if (memberUserIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, first_name, last_name, profile_picture')
        .in('id', memberUserIds);
      (users || []).forEach(u => { userMap[u.id] = u; });
    }

    // Fetch shared event counts per group from group_messages
    const { data: sharedEvents } = await supabase
      .from('group_messages')
      .select('group_id, message')
      .in('group_id', groupIds)
      .ilike('message', '%Shared event:%');

    // Build enriched groups
    const enriched = (groups || []).map(group => {
      const members = (allMembers || []).filter(m => m.group_id === group.id);
      const events  = (sharedEvents || []).filter(e => e.group_id === group.id);
      return {
        ...group,
        members: members.map(m => ({
          name: userMap[m.user_id] ? `${userMap[m.user_id].first_name} ${userMap[m.user_id].last_name}`.trim() : 'User',
          avatar: userMap[m.user_id]?.profile_picture || null,
          role: m.role,
        })),
        shared_events: events,
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Fetch groups error:', error);
    res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
  }
});

// Get available groups to join
router.get('/available', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');

    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', req.user.id);

    const userGroupIds = (memberships || []).map(g => g.group_id);

    let query = supabase.from('groups').select('*');
    if (userGroupIds.length > 0) query = query.not('id', 'in', userGroupIds);

    const { data: groups, error } = await query;
    if (error) throw error;
    if (!groups || groups.length === 0) return res.json([]);

    const groupIds = groups.map(g => g.id);
    const { data: allMembers } = await supabase
      .from('group_members')
      .select('group_id')
      .in('group_id', groupIds);

    const enriched = groups.map(group => ({
      ...group,
      members: (allMembers || []).filter(m => m.group_id === group.id),
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a group
router.post('/:groupId/join', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const supabase = req.app.get('supabase');
    
    // Check if group exists
    const { data: group, error: fetchError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (fetchError || !group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is already a member
    const { data: existingMember, error: memberError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', req.user.id)
      .single();
    
    if (existingMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }
    
    // Add user to group
    const { error: insertError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: req.user.id,
        role: 'member'
      });
    
    if (insertError) {
      return res.status(500).json({ message: 'Failed to join group', error: insertError.message });
    }
    
    res.json({ message: 'Successfully joined group' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get group messages
router.get('/:groupId/messages', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const supabase = req.app.get('supabase');

    const { data: messages, error } = await supabase
      .from('group_messages')
      .select('id, message, created_at, user_id')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    if (error) throw error;

    // Fetch user names + avatars separately
    const userIds = [...new Set((messages || []).map(m => m.user_id))];
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, first_name, last_name, avatar_url, profile_picture')
        .in('id', userIds);
      (users || []).forEach(u => {
        userMap[u.id] = {
          name: `${u.first_name} ${u.last_name}`.trim(),
          avatar: u.avatar_url || u.profile_picture || null,
        };
      });
    }

    res.json((messages || []).map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      username: userMap[msg.user_id]?.name || 'User',
      avatar: userMap[msg.user_id]?.avatar || null,
      text: msg.message,
      timestamp: msg.created_at,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send group message
router.post('/:groupId/messages', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { message } = req.body;
    const supabase = req.app.get('supabase');
    
    const { error } = await supabase
      .from('group_messages')
      .insert({
        group_id: groupId,
        user_id: req.user.id,
        message: message
      });
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Share event to group
router.post('/:groupId/share-event', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { eventId } = req.body;
    const supabase = req.app.get('supabase');
    
    console.log('Share event request:', { groupId, eventId, userId: req.user.id });
    
    // Send message to group about the shared event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      console.error('Event fetch error:', eventError);
    }
    
    const { error } = await supabase
      .from('group_messages')
      .insert({
        group_id: groupId,
        user_id: req.user.id,
        message: `📅 Shared event: ${event?.title || 'Event'}`
      });
    
    if (error) {
      console.error('Group message insert error:', error);
      throw error;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Share event error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get group members
router.get('/:groupId/members', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const supabase = req.app.get('supabase');

    const { data: members, error } = await supabase
      .from('group_members')
      .select('user_id, role')
      .eq('group_id', groupId);
    if (error) throw error;

    const userIds = (members || []).map(m => m.user_id);
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, first_name, last_name, profile_picture')
        .in('id', userIds);
      (users || []).forEach(u => { userMap[u.id] = u; });
    }

    res.json((members || []).map(m => ({
      name: userMap[m.user_id] ? `${userMap[m.user_id].first_name} ${userMap[m.user_id].last_name}`.trim() : 'User',
      avatar: userMap[m.user_id]?.profile_picture || null,
      role: m.role,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a group (creator or admin only)
router.delete('/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const supabase = req.app.get('supabase');

    // Verify the requester is the group creator or an admin member
    const { data: group, error: fetchErr } = await supabase
      .from('groups')
      .select('id, creator_id')
      .eq('id', groupId)
      .single();

    if (fetchErr || !group) return res.status(404).json({ message: 'Group not found' });

    const isCreator = String(group.creator_id) === String(req.user.id);
    if (!isCreator) {
      // Allow group admins too
      const { data: membership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', req.user.id)
        .single();
      if (!membership || membership.role !== 'admin') {
        return res.status(403).json({ message: 'Only the group creator or an admin can delete this group' });
      }
    }

    // Delete messages, members, then group
    await supabase.from('group_messages').delete().eq('group_id', groupId);
    await supabase.from('group_members').delete().eq('group_id', groupId);
    const { error: delErr } = await supabase.from('groups').delete().eq('id', groupId);
    if (delErr) throw delErr;

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;