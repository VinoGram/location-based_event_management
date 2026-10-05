import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import GroupChat from './GroupChat';
import { API_URL } from '../config';

export default function GroupPlanning() {
  const [groups, setGroups] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [activeChat, setActiveChat] = useState<{id: string, name: string} | null>(null);
  const [showMembers, setShowMembers] = useState<{id: string, name: string} | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchUserGroups();
    fetchAvailableGroups();
  }, []);

  const fetchUserGroups = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch(`${API_URL}/api/groups/my-groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setGroups(await response.json());
      else toast.error('Failed to fetch groups');
    } catch { toast.error('Failed to connect to server'); }
    finally { setLoading(false); }
  };

  const fetchAvailableGroups = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/groups/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setAvailableGroups(await response.json());
    } catch { console.error('Failed to fetch available groups'); }
  };

  const handleCreateGroup = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) { toast.error('Please log in to create a group'); return; }
    if (!newGroupName.trim()) { toast.error('Please enter a group name'); return; }
    try {
      const response = await fetch(`${API_URL}/api/groups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newGroupName.trim() })
      });
      if (response.ok) {
        const newGroup = await response.json();
        setGroups([...groups, newGroup]);
        setNewGroupName('');
        setShowCreateGroup(false);
        toast.success('Group created successfully!');
        fetchUserGroups();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        toast.error(errorData.message || `Failed to create group (${response.status})`);
      }
    } catch { toast.error('Network error. Please check your connection.'); }
  };

  const handleJoinGroup = async (groupId: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Successfully joined group!');
        fetchUserGroups();
        fetchAvailableGroups();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send join request');
      }
    } catch { toast.error('Failed to send join request'); }
  };

  const handleShowMembers = async (groupId: string, groupName: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setGroupMembers(await response.json());
        setShowMembers({ id: groupId, name: groupName });
      } else toast.error('Failed to fetch members');
    } catch { toast.error('Failed to fetch members'); }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Delete "${groupName}"? This will remove all messages and members permanently.`)) return;
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        toast.success('Group deleted');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete group');
      }
    } catch { toast.error('Failed to delete group'); }
  };

  // Unique color per group based on name hash
  const groupAccent = (name: string) => {
    const palettes = [
      ['#FB8B24', '#DDAA52'],
      ['#A31818', '#CF0E0E'],
      ['#7C3AED', '#A78BFA'],
      ['#0EA5E9', '#38BDF8'],
      ['#10B981', '#34D399'],
    ];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palettes.length;
    return palettes[h];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight"
            style={{ background: 'linear-gradient(90deg, #FB8B24, #DDAA52)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Group Planning
          </h2>
          <p className="text-white/40 text-sm mt-1">Coordinate events with your crew</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinGroup(v => !v)}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200"
            style={{ background: 'rgba(163,24,24,0.15)', border: '1px solid rgba(207,14,14,0.35)', color: '#ff6b6b' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(163,24,24,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(163,24,24,0.15)')}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Join Group
          </button>
          <button
            onClick={() => setShowCreateGroup(v => !v)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #FB8B24, #DDAA52)', color: '#0a0a0a', boxShadow: '0 0 20px rgba(251,139,36,0.35)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px rgba(251,139,36,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(251,139,36,0.35)')}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Group
          </button>
        </div>
      </div>

      {/* Create Group Panel */}
      {showCreateGroup && (
        <div style={{ background: 'rgba(15,15,15,0.85)', border: '1px solid rgba(251,139,36,0.25)', backdropFilter: 'blur(16px)', borderRadius: 20 }}
          className="p-6">
          <p className="text-white/70 text-sm font-medium mb-3 uppercase tracking-widest">New Group</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
              placeholder="Enter a group name…"
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm outline-none focus:ring-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(251,139,36,0.2)', color: 'white' }}
            />
            <button onClick={handleCreateGroup}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #FB8B24, #DDAA52)', color: '#0a0a0a' }}>
              Create
            </button>
            <button onClick={() => setShowCreateGroup(false)}
              className="px-4 py-2.5 rounded-xl text-white/60 text-sm hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Join Group Panel */}
      {showJoinGroup && (
        <div style={{ background: 'rgba(15,15,15,0.85)', border: '1px solid rgba(207,14,14,0.25)', backdropFilter: 'blur(16px)', borderRadius: 20 }}
          className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest">Available Groups</p>
            <button onClick={() => setShowJoinGroup(false)}
              className="text-white/40 hover:text-white transition-colors text-xs">✕ Close</button>
          </div>
          {availableGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableGroups.map(group => {
                const [c1, c2] = groupAccent(group.name);
                return (
                  <div key={group.id} className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, color: '#0a0a0a' }}>
                        {group.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{group.name}</p>
                        <p className="text-white/40 text-xs">{group.members?.length || 0} members</p>
                      </div>
                    </div>
                    <button onClick={() => handleJoinGroup(group.id)}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }}>
                      Join
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/40 text-center py-6 text-sm">No available groups to join right now</p>
          )}
        </div>
      )}

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: '#FB8B24', borderRightColor: '#DDAA52' }} />
        </div>
      ) : groups.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(251,139,36,0.08)', border: '1px solid rgba(251,139,36,0.18)' }}>
              <svg width="36" height="36" fill="none" stroke="#FB8B24" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Groups Yet</h3>
          <p className="text-white/40 text-sm max-w-xs mb-6">Create your first group to start planning events with friends.</p>
          <button onClick={() => setShowCreateGroup(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #FB8B24, #DDAA52)', color: '#0a0a0a', boxShadow: '0 0 24px rgba(251,139,36,0.4)' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create a Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map(group => {
            const [c1, c2] = groupAccent(group.name);
            return (
              <div key={group.id}
                className="relative overflow-hidden rounded-3xl p-5 flex flex-col gap-4 transition-all duration-300 group/card"
                style={{
                  background: 'rgba(12,12,12,0.8)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 0 0 0 ${c1}00`,
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 32px ${c1}30, inset 0 0 0 1px ${c1}40`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 transparent')}
              >
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
                  style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />

                {/* Group identity */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0"
                    style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}22)`, border: `1px solid ${c1}44`, color: c1 }}>
                    {group.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-base truncate">{group.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: c1 }} />
                      <span className="text-white/40 text-xs">{group.members?.length || 0} members</span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-white/40 text-xs">{group.shared_events?.length || 0} events</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => setActiveChat({ id: group.id, name: group.name })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200"
                    style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}22)`, border: `1px solid ${c1}33`, color: c1 }}
                    onMouseEnter={e => (e.currentTarget.style.background = `linear-gradient(135deg, ${c1}44, ${c2}44)`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `linear-gradient(135deg, ${c1}22, ${c2}22)`)}
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Chat
                  </button>
                  <button
                    onClick={() => handleShowMembers(group.id, group.name)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Members
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id, group.name)}
                    className="flex items-center justify-center w-10 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 shrink-0"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.7)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; }}
                    title="Delete group"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeChat && (
        <GroupChat groupId={activeChat.id} groupName={activeChat.name} onClose={() => setActiveChat(null)} />
      )}

      {/* Members Modal */}
      {showMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: 'rgba(12,12,12,0.95)', border: '1px solid rgba(251,139,36,0.2)', boxShadow: '0 0 60px rgba(251,139,36,0.1)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Members</p>
                <h3 className="text-white font-bold text-lg">{showMembers.name}</h3>
              </div>
              <button onClick={() => setShowMembers(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {groupMembers.map((member, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #FB8B24, #DDAA52)', color: '#0a0a0a' }}>
                        {member.name[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-white font-medium text-sm">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
