import React, { useEffect, useRef, useState } from 'react';

interface EventLocationMapProps {
  event: {
    title: string;
    latitude?: number | null;
    longitude?: number | null;
    location?: {
      name: string;
      address: string;
      latitude?: number;
      longitude?: number;
    };
    location_name?: string;
    location_address?: string;
  };
  onMapReady?: (mapImageUrl: string) => void;
}

export default function EventLocationMap({ event: eventData, onMapReady }: EventLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapImageUrl, setMapImageUrl] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Resolve coords from either nested location object or flat columns
  const getCoords = () => ({
    lat: parseFloat(String(eventData.location?.latitude || eventData.latitude || 0)) || 0,
    lng: parseFloat(String(eventData.location?.longitude || eventData.longitude || 0)) || 0,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => setUserLocation(null)
      );
    }
  }, []);

  useEffect(() => {
    const { lat, lng } = getCoords();

    if (lat === 0 && lng === 0) {
      setMapImageUrl('');
      return;
    }

    setMapImageUrl('custom-map');
    if (onMapReady) onMapReady('custom-map');
  }, [eventData, onMapReady, userLocation]);

  const openDirections = () => {
    const { lat, lng } = getCoords();
    const url = userLocation
      ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}/data=!3m1!4b1!4m2!4m1!3e0`
      : `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},15z`;
    window.open(url, '_blank');
  };

  const { lat: eventLat, lng: eventLng } = getCoords();
  const hasCoords = eventLat !== 0 || eventLng !== 0;

  const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  return (
    <div className="bg-gradient-to-br from-[#171717] to-[#171717]/80 rounded-xl border border-[#FB8B24]/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[#FB8B24] font-semibold flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Event Location
        </h4>
        {hasCoords && (
          <button
            onClick={openDirections}
            className="bg-[#FB8B24] text-black px-3 py-1 rounded text-xs font-medium hover:bg-[#DDAA52] transition-colors flex items-center"
            title={userLocation ? "Get Directions" : "View Location"}
          >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {userLocation ? 'Directions' : 'View on Map'}
          </button>
        )}
      </div>

      {mapImageUrl ? (
        <div className="w-full rounded-lg border border-[#DDAA52]/20 overflow-hidden">
          <img
            title="Event Location Map"
            width="100%"
            height="220"
            style={{ display: 'block', width: '100%', height: 220, objectFit: 'cover', cursor: 'pointer' }}
            src={`${API_BASE}/api/map/static?lat=${eventLat}&lng=${eventLng}`}
            alt="Event location map"
            onClick={openDirections}
            onError={(e) => {
              // Fallback to OpenStreetMap iframe if proxy fails
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                parent.innerHTML = `<iframe
                  title="Event Location Map"
                  width="100%"
                  height="220"
                  style="border:0;display:block;cursor:pointer"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=${eventLng - 0.01},${eventLat - 0.01},${eventLng + 0.01},${eventLat + 0.01}&layer=mapnik&marker=${eventLat},${eventLng}"
                ></iframe>`;
              }
            }}
          />
          {userLocation && (
            <div className="bg-[#171717]/90 p-3 border-t border-[#DDAA52]/20">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    You
                  </span>
                  <div className="w-6 h-0.5 bg-blue-500"></div>
                  <span className="flex items-center gap-1 text-[#FB8B24]">
                    <div className="w-2 h-2 bg-[#FB8B24] rounded-full"></div>
                    Event
                  </span>
                </div>
                <span className="text-white/50">
                  ~{((Math.abs(userLocation.lat - eventLat) + Math.abs(userLocation.lng - eventLng)) * 111).toFixed(1)} km away
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-48 bg-[#171717]/50 rounded-lg border border-[#DDAA52]/20 flex items-center justify-center">
          <div className="text-center text-[#FFFFFF]/60">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">No location coordinates available</p>
          </div>
        </div>
      )}

      <div className="mt-3">
        <div className="text-sm text-[#DDAA52] font-medium">
          {eventData.location?.name || eventData.location_name || 'Event Location'}
        </div>
        <div className="text-xs text-[#FFFFFF]/70">
          {eventData.location?.address || eventData.location_address || 'Address TBD'}
        </div>
        {hasCoords && (
          <div className="text-xs text-[#FFFFFF]/50 mt-1">
            {eventLat.toFixed(4)}, {eventLng.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
}
