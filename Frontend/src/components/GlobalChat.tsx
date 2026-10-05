import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config';

export default function GlobalChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef<Set<string>>(new Set());

  const getUser = () => {
    const stored = JSON.parse(sessionStorage.getItem('user') || '{}');
    const first = stored.firstName || stored.first_name || '';
    const last = stored.lastName || stored.last_name || '';
    return {
      name: (first || last) ? `${first} ${last}`.trim() : stored.email?.split('@')[0] || 'Anonymous',
      avatar: stored.avatarUrl || stored.profilePicture || stored.profile_picture || null,
      id: stored.id || null,
    };
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/chat/global/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          data.forEach(m => m.id && seenIds.current.add(String(m.id)));
          setMessages(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-global-chat');
    });

    socket.on('global-message-history', (history: any[]) => {
      setMessages(prev => {
        if (prev.length > 0) return prev;
        history.forEach(m => m.id && seenIds.current.add(String(m.id)));
        return history;
      });
    });

    socket.on('global-message', (data: any) => {
      setMessages(prev => {
        const id = String(data.id ?? '');
        if (id && seenIds.current.has(id)) return prev;
        if (id) seenIds.current.add(id);
        return [...prev, data];
      });
    });

    socket.on('global-online-count', (count: number) => setOnlineCount(count));
    socket.on('disconnect', () => setIsConnected(false));

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected || !socketRef.current) return;
    const token = sessionStorage.getItem('token');
    const { name, avatar } = getUser();
    socketRef.current.emit('send-global-message', {
      message: newMessage.trim(),
      user: name,
      avatar,
      token,
      timestamp: new Date().toISOString()
    });
    setNewMessage('');
  };

  const currentUser = getUser();

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  // Deterministic avatar bg color from name
  const avatarColor = (name: string) => {
    const colors = ['#FB8B24', '#A31818', '#7C3AED', '#0EA5E9', '#10B981', '#DDAA52'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
    return colors[h];
  };

  return (
    <div style={{
      background: 'rgba(10,10,10,0.9)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 24,
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      height: 600,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #FB8B24, #DDAA52)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="#0a0a0a" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>Global Chat</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>Everyone in Euforia</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '5px 12px',
          border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isConnected ? '#34d399' : '#f87171',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
            {onlineCount} online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'rgba(251,139,36,0.08)',
              border: '1px solid rgba(251,139,36,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" fill="none" stroke="#FB8B24" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.user === currentUser.name;
          const showAvatar = !isMine && (i === 0 || messages[i - 1]?.user !== msg.user);
          const showName = !isMine && showAvatar;
          const color = avatarColor(msg.user || '');

          return (
            <div key={msg.id || i} style={{
              display: 'flex',
              flexDirection: isMine ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: 8,
              marginTop: showName ? 12 : 2,
            }}>
              {/* Avatar — only for others, only on first of a run */}
              {!isMine && (
                <div style={{ width: 30, height: 30, flexShrink: 0 }}>
                  {showAvatar && (
                    <div style={{
                      width: 30, height: 30, borderRadius: 10, overflow: 'hidden',
                      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {msg.avatar ? (
                        <img src={msg.avatar} alt={msg.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{initials(msg.user || '')}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', gap: 2,
                alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                {showName && (
                  <span style={{ color: color, fontSize: 11, fontWeight: 600, paddingLeft: 4 }}>{msg.user}</span>
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
                  }}>{msg.message}</p>
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
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={isConnected ? 'Send a message…' : 'Connecting…'}
          disabled={!isConnected}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 14, fontSize: 13,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'white', outline: 'none',
            opacity: isConnected ? 1 : 0.5,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || !isConnected}
          style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: newMessage.trim() && isConnected
              ? 'linear-gradient(135deg, #FB8B24, #DDAA52)'
              : 'rgba(255,255,255,0.06)',
            border: 'none', cursor: newMessage.trim() && isConnected ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <svg width="16" height="16" fill="none" stroke={newMessage.trim() && isConnected ? '#0a0a0a' : 'rgba(255,255,255,0.3)'}
            strokeWidth="2" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
