import React, { useState } from 'react';
import { addToCalendar } from '../utils/calendarIntegration';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: {
    name: string;
    address: string;
  };
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

  const getCalendar = () => addToCalendar(event, ticketCode);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={compact
          ? `w-full flex flex-col items-center justify-center py-3 rounded-xl text-xs font-medium transition-all border bg-[#171717] text-white/60 border-white/10 hover:border-[#FB8B24]/40 hover:text-[#FB8B24]`
          : `flex items-center space-x-2 px-4 py-2 bg-[#FB8B24] text-black rounded-xl font-medium hover:bg-[#DDAA52] transition-all`
        }
      >
        <svg className={compact ? 'w-5 h-5 mb-1' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        {compact ? 'Calendar' : <><span>Add to Calendar</span><svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></>}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#171717] border border-[#DDAA52]/30 rounded-xl shadow-lg z-10">
          <button
            onClick={() => { getCalendar().google(); setIsOpen(false); }}
            className="w-full px-4 py-3 text-left text-[#FFFFFF] hover:bg-[#FB8B24]/10 transition-colors flex items-center space-x-3 rounded-t-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google Calendar</span>
          </button>
          
          <button
            onClick={() => { getCalendar().apple(); setIsOpen(false); }}
            className="w-full px-4 py-3 text-left text-[#FFFFFF] hover:bg-[#FB8B24]/10 transition-colors flex items-center space-x-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span>Apple Calendar</span>
          </button>
          
          <button
            onClick={() => { getCalendar().outlook(); setIsOpen(false); }}
            className="w-full px-4 py-3 text-left text-[#FFFFFF] hover:bg-[#FB8B24]/10 transition-colors flex items-center space-x-3 rounded-b-xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.83 0-.87.33-1.69.33-.81.95-1.52.62-.7 1.57-1.13.95-.43 2.25-.43h2.9v2.4h-1.08q-.18 0-.37.03-.19.03-.39.12-.2.08-.36.25-.17.16-.26.42-.08.25-.08.58zm4.02-6.82q.33 0 .49.26.16.25.16.69v.95q-.53-.02-1.146-.02-.6 0-1.25.07-.65.06-1.31.2-.65.13-1.25.35-.6.21-1.09.52-.49.3-.85.74-.36.43-.57.97-.21.53-.21 1.18 0 .48.13.93.14.45.37.85.23.4.56.73.33.32.71.54.4.21.81.34.42.12.81.17.4.05.74.05.33 0 .53-.05v.4q0 .41-.15.72-.15.3-.4.5-.25.2-.56.29-.32.08-.65.08-.96 0-1.67-.48-.72-.49-1.23-1.22-.51-.73-.79-1.62-.27-.88-.27-1.73 0-.8.25-1.57.24-.78.68-1.46.43-.68 1.01-1.22.58-.54 1.26-.92.68-.39 1.39-.61.7-.22 1.38-.29.67-.08 1.26-.08z"/>
            </svg>
            <span>Outlook</span>
          </button>
        </div>
      )}
    </div>
  );
}