import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  avatar?: string | null;
}

interface GroupChatProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

export default function GroupChat({ groupId, groupName, onClose }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getCurrentUser = () => {
    const stored = JSON.parse(sessionStorage.getItem('user') || '{}');
    const first = stored.firstName || stored.first_name || '';
    const last = stored.lastName || stored.last_name || '';
    return {
      name: (first || last) ? `${first} ${last}`.trim() : stored.email?.split('@')[0] || 'Me',
      id: stored.id || null,
    };
  };

  useEffect(() => {
    fetchMessages();
    fetchMemberCount();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMemberCount = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMemberCount(data.length);
      }
    } catch {}
  };

  const fetchMessages = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/groups/${groupId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setMessages(await res.json());
    } catch {}
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;
    setLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: newMessage.trim() })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      } else {
        toast.error('Failed to send message');
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const avatarColor = (name: string) => {
    const colors = ['#FB8B24', '#A31818', '#7C3AED', '#0EA5E9', '#10B981', '#DDAA52'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
    return colors[h];
  };

  const currentUser = getCurrentUser();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl flex flex-col"
        style={{
          height: 600,
          background: 'rgba(10,10,10,0.95)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24,
          overflow: 'hidden',
        }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #FB8B24, #DDAA52)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" fill="none" stroke="#0a0a0a" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>{groupName}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>{memberCount} members</p>
            </div>
          </div>
          <button onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: 'rgba(251,139,36,0.08)', border: '1px solid rgba(251,139,36,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" fill="none" stroke="#FB8B24" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isMine = msg.userId === currentUser.id || msg.username === currentUser.name;
            const showAvatar = !isMine && (i === 0 || messages[i - 1]?.userId !== msg.userId);
            const showName = !isMine && showAvatar;
            const color = avatarColor(msg.username || '');

            return (
              <div key={msg.id || i} style={{
                display: 'flex',
                flexDirection: isMine ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 8,
                marginTop: showName ? 12 : 2,
              }}>
                {/* Avatar slot — always reserve space for alignment */}
                {!isMine && (
                  <div style={{ width: 32, height: 32, flexShrink: 0 }}>
                    {showAvatar && (
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, overflow: 'hidden',
                        background: color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {msg.avatar ? (
                          <img
                            src={msg.avatar}
                            alt={msg.username}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => {
                              const el = e.currentTarget;
                              el.style.display = 'none';
                              const fallback = el.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span style={{
                          color: '#fff', fontSize: 12, fontWeight: 700,
                          display: msg.avatar ? 'none' : 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          width: '100%', height: '100%',
                        }}>
                          {(msg.username || '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div style={{
                  maxWidth: '68%', display: 'flex', flexDirection: 'column', gap: 2,
                  alignItems: isMine ? 'flex-end' : 'flex-start',
                }}>
                  {showName && (
                    <span style={{ color, fontSize: 11, fontWeight: 600, paddingLeft: 4 }}>
                      {msg.username}
                    </span>
                  )}
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMine
                      ? 'linear-gradient(135deg, #FB8B24, #DDAA52)'
                      : 'rgba(255,255,255,0.07)',
                    border: isMine ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <p style={{
                      margin: 0, fontSize: 13, lineHeight: 1.5,
                      color: isMine ? '#0a0a0a' : 'rgba(255,255,255,0.85)',
                      fontWeight: isMine ? 500 : 400,
                      wordBreak: 'break-word',
                    }}>{msg.text}</p>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, paddingLeft: 4, paddingRight: 4 }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 10, alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Send a message…"
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 14, fontSize: 13,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white', outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading}
            style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0, border: 'none',
              background: newMessage.trim() && !loading
                ? 'linear-gradient(135deg, #FB8B24, #DDAA52)'
                : 'rgba(255,255,255,0.06)',
              cursor: newMessage.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
            <svg width="16" height="16" fill="none"
              stroke={newMessage.trim() && !loading ? '#0a0a0a' : 'rgba(255,255,255,0.3)'}
              strokeWidth="2" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
