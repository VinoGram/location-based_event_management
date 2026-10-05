import React from 'react';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    flyer_url?: string;
    date: string;
    location: string;
    price: number;
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      {/* Display flyer from Cloudinary URL */}
      <img 
        src={event.flyer_url || '/default-event.jpg'} 
        alt={event.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-white font-bold text-lg">{event.title}</h3>
        <p className="text-gray-300">{event.date}</p>
        <p className="text-gray-300">{event.location}</p>
        <p className="text-orange-500 font-bold">${event.price}</p>
      </div>
    </div>
  );
};

export default EventCard;