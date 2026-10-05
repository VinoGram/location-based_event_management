import React, { useState } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

interface CreateEventModalProps {
  onClose: () => void;
  onEventCreated: () => void;
}

export default function CreateEventModal({ onClose, onEventCreated }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    price: '',
    hasTickets: false
  });
  const [locationData, setLocationData] = useState<{name: string, address: string, latitude: number, longitude: number} | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string>('');

  const categories = ["Music", "Sports", "Food", "Art", "Business", "Technology", "Health", "Education", "Other"];

  const searchNearbyLocations = async (query: string = '') => {
    if (query.length < 2) return;

    try {
      // First search globally for exact user input
      let url = `https://nominatim.openstreetmap.org/search?format=json&limit=10&addressdetails=1&q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      let suggestions = data.map((item: any) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        
        return {
          name: query, // Use exact user input as location name
          address: item.display_name,
          latitude: lat,
          longitude: lon,
          distance: userLocation ? calculateDistance(userLocation.latitude, userLocation.longitude, lat, lon) : 0
        };
      });
      
      // Sort by relevance to user input first, then by distance
      suggestions = suggestions
        .sort((a: any, b: any) => {
          const aRelevance = a.name.toLowerCase().includes(query.toLowerCase()) ? 0 : 1;
          const bRelevance = b.name.toLowerCase().includes(query.toLowerCase()) ? 0 : 1;
          if (aRelevance !== bRelevance) return aRelevance - bRelevance;
          return a.distance - b.distance;
        })
        .slice(0, 8);
      
      setLocationSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to search locations:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getUserLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      setUserLocation(location);
      return location;
    } catch (error) {
      toast.error('Please enable location access to find nearby venues');
      return null;
    }
  };

  const selectLocation = (location: any) => {
    setLocationData(location);
    setFormData({...formData, location: location.name});
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use OpenStreetMap Nominatim for reverse geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.display_name) {
        const addressParts = data.display_name.split(',');
        const venueName = addressParts[0] || 'Current Location';
        const fullAddress = data.display_name;
        
        const locationInfo = {
          name: venueName.trim(),
          address: fullAddress,
          latitude,
          longitude
        };
        
        setLocationData(locationInfo);
        setFormData({...formData, location: venueName.trim()});
        setUserLocation({ latitude, longitude });
        toast.success('Location captured successfully!');
      } else {
        // Fallback to coordinates
        const locationInfo = {
          name: `GPS Location`,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          latitude,
          longitude
        };
        
        setLocationData(locationInfo);
        setFormData({...formData, location: 'GPS Location'});
        setUserLocation({ latitude, longitude });
        toast.success('GPS coordinates captured!');
      }
    } catch (error) {
      toast.error('Failed to get current location. Please enter manually.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      toast.error('Please log in to create events');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          location: locationData || { name: formData.location, address: formData.location, latitude: 0, longitude: 0 },
          price: formData.hasTickets ? parseFloat(formData.price) || 0 : 0
        })
      });

      if (response.ok) {
        toast.success('Event created successfully!');
        onEventCreated();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create event');
      }
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#FFFFFF] font-bold text-xl">Create New Event</h3>
            <button onClick={onClose} className="text-[#FFFFFF]/70 hover:text-[#FFFFFF] text-2xl">&times;</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Event Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24] h-24"
                placeholder="Describe your event"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({...formData, location: e.target.value});
                      searchNearbyLocations(e.target.value);
                    }}
                    onFocus={() => {
                      if (!userLocation) getUserLocation();
                      searchNearbyLocations(formData.location);
                    }}
                    className="w-full px-4 py-3 pr-12 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
                    placeholder="Type location name..."
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FB8B24] hover:text-[#DDAA52] transition-colors"
                    title="Use current location"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-[#171717] border border-[#DDAA52]/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectLocation(suggestion)}
                          className="w-full text-left px-4 py-3 text-[#FFFFFF] hover:bg-[#DDAA52]/10 transition-colors border-b border-[#DDAA52]/20 last:border-b-0"
                        >
                          <div className="flex items-start space-x-2">
                            <svg className="w-4 h-4 text-[#FB8B24] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#FFFFFF] truncate">{suggestion.name}</p>
                              <p className="text-xs text-[#FFFFFF]/60">{suggestion.distance?.toFixed(1)}km away</p>
                              <p className="text-xs text-[#FFFFFF]/40 truncate">{suggestion.address}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
                />
              </div>

              <div>
                <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Event Flyer</label>
              <div className="border-2 border-dashed border-[#DDAA52]/30 rounded-xl p-6 text-center">
                {flyerPreview ? (
                  <div className="space-y-3">
                    <img src={flyerPreview} alt="Flyer preview" className="max-h-48 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {setFlyerFile(null); setFlyerPreview('');}}
                      className="text-[#A31818] hover:text-[#CF0E0E] text-sm"
                    >
                      Remove flyer
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="w-12 h-12 text-[#DDAA52]/50 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-[#FFFFFF]/70 mb-2">Upload event flyer</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFlyerFile(file);
                          setFlyerPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                      id="flyer-upload"
                    />
                    <label
                      htmlFor="flyer-upload"
                      className="inline-block bg-[#DDAA52]/20 text-[#DDAA52] px-4 py-2 rounded-lg cursor-pointer hover:bg-[#DDAA52]/30 transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.hasTickets}
                  onChange={(e) => setFormData({...formData, hasTickets: e.target.checked})}
                  className="w-4 h-4 text-[#FB8B24] focus:ring-[#FB8B24] border-[#DDAA52]/30 rounded"
                />
                <span className="text-[#FFFFFF] text-sm">This is a paid event</span>
              </label>

              {formData.hasTickets && (
                <div>
                  <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Ticket Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 px-6 rounded-xl font-semibold hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all"
              >
                Create Event
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#171717] text-[#FFFFFF] py-3 px-6 rounded-xl font-semibold hover:bg-[#171717]/80 transition-all border border-[#DDAA52]/30"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}