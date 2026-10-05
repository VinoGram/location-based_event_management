interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
  };
  hasTickets?: boolean;
  price?: number;
}

const formatDate = (date: Date) => {
  const d = isNaN(date.getTime()) ? new Date() : date;
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const buildEventDetails = (event: Event, ticketCode?: string) => {
  const rawDate = event.date && event.time ? new Date(`${event.date}T${event.time}`) : new Date();
  const startDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  return {
    title: event.title || 'Event',
    description: `${event.description || ''}${ticketCode ? `\n\nTicket Code: ${ticketCode}` : ''}${event.hasTickets ? `\nPrice: $${event.price}` : ''}`,
    location: `${event.location?.name || 'TBD'}, ${event.location?.address || ''}`,
    startTime: formatDate(startDate),
    endTime: formatDate(endDate),
    id: event._id || 'event',
  };
};

export const addToCalendar = (event: Event, ticketCode?: string) => {
  return {
    google: () => {
      const d = buildEventDetails(event, ticketCode);
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(d.title)}&dates=${d.startTime}/${d.endTime}&details=${encodeURIComponent(d.description)}&location=${encodeURIComponent(d.location)}`, '_blank');
    },
    apple: () => {
      const d = buildEventDetails(event, ticketCode);
      const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Euforia//Event//EN\nBEGIN:VEVENT\nUID:${d.id}@euforia.com\nDTSTAMP:${formatDate(new Date())}\nDTSTART:${d.startTime}\nDTEND:${d.endTime}\nSUMMARY:${d.title}\nDESCRIPTION:${d.description.replace(/\n/g, '\\n')}\nLOCATION:${d.location}\nEND:VEVENT\nEND:VCALENDAR`;
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${d.title}.ics`;
      link.click();
      URL.revokeObjectURL(url);
    },
    outlook: () => {
      const d = buildEventDetails(event, ticketCode);
      window.open(`https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(d.title)}&startdt=${d.startTime}&enddt=${d.endTime}&body=${encodeURIComponent(d.description)}&location=${encodeURIComponent(d.location)}`, '_blank');
    },
  };
};
