import React, { useState, useEffect } from 'react';
import { OfflineService } from '../services/offlineService';

interface OfflineEventViewerProps {
  eventId: string;
  onClose: () => void;
}

export default function OfflineEventViewer({ eventId, onClose }: OfflineEventViewerProps) {
  const [eventData, setEventData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'map' | 'emergency' | 'wifi'>('details');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    const data = OfflineService.getOfflineEventDetails(eventId);
    setEventData(data);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [eventId]);

  if (!eventData) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-[#171717] rounded-3xl p-8 text-center">
          <p className="text-[#FFFFFF]">Event not available offline</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-[#FB8B24] text-black rounded-xl">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto bg-[#171717] rounded-3xl border border-[#DDAA52]/30">
          {/* Header */}
          <div className="p-6 border-b border-[#DDAA52]/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#FFFFFF]">{eventData.title}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  {isOffline && (
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                      Offline Mode
                    </span>
                  )}
                  <span className="text-[#FFFFFF]/70">
                    {new Date(eventData.date).toLocaleDateString()} at {eventData.time}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#FFFFFF]/70 hover:text-[#FFFFFF] hover:bg-[#DDAA52]/10 rounded-xl"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#DDAA52]/30">
            {[
              { id: 'details', label: 'Event Details', icon: '📋' },
              { id: 'map', label: 'Venue Map', icon: '🗺️' },
              { id: 'emergency', label: 'Emergency Info', icon: '🚨' },
              { id: 'wifi', label: 'WiFi & Services', icon: '📶' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#FB8B24] border-b-2 border-[#FB8B24]'
                    : 'text-[#FFFFFF]/70 hover:text-[#FFFFFF]'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Description</h3>
                  <p className="text-[#FFFFFF]/80">{eventData.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Location</h3>
                  <p className="text-[#FFFFFF]/80">{eventData.location.name}</p>
                  <p className="text-[#FFFFFF]/60">{eventData.location.address}</p>
                </div>

                {eventData.ticketCode && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Ticket Code</h3>
                    <div className="bg-[#FB8B24]/10 border border-[#FB8B24]/30 rounded-xl p-4">
                      <p className="text-[#FB8B24] font-mono text-lg">{eventData.ticketCode}</p>
                      <p className="text-[#FFFFFF]/60 text-sm mt-1">Show this code at the venue</p>
                    </div>
                  </div>
                )}

                {eventData.flyerData && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Event Flyer</h3>
                    <img src={eventData.flyerData} alt="Event flyer" className="rounded-xl max-w-full" />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'map' && eventData.venueMap && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">Venue Maps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventData.venueMap.overviewMapBase64 && (
                      <div>
                        <h4 className="text-[#FFFFFF]/80 mb-2">Overview Map</h4>
                        <img src={eventData.venueMap.overviewMapBase64} alt="Overview map" className="w-full rounded-xl" />
                      </div>
                    )}
                    {eventData.venueMap.detailMapBase64 && (
                      <div>
                        <h4 className="text-[#FFFFFF]/80 mb-2">Detailed Map</h4>
                        <img src={eventData.venueMap.detailMapBase64} alt="Detailed map" className="w-full rounded-xl" />
                      </div>
                    )}
                  </div>
                </div>

                {eventData.venueMap.venueLayout && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Venue Layout</h3>
                    <div className="bg-[#171717]/50 rounded-xl p-4 space-y-2">
                      <p className="text-[#FFFFFF]/80"><strong>Floors:</strong> {eventData.venueMap.venueLayout.floors?.join(', ')}</p>
                      <p className="text-[#FFFFFF]/80"><strong>Main Stage:</strong> {eventData.venueMap.venueLayout.mainStage}</p>
                      <p className="text-[#FFFFFF]/80"><strong>Capacity:</strong> {eventData.venueMap.venueLayout.capacity}</p>
                    </div>
                  </div>
                )}

                {eventData.venueMap.parkingInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Parking Information</h3>
                    <div className="bg-[#171717]/50 rounded-xl p-4 space-y-2">
                      <p className="text-[#FFFFFF]/80"><strong>On-site:</strong> {eventData.venueMap.parkingInfo.onSite}</p>
                      <p className="text-[#FFFFFF]/80"><strong>Nearby options:</strong></p>
                      <ul className="list-disc list-inside text-[#FFFFFF]/70 ml-4">
                        {eventData.venueMap.parkingInfo.nearby?.map((option: string, index: number) => (
                          <li key={index}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'emergency' && eventData.emergencyInfo && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">Emergency Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <h4 className="text-red-400 font-semibold mb-2">Emergency Contacts</h4>
                      <p className="text-[#FFFFFF]/80">Emergency: {eventData.emergencyInfo.emergencyNumber}</p>
                      <p className="text-[#FFFFFF]/80">Security: {eventData.emergencyInfo.securityContact}</p>
                      <p className="text-[#FFFFFF]/80">Venue: {eventData.emergencyInfo.venueContact}</p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <h4 className="text-blue-400 font-semibold mb-2">Medical Station</h4>
                      <p className="text-[#FFFFFF]/80">{eventData.emergencyInfo.medicalStation}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[#FFFFFF] font-semibold mb-2">Emergency Exits</h4>
                  <ul className="list-disc list-inside text-[#FFFFFF]/80 space-y-1">
                    {eventData.emergencyInfo.emergencyExits?.map((exit: string, index: number) => (
                      <li key={index}>{exit}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[#FFFFFF] font-semibold mb-2">Facilities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#FFFFFF]/80"><strong>Restrooms:</strong></p>
                      <ul className="list-disc list-inside text-[#FFFFFF]/70 ml-4">
                        {eventData.emergencyInfo.restrooms?.map((restroom: string, index: number) => (
                          <li key={index}>{restroom}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[#FFFFFF]/80"><strong>Charging Stations:</strong></p>
                      <ul className="list-disc list-inside text-[#FFFFFF]/70 ml-4">
                        {eventData.emergencyInfo.chargingStations?.map((station: string, index: number) => (
                          <li key={index}>{station}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wifi' && eventData.wifiInfo && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">WiFi Networks</h3>
                  <div className="space-y-3">
                    {eventData.wifiInfo.networks?.map((network: any, index: number) => (
                      <div key={index} className="bg-[#171717]/50 border border-[#DDAA52]/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-[#FFFFFF] font-semibold">{network.name}</h4>
                            <p className="text-[#FFFFFF]/60">Speed: {network.speed}</p>
                          </div>
                          {network.password && (
                            <div className="text-right">
                              <p className="text-[#FFFFFF]/80">Password:</p>
                              <p className="text-[#FB8B24] font-mono">{network.password}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[#FFFFFF] font-semibold mb-2">Coverage & Limits</h4>
                  <div className="bg-[#171717]/50 rounded-xl p-4 space-y-2">
                    <p className="text-[#FFFFFF]/80"><strong>Coverage:</strong> {eventData.wifiInfo.coverage}</p>
                    <p className="text-[#FFFFFF]/80"><strong>Data Limits:</strong> {eventData.wifiInfo.dataLimits}</p>
                    <p className="text-[#FFFFFF]/80"><strong>Troubleshooting:</strong> {eventData.wifiInfo.troubleshooting}</p>
                  </div>
                </div>

                {eventData.offlineDirections && (
                  <div>
                    <h4 className="text-[#FFFFFF] font-semibold mb-2">Offline Directions</h4>
                    <div className="bg-[#171717]/50 rounded-xl p-4 space-y-2">
                      <p className="text-[#FFFFFF]/80"><strong>Walking:</strong> {eventData.offlineDirections.walkingDirections}</p>
                      <p className="text-[#FFFFFF]/80"><strong>Public Transport:</strong> {eventData.offlineDirections.publicTransport}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}