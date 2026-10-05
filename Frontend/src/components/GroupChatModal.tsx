import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config';

interface GroupChatModalProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string | number;
  user: string;
  message: string;
  avatar: string | null;
  timestamp: string;
  time: string;
}

export default function GroupChatModal({ onClose }: GroupChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const abusiveWords = [
    'slut', 'whore', 'bitch', 'cunt', 'fuck you', 'asshole', 'bastard', 'damn you',
    'stupid', 'idiot', 'moron', 'retard', 'kill yourself', 'die', 'hate you',
    'ugly', 'fat', 'loser', 'worthless', 'pathetic', 'disgusting'
  ];

  const checkForAbusiveContent = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return abusiveWords.some(word => lowerMessage.includes(word));
  };

  useEffect(() => {
    // Get user info from stored user object (JWT payload does not contain name fields)
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const firstName = storedUser.firstName || storedUser.first_name || '';
    const lastName = storedUser.lastName || storedUser.last_name || '';
    const resolvedName = (firstName || lastName)
      ? `${firstName} ${lastName}`.trim()
      : storedUser.email?.split('@')[0] || 'Anonymous';
    setUserName(resolvedName);

    const socket = io(API_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-global-chat');
    });

    socket.on('global-message-history', (messages) => {
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        user: msg.user,
        message: msg.message,
        avatar: msg.avatar,
        timestamp: msg.timestamp,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(formattedMessages);
    });

    socket.on('global-message', (data) => {
      setMessages(prev => [...prev, {
        id: data.id || Date.now(),
        user: data.user,
        message: data.message,
        avatar: data.avatar,
        timestamp: data.timestamp || new Date().toISOString(),
        time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    });

    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current && isConnected) {
      // Check for abusive content
      if (checkForAbusiveContent(newMessage)) {
        const newWarningCount = warningCount + 1;
        setWarningCount(newWarningCount);
        setShowWarning(true);
        
        if (newWarningCount >= 3) {
          // Block account after 3 warnings
          alert('Your account has been temporarily suspended for violating community guidelines.');
          onClose();
          return;
        }
        
        setTimeout(() => setShowWarning(false), 5000);
        setNewMessage('');
        return;
      }
      
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const avatar = user.avatarUrl || user.profile_picture || null;
      socketRef.current.emit('send-global-message', {
        user: userName || 'Anonymous',
        message: newMessage.trim(),
        avatar: avatar,
        token: token,
        timestamp: new Date().toISOString()
      });
      setNewMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 w-full max-w-md h-96 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#DDAA52]/30">
          <div className="flex items-center space-x-2">
            <h3 className="text-[#FFFFFF] font-bold">Global Chat</h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
          <button onClick={onClose} className="text-[#FFFFFF]/70 hover:text-[#FFFFFF]">×</button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-[#FFFFFF]/50 text-sm mt-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex items-start space-x-2 ${msg.user === userName ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {msg.avatar && msg.avatar !== 'null' && msg.avatar !== '' ? (
                    <img 
                      src={msg.avatar} 
                      alt={msg.user} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#A31818] to-[#CF0E0E] rounded-full flex items-center justify-center">
                      <span className="text-[#FFFFFF] text-xs font-bold">
                        {msg.user?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${msg.user === userName ? 'bg-[#FB8B24] text-black' : 'bg-[#171717] border border-[#DDAA52]/30 text-[#FFFFFF]'}`}>
                  <p className="text-sm font-medium">{msg.user}</p>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-[#DDAA52]/30">
          {showWarning && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm font-medium">
                ⚠️ Warning {warningCount}/3: Please be respectful and avoid abusive language.
                {warningCount === 2 && ' One more violation will result in account suspension.'}
              </p>
            </div>
          )}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-lg text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
            />
            <button
              onClick={sendMessage}
              className="bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black px-4 py-2 rounded-lg hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}