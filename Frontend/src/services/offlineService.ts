export class OfflineService {
  private static readonly STORAGE_KEY = 'offline_events';
  private static readonly MAP_CACHE_KEY = 'cached_maps';
  private static readonly VENUE_MAPS_KEY = 'venue_maps';
  private static readonly EMERGENCY_INFO_KEY = 'emergency_info';

  static async downloadEventForOffline(event: any): Promise<boolean> {
    try {
      // Download comprehensive venue data
      const venueMapData = await this.downloadVenueMap(event.location);
      const emergencyInfo = await this.getEmergencyInfo(event.location);
      const offlineDirections = await this.getOfflineDirections(event.location);
      
      // Store event data with offline capabilities
      const offlineEvents = this.getOfflineEvents();
      offlineEvents[event._id] = {
        ...event,
        downloadedAt: new Date().toISOString(),
        venueMap: venueMapData,
        emergencyInfo,
        offlineDirections,
        ticketCode: this.generateTicketCode(event),
        calendarData: this.generateOfflineCalendarData(event),
        wifiInfo: await this.getVenueWifiInfo(event.location)
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offlineEvents));
      
      // Cache images and maps
      if (event.flyerUrl) {
        await this.cacheImage(event.flyerUrl);
      }
      
      // Cache venue maps separately for quick access
      this.cacheVenueMap(event._id, venueMapData);
      
      return true;
    } catch (error) {
      console.error('Failed to download event for offline:', error);
      return false;
    }
  }

  static getOfflineEvents(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  static isEventOfflineAvailable(eventId: string): boolean {
    const offlineEvents = this.getOfflineEvents();
    return !!offlineEvents[eventId];
  }

  static removeOfflineEvent(eventId: string): void {
    const offlineEvents = this.getOfflineEvents();
    delete offlineEvents[eventId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offlineEvents));
  }

  private static async downloadVenueMap(location: any): Promise<any> {
    try {
      const mapData = {
        coordinates: { lat: location.latitude, lng: location.longitude },
        address: location.address,
        name: location.name,
        // Multiple zoom levels for different use cases
        overviewMap: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=14&size=800x600&maptype=roadmap&markers=color:red%7C${location.latitude},${location.longitude}`,
        detailMap: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=18&size=800x600&maptype=roadmap&markers=color:red%7C${location.latitude},${location.longitude}`,
        satelliteMap: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=18&size=800x600&maptype=satellite&markers=color:red%7C${location.latitude},${location.longitude}`,
        streetView: `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${location.latitude},${location.longitude}&heading=0&pitch=0`,
        // Venue layout information
        venueLayout: await this.getVenueLayout(location),
        nearbyLandmarks: await this.getNearbyLandmarks(location),
        parkingInfo: await this.getParkingInfo(location),
        publicTransport: await this.getPublicTransportInfo(location)
      };
      
      // Download and cache map images as base64 for offline use
      mapData.overviewMapBase64 = await this.downloadImageAsBase64(mapData.overviewMap);
      mapData.detailMapBase64 = await this.downloadImageAsBase64(mapData.detailMap);
      
      return mapData;
    } catch (error) {
      console.error('Failed to download venue map:', error);
      return { coordinates: { lat: location.latitude, lng: location.longitude }, address: location.address };
    }
  }

  private static async cacheImage(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        localStorage.setItem(`cached_image_${btoa(url)}`, base64);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to cache image:', error);
    }
  }

  private static async downloadImageAsBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to download image as base64:', error);
      return null;
    }
  }

  private static async getEmergencyInfo(location: any): Promise<any> {
    return {
      emergencyExits: ['Main entrance', 'Side exit near stage', 'Back exit', 'Emergency exit - East wing'],
      medicalStation: 'Near main entrance - First Aid tent',
      securityContact: '+1-555-SECURITY',
      emergencyNumber: '911',
      venueContact: '+1-555-VENUE',
      wifiNetworks: ['VenueFree', 'EventGuest', 'Emergency-WiFi'],
      wifiPasswords: { 'VenueFree': 'guest2024', 'EventGuest': 'event123' },
      chargingStations: ['Main lobby', 'Food court', 'VIP lounge'],
      restrooms: ['Level 1 - Main hall', 'Level 2 - Balcony', 'Accessible - Ground floor'],
      foodCourt: 'Level 1 - West wing',
      merchandise: 'Main entrance lobby',
      lostAndFound: 'Security desk - Main entrance',
      accessibility: {
        wheelchairAccess: 'All levels accessible via elevator',
        hearingLoop: 'Available in main auditorium',
        signLanguage: 'Interpreter available upon request'
      }
    };
  }

  private static async getOfflineDirections(location: any): Promise<any> {
    return {
      walkingDirections: `Navigate to ${location.address}. Look for the main entrance with event signage.`,
      drivingDirections: `Drive to ${location.address}. Parking available in designated areas.`,
      publicTransport: 'Take Metro Line 2 to Central Station, then Bus 45 to venue',
      landmarks: ['Near City Hall', 'Opposite Central Park', 'Next to Metro Station'],
      estimatedTimes: {
        walking: '15 minutes from metro',
        driving: '25 minutes from downtown',
        publicTransport: '35 minutes total'
      }
    };
  }

  private static async getVenueLayout(location: any): Promise<any> {
    return {
      floors: ['Ground Floor', 'Level 1', 'Level 2'],
      mainStage: 'Ground Floor - Center',
      bars: ['Ground Floor - East', 'Level 1 - West', 'Level 2 - VIP'],
      restrooms: ['Each floor - North and South wings'],
      exits: ['Main - Ground Floor', 'Emergency - Each floor'],
      elevators: ['North wing', 'South wing'],
      capacity: 5000,
      seatingChart: 'Available at venue entrance'
    };
  }

  private static async getNearbyLandmarks(location: any): Promise<string[]> {
    return [
      'City Hall - 0.2 miles north',
      'Central Park - 0.3 miles east',
      'Metro Station - 0.1 miles south',
      'Shopping Center - 0.4 miles west',
      'Hospital - 0.8 miles northeast'
    ];
  }

  private static async getParkingInfo(location: any): Promise<any> {
    return {
      onSite: 'Limited spaces - $20/day',
      nearby: [
        'City Parking Garage - 2 blocks - $15/day',
        'Street parking - Free after 6pm',
        'Mall parking - 3 blocks - $10/day'
      ],
      valet: 'Available - $30',
      accessibility: 'Handicap spaces available near main entrance'
    };
  }

  private static async getPublicTransportInfo(location: any): Promise<any> {
    return {
      metro: 'Line 2 - Central Station (0.1 miles)',
      bus: 'Routes 45, 67, 89 - Main Street stop',
      taxi: 'Uber/Lyft pickup zone at main entrance',
      bike: 'Bike racks available at venue entrance'
    };
  }

  private static async getVenueWifiInfo(location: any): Promise<any> {
    return {
      networks: [
        { name: 'VenueFree', password: 'guest2024', speed: 'High' },
        { name: 'EventGuest', password: 'event123', speed: 'Medium' },
        { name: 'Emergency-WiFi', password: null, speed: 'Basic' }
      ],
      coverage: 'Full venue coverage',
      dataLimits: 'No limits on free networks',
      troubleshooting: 'Contact venue staff for connection issues'
    };
  }

  private static generateTicketCode(event: any): string {
    return `EVT-${event._id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  }

  private static generateOfflineCalendarData(event: any): any {
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    return {
      title: event.title,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      location: `${event.location.name}, ${event.location.address}`,
      description: event.description,
      coordinates: { lat: event.location.latitude, lng: event.location.longitude },
      reminders: [
        { time: '1 hour before', message: 'Event starts in 1 hour' },
        { time: '30 minutes before', message: 'Time to head to the venue' },
        { time: '15 minutes before', message: 'Event starting soon' }
      ]
    };
  }

  private static cacheVenueMap(eventId: string, mapData: any): void {
    try {
      const venueCache = JSON.parse(localStorage.getItem(this.VENUE_MAPS_KEY) || '{}');
      venueCache[eventId] = mapData;
      localStorage.setItem(this.VENUE_MAPS_KEY, JSON.stringify(venueCache));
    } catch (error) {
      console.error('Failed to cache venue map:', error);
    }
  }

  static getOfflineVenueMap(eventId: string): any {
    try {
      const venueCache = JSON.parse(localStorage.getItem(this.VENUE_MAPS_KEY) || '{}');
      return venueCache[eventId] || null;
    } catch (error) {
      return null;
    }
  }

  static getOfflineEventDetails(eventId: string): any {
    const offlineEvents = this.getOfflineEvents();
    return offlineEvents[eventId] || null;
  }

  static isOfflineMode(): boolean {
    return !navigator.onLine;
  }

  static getOfflineEventsList(): any[] {
    const offlineEvents = this.getOfflineEvents();
    return Object.values(offlineEvents);
  }

  static generateCalendarEvent(event: any): string {
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const offlineEvent = this.getOfflineEventDetails(event._id);
    const ticketCode = offlineEvent?.ticketCode || this.generateTicketCode(event);
    
    const details = `${event.description}\n\nVenue: ${event.location.name}\nAddress: ${event.location.address}\nTicket Code: ${ticketCode}\n\nCreated by: ${event.creator.firstName} ${event.creator.lastName}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details,
      location: `${event.location.name}, ${event.location.address}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  static generateAppleCalendarEvent(event: any): string {
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const params = new URLSearchParams({
      title: event.title,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      location: `${event.location.name}, ${event.location.address}`,
      notes: event.description
    });

    return `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.href}
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location.name}, ${event.location.address}
END:VEVENT
END:VCALENDAR`;
  }
}