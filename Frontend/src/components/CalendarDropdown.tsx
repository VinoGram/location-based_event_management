import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { addToCalendar } from '../utils/calendarIntegration';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: { name: string; address: string; };
  hasTickets?: boolean;
  price?: number;
}

interface CalendarDropdownProps {
  event: Event;
  ticketCode?: string;
  compact?: boolean;
}

export default function CalendarDropdown({ event, ticketCode, compact }: CalendarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const getCalendar = () => addToCalendar(event, ticketCode);

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isOpen]);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }
    setIsOpen(p => !p);
  };

  const dropdown = isOpen ? createPortal(
    <div
      style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
      className="w-48 bg-[#171717] border border-[#DDAA52]/30 rounded-xl shadow-2xl"
    >
      <button onClick={() => { getCalendar().google(); setIsOpen(false); }}
        className="w-full px-4 py-3 text-left text-white hover:bg-[#FB8B24]/10 transition-colors flex items-center space-x-3 rounded-t-xl">
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span className="text-sm">Google</span>
      </button>
      <button onClick={() => { getCalendar().apple(); setIsOpen(false); }}
        className="w-full px-4 py-3 text-left text-white hover:bg-[#FB8B24]/10 transition-colors flex items-center space-x-3">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        <span className="text-sm">Apple</span>
      </button>
      <button onClick={() => { getCalendar().outlook(); setIsOpen(false); }}
        className="w-full px-4 py-3 text-left text-white hover:bg-[#FB8B24]/10 transition-colors flex items-center space-x-3 rounded-b-xl">
        <svg className="w-5 h-5 flex-shrink-0" fill="#0078D4" viewBox="0 0 24 24">
          <path d="M24 7.387v13.276L18.73 24l-9.244-1.54V24L0 22.22V1.78L9.486 0v1.54L18.73 0 24 2.613v4.774zM9.486 2.386L1.386 3.88v16.24l8.1 1.494V2.386zm1.386 1.848v15.532l10.742 1.848V3.386L10.872 4.234zm-1.386 4.08v1.386H3.08V8.314h6.406zm0 2.772v1.386H3.08v-1.386h6.406zm0 2.772v1.386H3.08v-1.386h6.406z"/>
        </svg>
        <span className="text-sm">Outlook</span>
      </button>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={compact
          ? `w-full flex flex-col items-center justify-center py-3 rounded-xl text-xs font-medium transition-all border bg-[#171717] text-white/60 border-white/10 hover:border-[#FB8B24]/40 hover:text-[#FB8B24] ${isOpen ? 'border-[#FB8B24]/40 text-[#FB8B24]' : ''}`
          : `flex items-center space-x-2 px-4 py-2 bg-[#FB8B24] text-black rounded-xl font-medium hover:bg-[#DDAA52] transition-all`
        }
      >
        <svg className={compact ? 'w-5 h-5 mb-1' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        {compact ? 'Save' : <><span>Add to Calendar</span><svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></>}
      </button>
      {dropdown}
    </div>
  );
}
