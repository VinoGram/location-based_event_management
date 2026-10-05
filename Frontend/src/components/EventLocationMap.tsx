import React, { useEffect, useRef, useState } from 'react';

interface EventLocationMapProps {
  event: {
    title: string;
    location?: {
      name: string;
      address: string;
      latitude: number;
      longitude: number;
    };
    location_name?: string;
    location_address?: string;
  };
  onMapReady?: (mapImageUrl: string) => void;
}

export default function EventLocationMap({ event, onMapReady }: EventLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapImageUrl, setMapImageUrl] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setUserLocation(null);
        }
      );
    }
  }, []);

  useEffect(() => {
    const eventLat = event.location?.latitude || 0;
    const eventLng = event.location?.longitude || 0;
    
    if (eventLat === 0 && eventLng === 0) {
      setMapImageUrl('');
      return;
    }

    // Only set map as ready when component mounts
    setMapImageUrl('custom-map');
    
    if (onMapReady) {
      onMapReady('custom-map');
    }
  }, [event, onMapReady, userLocation]);

  const downloadMap = () => {
    if (mapImageUrl) {
      // Open map in new window for screenshot
      const lat = event.location?.latitude || 0;
      const lng = event.location?.longitude || 0;
      let url;
      if (userLocation) {
        url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`;
      } else {
        url = `https://www.google.com/maps?q=${lat},${lng}`;
      }
      window.open(url, '_blank');
    }
  };

  const openInMaps = () => {
    const lat = event.location?.latitude || 0;
    const lng = event.location?.longitude || 0;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-[#171717] to-[#171717]/80 rounded-xl border border-[#FB8B24]/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[#FB8B24] font-semibold flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Event Location
        </h4>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const lat = event.location?.latitude || 0;
              const lng = event.location?.longitude || 0;
              let url;
              if (userLocation) {
                // Google Maps directions URL with proper routing
                url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}/data=!3m1!4b1!4m2!4m1!3e0`;
              } else {
                // Just show the event location
                url = `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},15z`;
              }
              window.open(url, '_blank');
            }}
            className="bg-[#FB8B24] text-black px-3 py-1 rounded text-xs font-medium hover:bg-[#DDAA52] transition-colors flex items-center"
            title={userLocation ? "Get Directions" : "View Location"}
          >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {userLocation ? 'Directions' : 'View on Map'}
          </button>
        </div>
      </div>
      
      {mapImageUrl ? (
        <div className="w-full h-64 rounded-lg border border-[#DDAA52]/20 bg-gradient-to-br from-[#171717] to-[#171717]/80 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FB8B24]/10 to-[#DDAA52]/10"></div>
          <div className="relative z-10 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-[#FB8B24]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div className="text-[#FFFFFF] font-semibold mb-2">Event Location</div>
            <div className="text-[#DDAA52] text-sm mb-2">{event.location?.name || event.location_name}</div>
            <div className="text-[#FFFFFF]/70 text-xs mb-4">{event.location?.address || event.location_address}</div>
            {userLocation && (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-[#FFFFFF]/70">Your Location</span>
                  </div>
                  <div className="w-8 h-0.5 bg-blue-500"></div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#FB8B24] rounded-full mr-2"></div>
                    <span className="text-[#FFFFFF]/70">Event</span>
                  </div>
                </div>
                <div className="bg-[#171717]/50 rounded-lg p-3 border border-[#DDAA52]/20">
                  <div className="text-xs text-[#FFFFFF]/70 mb-2">Route Preview:</div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mb-1"></div>
                      <div className="text-xs text-[#FFFFFF]/60">Start</div>
                    </div>
                    <div className="flex-1 mx-2 relative">
                      <div className="h-0.5 bg-blue-500 w-full"></div>
                      <div className="absolute top-0 left-1/4 w-1 h-1 bg-blue-400 rounded-full transform -translate-y-0.5"></div>
                      <div className="absolute top-0 left-2/4 w-1 h-1 bg-blue-400 rounded-full transform -translate-y-0.5"></div>
                      <div className="absolute top-0 left-3/4 w-1 h-1 bg-blue-400 rounded-full transform -translate-y-0.5"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-[#FB8B24] rounded-full mb-1"></div>
                      <div className="text-xs text-[#FFFFFF]/60">Event</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[#FFFFFF]/50">
                    Distance: ~{((Math.abs(userLocation.lat - (event.location?.latitude || 0)) + Math.abs(userLocation.lng - (event.location?.longitude || 0))) * 111).toFixed(1)} km
                  </div>
                  <div className="mt-2 text-xs text-[#FB8B24] font-medium">
                    📍 {event.location?.name || event.location_name}
                  </div>
                </div>
              </div>
            )}
          </div>
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
          {event.location?.name || event.location_name || 'Event Location'}
        </div>
        <div className="text-xs text-[#FFFFFF]/70">
          {event.location?.address || event.location_address || 'Address TBD'}
        </div>
        {event.location?.latitude && event.location?.longitude && (
          <div className="text-xs text-[#FFFFFF]/50 mt-1">
            Event: {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
            {userLocation && (
              <div>Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}