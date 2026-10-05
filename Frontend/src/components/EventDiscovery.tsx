import React, { useState, useEffect, useRef } from "react";

const SearchIcon = () => <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const StarIcon = () => <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const CalendarIcon = () => <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const TimeIcon = () => <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const SettingsIcon = () => <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
import { toast } from "sonner";
import { API_URL } from '../config';
import UpsellModal from './UpsellModal';
import SmartSearchBar from './SmartSearchBar';
import { useEngagement } from '../hooks/useEngagement';
import { useSentimentAnalysis } from '../hooks/useSentimentAnalysis';
import { useNotifications } from '../hooks/useNotifications';
import { currencyService } from '../services/currencyService';
import { currencyConverter } from '../services/currencyConverter';
import GroupPlanning from './GroupPlanning';
import UserAvatar from './UserAvatar';
import { OfflineService } from '../services/offlineService';
import { RecommendationService } from '../services/recommendationService';
import GroupChatModal from './GroupChatModal';
import CalendarDropdown from './CalendarDropdown';
import OfflineEventViewer from './OfflineEventViewer';
import EventLocationMap from './EventLocationMap';

interface Event {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location_name?: string;
  location_address?: string;
  location?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  users?: {
    first_name: string;
    last_name: string;
  };
  creator?: {
    firstName: string;
    lastName: string;
    first_name?: string;
    last_name?: string;
  };
  attendees?: Array<any>;
  tags?: string[];
  flyerUrl?: string;
  flyer_url?: string;
  isVirtual?: boolean;
  price?: number;
  priceCategory?: string;
  is_exclusive?: boolean;
  rating?: number;
  userRating?: number;
  userRSVP?: 'going' | 'interested' | null;
  recommendationScore?: number;
  comments?: Array<{
    user: string;
    text: string;
    date: string;
    avatar?: string;
  }>;
  isOwner?: boolean;
  isAdmin?: boolean;
  analytics?: {
    views: number;
    engagement: number;
    reach: number;
    shares?: number;
    saves?: number;
  };
}

interface EventDiscoveryProps {
  userLocation: {latitude: number, longitude: number} | null;
  currency: { code: string; symbol: string };
}

interface ConvertedPrice {
  original: { amount: number; currency: string; };
  converted: { amount: number; currency: string; };
  rate: number;
}

export default function EventDiscovery({ userLocation, currency }: EventDiscoveryProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [forYouEvents, setForYouEvents] = useState<Event[]>([]);
  const [recommendations, setRecommendations] = useState<Event[]>([]);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [friendActivity, setFriendActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'for_you' | 'recommendations' | 'groups' | 'saved' | 'global_chat'>('discover');
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellFeature, setUpsellFeature] = useState('');
  const [upsellBenefit, setUpsellBenefit] = useState('');
  const [showGlobalChat, setShowGlobalChat] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'date' | 'price' | 'category' | 'sort' | 'radius' | null>(null);
  const [userCurrency, setUserCurrency] = useState('USD');
  const [showOriginalPrice, setShowOriginalPrice] = useState(false);
  
  const { trackRating, trackInterested, sendFeedback } = useEngagement();
  const { analyzeComment } = useSentimentAnalysis();
  const { requestNotificationPermission } = useNotifications();
  
  const [filters, setFilters] = useState({
    categories: [] as string[],
    radius: 500,
    priceCategories: [] as string[],
    priceRange: { min: 0, max: 1000 },
    isVirtual: false,
    sortBy: 'date',
    dateFrom: '',
    dateTo: '',
    datePreset: '',
    attendeeCount: { min: 0, max: 10000 },
    rating: 0,
    hasTickets: null as boolean | null,
    eventType: [] as string[],
    accessibility: [] as string[],
    ageRestriction: '',
    language: [] as string[],
    tags: [] as string[]
  });

  const [dropdownStates, setDropdownStates] = useState({
    categories: false,
    eventType: false,
    language: false,
    tags: false,
    accessibility: false
  });

  const categories = ["Music", "Sports", "Food", "Art", "Business", "Technology", "Health", "Education", "Other"];
  
  const eventTypes = ["Concert", "Festival", "Workshop", "Conference", "Meetup", "Party", "Exhibition", "Performance", "Competition", "Networking"];
  
  const accessibilityOptions = ["Wheelchair Accessible", "Sign Language Interpreter", "Audio Description", "Large Print Materials", "Quiet Space Available"];
  
  const ageRestrictions = [
    { value: '', label: 'All Ages' },
    { value: '18+', label: '18+ Only' },
    { value: '21+', label: '21+ Only' },
    { value: 'family', label: 'Family Friendly' },
    { value: 'kids', label: 'Kids Only' }
  ];
  
  const languages = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Arabic", "Hindi"];
  
  const popularTags = ["Outdoor", "Indoor", "Live Music", "Food & Drink", "Networking", "Educational", "Entertainment", "Cultural", "Charity", "Seasonal"];
  const getPriceCategories = () => {
    const ranges = currencyService.getPriceRanges() || { low: 25, medium: 50, high: 100 };
    const symbol = currencyService.getCurrencySymbol() || '$';
    return [
      { value: 'free', label: 'Free' },
      { value: `under${ranges.low}`, label: `Under ${symbol}${ranges.low}` },
      { value: `under${ranges.medium}`, label: `Under ${symbol}${ranges.medium}` },
      { value: `over${ranges.medium}`, label: `${symbol}${ranges.medium}+` }
    ];
  };

  const datePresets = [
    { value: '', label: 'Any Time' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this_weekend', label: 'This Weekend' },
    { value: 'next_week', label: 'Next Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'next_month', label: 'Next Month' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'popular', label: 'Most Popular', premium: true },
    { value: 'newest', label: 'Newest', premium: true },
    { value: 'closest', label: 'Closest', premium: true },
    { value: 'rating', label: 'Best Rated', premium: true },
    { value: 'price_low', label: 'Price: Low to High', premium: true },
    { value: 'price_high', label: 'Price: High to Low', premium: true }
  ];

  const fetchEvents = async () => {
    if (!userLocation) {
      setEvents([]);
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('latitude', userLocation.latitude.toString());
      params.append('longitude', userLocation.longitude.toString());
      params.append('radius', filters.radius.toString());
      if (filters.categories.length) params.append('category', filters.categories.join(','));
      if (filters.priceCategories.length) params.append('priceCategory', filters.priceCategories.join(','));
      if (filters.isVirtual) params.append('isVirtual', 'true');
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.datePreset) params.append('datePreset', filters.datePreset);
      params.append('priceMin', filters.priceRange.min.toString());
      params.append('priceMax', filters.priceRange.max.toString());

      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events/nearby?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data);
      } else {
        toast.error(data.message || "Failed to fetch events");
      }
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedRecommendations = async () => {
    
    try {
      const [recommendations, trending] = await Promise.all([
        RecommendationService.getPersonalizedRecommendations(12),
        RecommendationService.getTrendingEvents(8)
      ]);
      
      setForYouEvents(recommendations);
      setFriendActivity([]);
      setRecommendations(trending);
    } catch (error) {
      console.error('Failed to fetch recommendations');
    }
  };

  const fetchSavedEvents = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSavedEvents([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/events/user/saved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedEvents(data);
      } else if (response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setSavedEvents([]);
      }
    } catch (error) {
      setSavedEvents([]);
    }
  };

  const handleRSVP = async (eventId: string | number, status: "going" | "interested") => {
    if (!eventId || eventId === 'undefined') {
      toast.error("Invalid event ID");
      return;
    }
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error("Please log in to RSVP");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`RSVP updated to ${status}!`);
        
        // Track interaction for recommendations
        if (status === 'interested') {
          trackInterested(eventId);
          RecommendationService.trackInteraction(eventId, 'save');
        } else if (status === 'going') {
          RecommendationService.trackInteraction(eventId, 'purchase');
        }
        
        fetchEvents();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to RSVP");
      }
    } catch (error) {
      toast.error("Failed to RSVP");
    }
  };

  const handleRating = async (eventId: string, rating: number) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error("Please log in to rate");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });

      if (response.ok) {
        toast.success('Rating submitted!');
        trackRating(eventId, rating);
        fetchEvents();
      } else {
        toast.error('Failed to submit rating');
      }
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const handleComment = async (eventId: string, comment: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error("Please log in to comment");
      return;
    }

    try {
      const analysis = await analyzeComment(comment, eventId);
      
      const response = await fetch(`${API_URL}/api/events/${eventId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment })
      });

      if (response.ok) {
        toast.success('Comment added!');
        if (analysis?.sentiment === 'positive') {
          toast.success('Thanks for the positive feedback!');
        }
        fetchEvents();
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  useEffect(() => {
    currencyService.initializeCurrency();
    initializeCurrency();
    requestNotificationPermission();

    const handleSavedEventsChange = () => {
      if (activeTab === 'saved') fetchSavedEvents();
    };
    window.addEventListener('savedEventsChanged', handleSavedEventsChange);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchEvents();
        if (activeTab === 'saved') fetchSavedEvents();
        fetchPersonalizedRecommendations();
      }
    }, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('savedEventsChanged', handleSavedEventsChange);
    };
  }, []); // run once on mount

  // Re-fetch events whenever location or filters change
  useEffect(() => {
    fetchEvents();
  }, [userLocation, filters]);

  useEffect(() => {
    fetchPersonalizedRecommendations();
    fetchSavedEvents();
  }, []); // fetch on mount regardless of location

  useEffect(() => {
    if (userLocation) fetchPersonalizedRecommendations();
  }, [userLocation]);

  const initializeCurrency = async () => {
    await currencyConverter.updateRates();
    const detectedCurrency = await currencyConverter.detectUserCurrency(userLocation);
    setUserCurrency(detectedCurrency);
  };

  const convertPrice = (price: number, fromCurrency: string = 'USD'): ConvertedPrice => {
    const convertedAmount = currencyConverter.convert(price, fromCurrency, userCurrency);
    return {
      original: { amount: price, currency: fromCurrency },
      converted: { amount: convertedAmount, currency: userCurrency },
      rate: convertedAmount / price
    };
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (userLocation) {
        params.append('latitude', userLocation.latitude.toString());
        params.append('longitude', userLocation.longitude.toString());
      }

      const response = await fetch(`${API_URL}/api/search/events?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data);
        toast.success(`Found ${data.length} events for "${query}"`);
      } else {
        toast.error(data.message || 'Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      toast.error('Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'discover', label: 'Discover' },
    { id: 'for_you', label: 'For You' },
    { id: 'recommendations', label: 'Trending' },
    { id: 'groups', label: 'Groups' },
    { id: 'saved', label: 'Saved' },
    { id: 'global_chat', label: 'Chat' },
  ];

  const toggleFilter = (key: typeof activeFilter) => setActiveFilter(prev => prev === key ? null : key);

  const tabIcons: Record<string, JSX.Element> = {
    discover: <SearchIcon />,
    for_you: <StarIcon />,
    recommendations: <TimeIcon />,
    groups: <SettingsIcon />,
    saved: <CalendarIcon />,
    global_chat: <SearchIcon />,
  };

  const sidebarFilters = [
    {
      key: 'category' as const,
      label: 'Category',
      icon: <SettingsIcon />,
      summary: filters.categories.length ? filters.categories.join(', ') : null,
      content: (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {categories.map(cat => (
            <li key={cat}>
              <button onClick={() => setFilters(prev => ({ ...prev, categories: prev.categories.includes(cat) ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat] }))} style={{
                width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                background: filters.categories.includes(cat) ? 'rgba(251,139,36,0.15)' : 'transparent',
                border: filters.categories.includes(cat) ? '1px solid rgba(251,139,36,0.4)' : '1px solid transparent',
                color: filters.categories.includes(cat) ? '#FB8B24' : 'rgba(255,255,255,0.65)',
                fontWeight: filters.categories.includes(cat) ? 600 : 400,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {cat}
                {filters.categories.includes(cat) && <span style={{ fontSize: 10, color: '#FB8B24' }}>&#10003;</span>}
              </button>
            </li>
          ))}
          <li>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              <input type="checkbox" checked={filters.isVirtual} onChange={e => setFilters(prev => ({ ...prev, isVirtual: e.target.checked }))} style={{ accentColor: '#FB8B24' }} />
              Virtual only
            </label>
          </li>
        </ul>
      ),
    },
    {
      key: 'date' as const,
      label: 'Date',
      icon: <CalendarIcon />,
      summary: filters.datePreset ? datePresets.find(d => d.value === filters.datePreset)?.label : filters.dateFrom ? filters.dateFrom : null,
      content: (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {datePresets.map(p => (
            <li key={p.value}>
              <button onClick={() => setFilters(prev => ({ ...prev, datePreset: p.value, dateFrom: '', dateTo: '' }))} style={{
                width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                background: filters.datePreset === p.value ? 'rgba(251,139,36,0.15)' : 'transparent',
                border: filters.datePreset === p.value ? '1px solid rgba(251,139,36,0.4)' : '1px solid transparent',
                color: filters.datePreset === p.value ? '#FB8B24' : 'rgba(255,255,255,0.65)',
                fontWeight: filters.datePreset === p.value ? 600 : 400,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {p.label}
                {filters.datePreset === p.value && <span style={{ fontSize: 10, color: '#FB8B24' }}>&#10003;</span>}
              </button>
            </li>
          ))}
          <li style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, paddingLeft: 2 }}>Custom range</div>
            <input type="date" value={filters.dateFrom} onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value, datePreset: '' }))} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, marginBottom: 4 }} />
            <input type="date" value={filters.dateTo} onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value, datePreset: '' }))} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12 }} />
          </li>
        </ul>
      ),
    },
    {
      key: 'price' as const,
      label: 'Price',
      icon: <StarIcon />,
      summary: filters.priceCategories.length ? filters.priceCategories.map(v => getPriceCategories().find(p => p.value === v)?.label).join(', ') : null,
      content: (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {getPriceCategories().map(p => (
            <li key={p.value}>
              <button onClick={() => setFilters(prev => ({ ...prev, priceCategories: prev.priceCategories.includes(p.value) ? prev.priceCategories.filter(x => x !== p.value) : [...prev.priceCategories, p.value] }))} style={{
                width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                background: filters.priceCategories.includes(p.value) ? 'rgba(251,139,36,0.15)' : 'transparent',
                border: filters.priceCategories.includes(p.value) ? '1px solid rgba(251,139,36,0.4)' : '1px solid transparent',
                color: filters.priceCategories.includes(p.value) ? '#FB8B24' : 'rgba(255,255,255,0.65)',
                fontWeight: filters.priceCategories.includes(p.value) ? 600 : 400,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {p.label}
                {filters.priceCategories.includes(p.value) && <span style={{ fontSize: 10, color: '#FB8B24' }}>&#10003;</span>}
              </button>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'sort' as const,
      label: 'Sort',
      icon: <TimeIcon />,
      summary: sortOptions.find(s => s.value === filters.sortBy)?.label ?? null,
      content: (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sortOptions.map(s => (
            <li key={s.value}>
              <button onClick={() => setFilters(prev => ({ ...prev, sortBy: s.value }))} style={{
                width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                background: filters.sortBy === s.value ? 'rgba(251,139,36,0.15)' : 'transparent',
                border: filters.sortBy === s.value ? '1px solid rgba(251,139,36,0.4)' : '1px solid transparent',
                color: filters.sortBy === s.value ? '#FB8B24' : 'rgba(255,255,255,0.65)',
                fontWeight: filters.sortBy === s.value ? 600 : 400,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {s.label}
                {filters.sortBy === s.value && <span style={{ fontSize: 10, color: '#FB8B24' }}>&#10003;</span>}
              </button>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  const hasActiveFilters = filters.categories.length > 0 || filters.priceCategories.length > 0 || filters.datePreset || filters.dateFrom || filters.sortBy !== 'date' || filters.isVirtual || filters.radius !== 500;

  const FilterSidebar = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Filters</span>
        {hasActiveFilters && (
          <button onClick={() => { setFilters(prev => ({ ...prev, categories: [], priceCategories: [], datePreset: '', dateFrom: '', dateTo: '', sortBy: 'date', isVirtual: false, radius: 500 })); setActiveFilter(null); }} style={{ fontSize: 11, color: 'rgba(255,100,100,0.75)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Clear all</button>
        )}
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sidebarFilters.map(f => (
          <li key={f.key} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: activeFilter === f.key ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
            <button onClick={() => toggleFilter(f.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', color: activeFilter === f.key ? '#FB8B24' : 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ opacity: 0.7, fontSize: '0.9em' }}>{f.icon}</span>
                {f.label}
                {f.summary && <span style={{ fontSize: 10, background: '#FB8B24', color: '#000', borderRadius: 10, padding: '1px 6px', fontWeight: 700 }}>{f.summary.length > 12 ? f.summary.slice(0, 12) + '…' : f.summary}</span>}
              </span>
              <span style={{ fontSize: 9, opacity: 0.45, transform: activeFilter === f.key ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>&#9660;</span>
            </button>
            {activeFilter === f.key && <div style={{ padding: '0 8px 10px' }}>{f.content}</div>}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', width: '100%', paddingBottom: 80 }}>
      {/* Search bar */}
      <div style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '10px 12px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SmartSearchBar onSearch={handleSearch} placeholder="Search events, artists, venues..." />
          </div>

        </div>
      </div>

      {/* Tab nav bar */}
      <div style={{ background: 'rgba(13,13,13,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 53, zIndex: 40, overflowX: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 4px', display: 'flex', alignItems: 'center', minWidth: 'max-content', width: '100%' }}>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', color: hasActiveFilters ? '#FB8B24' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: hasActiveFilters ? 700 : 500, whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.553.894l-4 2A1 1 0 017 17v-6.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
            {hasActiveFilters ? 'Filtered' : 'Filter'}
          </button>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); if (t.id === 'saved') fetchSavedEvents(); }} style={{
              flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '11px 12px', background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === t.id ? '#FB8B24' : 'rgba(255,255,255,0.4)',
              fontWeight: activeTab === t.id ? 700 : 500, fontSize: 12,
              borderBottom: activeTab === t.id ? '2px solid #FB8B24' : '2px solid transparent',
              transition: 'color 0.15s', marginBottom: -1, whiteSpace: 'nowrap',
            }}>
              <span style={{ opacity: activeTab === t.id ? 1 : 0.5, fontSize: '0.82em' }}>{tabIcons[t.id]}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} onClick={() => setShowMobileFilters(false)} />
          <div style={{ position: 'relative', background: '#111', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '85vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Filters</span>
              <button onClick={() => setShowMobileFilters(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            {/* Radius slider in mobile drawer */}
            <div style={{ marginBottom: 16, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>Search Radius</span>
                <span style={{ color: '#FB8B24', fontSize: 13, fontWeight: 700 }}>{filters.radius} km</span>
              </div>
              <input type="range" min={5} max={500} step={5} value={filters.radius}
                onChange={e => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#FB8B24' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                <span>5 km</span><span>500 km</span>
              </div>
            </div>
            <FilterSidebar />
            <button onClick={() => setShowMobileFilters(false)} style={{ marginTop: 20, width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(90deg,#FB8B24,#DDAA52)', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Apply Filters</button>
          </div>
        </div>
      )}

      {/* Body: sidebar + main */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 12px 0', display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Sidebar filters — desktop only */}
        <aside className="hidden md:block" style={{ width: 220, flexShrink: 0, position: 'sticky', top: 116 }}>
          {/* Radius slider */}
          <div style={{ marginBottom: 16, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>Search Radius</span>
              <span style={{ color: '#FB8B24', fontSize: 12, fontWeight: 700 }}>{filters.radius} km</span>
            </div>
            <input type="range" min={5} max={500} step={5} value={filters.radius}
              onChange={e => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: '#FB8B24' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              <span>5 km</span><span>500 km</span>
            </div>
          </div>
          <FilterSidebar />
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>



      {isSearching && (
        <div className="space-y-4 px-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#FFFFFF]">Search Results for "{searchQuery}"</h3>
            <button
              onClick={() => {
                setIsSearching(false);
                setSearchResults([]);
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#171717] text-[#DDAA52] border border-[#DDAA52]/30 rounded-xl hover:bg-[#DDAA52] hover:text-black transition-all"
            >
              Clear Search
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {searchResults.map((event, index) => (
                <PremiumEventCard
                  key={`search-${event.id || event._id || `temp-${index}`}`}
                  event={event}
                  onRSVP={(eventId, status) => handleRSVP(event.id || event._id || eventId, status)}
                  onRate={(eventId, rating) => handleRating(event.id || event._id || eventId, rating)}
                  onComment={(eventId, comment) => handleComment(event.id || event._id || eventId, comment)}
                  currency={currency}
                  userCurrency={userCurrency}
                  convertPrice={convertPrice}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#171717] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Events Found</h3>
              <p className="text-white/70">Try searching with different keywords</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content */}
      {!isSearching && activeTab === 'discover' && userLocation && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          ) : (() => {
            const today = new Date().toISOString().split('T')[0];
            const filtered = events
              .filter(event => {
                if (filters.categories.length > 0 && !filters.categories.includes(event.category)) return false;
                if (filters.priceRange.min > 0 && event.price < filters.priceRange.min) return false;
                if (filters.priceRange.max < 1000 && event.price > filters.priceRange.max) return false;
                if (filters.rating > 0 && event.rating < filters.rating) return false;
                if (filters.hasTickets !== null && (event.price > 0) !== filters.hasTickets) return false;
                return true;
              })
              .sort((a, b) => {
                const aIsFuture = a.date >= today;
                const bIsFuture = b.date >= today;
                if (aIsFuture && bIsFuture) return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
                if (!aIsFuture && !bIsFuture) return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
                return aIsFuture ? -1 : 1;
              });
            return filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, color: 'rgba(255,255,255,0.2)' }}>
                  <SearchIcon />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>No events found</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>Try adjusting your filters or search in a wider area</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map((event, index) => (
                  <PremiumEventCard
                    key={`discover-${event.id || event._id || `temp-${index}`}`}
                    event={event}
                    onRSVP={(eventId, status) => handleRSVP(event.id || event._id || eventId, status)}
                    onRate={(eventId, rating) => handleRating(event.id || event._id || eventId, rating)}
                    onComment={(eventId, comment) => handleComment(event.id || event._id || eventId, comment)}
                    currency={currency}
                    userCurrency={userCurrency}
                    convertPrice={convertPrice}
                  />
                ))}
              </div>
            );
          })()}
        </>
      )}
      
      {!isSearching && activeTab === 'for_you' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Recommended For You</h3>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">AI-Powered</span>
          </div>
          {forYouEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {forYouEvents.slice(0, 6).map((event, index) => (
                <div key={`for-you-${event._id || event.id || `temp-${index}`}`} className="relative">
                  <PremiumEventCard
                    event={event}
                    onRSVP={handleRSVP}
                    onRate={handleRating}
                    onComment={handleComment}
                    currency={currency}
                    userCurrency={userCurrency}
                    convertPrice={convertPrice}
                  />
                  {event.recommendationScore && (
                    <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {Math.round(event.recommendationScore * 100)}% match
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/70">Building your personalized recommendations...</p>
              <p className="text-white/50 text-sm mt-2">RSVP to more events to improve suggestions!</p>
            </div>
          )}

          {/* Friend Activity */}
          {friendActivity.length > 0 && (
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl border border-blue-400/20 p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Friends Activity</h3>
              </div>
              <div className="space-y-3">
                {friendActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                    <UserAvatar
                      src={activity.friend.avatar || activity.friend.avatarUrl || null}
                      name={activity.friend.name}
                      size={40}
                      radius={12}
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span className="font-semibold">{activity.friend.name}</span> is {activity.action} 
                        <span className="text-yellow-400 font-medium">{activity.event.title}</span>
                      </p>
                      <p className="text-white/60 text-xs">{activity.timeAgo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!isSearching && activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Trending Now</h3>
            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">Hot</span>
          </div>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {recommendations.map((event, index) => (
                <div key={`trending-${event._id || event.id || `temp-${index}`}`} className="relative">
                  <PremiumEventCard
                    event={event}
                    onRSVP={handleRSVP}
                    onRate={handleRating}
                    onComment={handleComment}
                    currency={currency}
                    userCurrency={userCurrency}
                    convertPrice={convertPrice}
                  />
                  <div className="absolute top-2 left-2 z-20">
                    {(event as any).is_viral ? (
                      <span style={{ background: 'linear-gradient(90deg,#FF4500,#FF8C00)', color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 0 12px rgba(255,69,0,0.5)' }}>
                        VIRAL
                      </span>
                    ) : (
                      <span style={{ background: 'rgba(251,139,36,0.85)', color: '#000', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        Trending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/70">Discovering trending events...</p>
            </div>
          )}
        </div>
      )}
      
      {!isSearching && activeTab === 'groups' && (
        <GroupPlanning />
      )}
      
      {!isSearching && activeTab === 'saved' && (
        <div className="space-y-8">
          {/* Saved Events Header */}
          <div className="bg-gradient-to-r from-[#FB8B24]/10 via-[#DDAA52]/10 to-[#A31818]/10 backdrop-blur-xl rounded-3xl border border-[#FB8B24]/30 p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Your Saved Events</h3>
            <p className="text-white/80">Events you've bookmarked for later</p>
          </div>

          {/* Saved Events */}
          {savedEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 px-0">
              {savedEvents.filter(Boolean).map((event, index) => (
                <div key={`saved-${event._id || event.id || `temp-${index}`}`} className="relative">
                  <PremiumEventCard
                    event={event}
                    onRSVP={handleRSVP}
                    onRate={handleRating}
                    onComment={handleComment}
                    currency={currency}
                    userCurrency={userCurrency}
                    convertPrice={convertPrice}
                  />
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black text-xs px-3 py-1 rounded-full font-bold">
                    SAVED
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-[#FB8B24]/20 to-[#DDAA52]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#FB8B24]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Saved Events Yet</h3>
              <p className="text-white/70">Save events you're interested in to view them here!</p>
            </div>
          )}
        </div>
      )}
      
      {!isSearching && activeTab === 'global_chat' && (
        <div className="text-center py-12">
          <button
            onClick={() => setShowGlobalChat(true)}
            className="bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 px-6 rounded-xl font-semibold hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all"
          >
            Join Global Chat
          </button>
        </div>
      )}
      
      {showGlobalChat && (
        <GroupChatModal onClose={() => setShowGlobalChat(false)} />
      )}

      {!userLocation && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Location Access Required</h3>
            <p className="text-white/70 mb-4">This app requires location access to function. Please enable location permissions and refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
      

      
      <UpsellModal
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        onUpgrade={() => {}}
        feature={upsellFeature}
        benefit={upsellBenefit}
      />
        </main>
      </div>
    </div>
  );
}

function CommentAvatar({ url, name }: { url?: string | null; name: string }) {
  return <UserAvatar src={url} name={name} size={24} radius={6} />;
}

function PremiumEventCard({ event, onRSVP, onRate, onComment, currency, userCurrency, convertPrice }: {
  event: Event;
  onRSVP: (eventId: string, status: "going" | "interested") => void;
  onRate: (eventId: string, rating: number) => void;
  onComment: (eventId: string, comment: string) => void;
  currency: { code: string; symbol: string };
  userCurrency: string;
  convertPrice: (price: number, fromCurrency?: string) => ConvertedPrice;
}) {
  const [showComments, setShowComments] = useState(false);
  const [showOriginalPrice, setShowOriginalPrice] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Array<{id: string, comment: string, created_at: string, users: {first_name: string, last_name: string, profile_picture?: string}}>>([]);
  const [isOfflineDownloaded, setIsOfflineDownloaded] = useState(() => {
    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offlineEvents') || '[]');
      return offlineEvents.some((e: any) => (e._id || e.id) === (event._id || event.id));
    } catch {
      return false;
    }
  });
  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [showOfflineViewer, setShowOfflineViewer] = useState(false);
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    views: number; rsvps: number; comments: number; saves: number;
    avgRating: number; ratingCount: number; engagement: number; reach: number;
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // distance badge
  const distanceKm = (event as any).distance_km as number | null | undefined;

  // Check if event is saved on mount
  useEffect(() => {
    checkIfSaved();
  }, [event._id, event.id]);

  const checkIfSaved = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setIsSaved(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/events/user/saved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const savedEvents = await response.json();
        const eventId = event._id || event.id;
        const isEventSaved = savedEvents.some((e: any) => (e._id || e.id) === eventId);
        setIsSaved(isEventSaved);
      } else if (response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setIsSaved(false);
      }
    } catch (error) {
      setIsSaved(false);
    }
  };
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState<string>('');
  const hasTrackedView = useRef(false);

  // Track click when card is viewed (only once) and fetch comments
  useEffect(() => {
    if (!hasTrackedView.current) {
      RecommendationService.trackInteraction(event._id || event.id, 'click');
      hasTrackedView.current = true;
    }
    fetchComments();
  }, [event._id, event.id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events/${event._id || event.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const loadSimilarEvents = async () => {
    if (similarEvents.length === 0) {
      const eventId = event._id || event.id;
      if (eventId) {
        const similar = await RecommendationService.getContentBasedRecommendations(eventId, 3);
        setSimilarEvents(similar);
      }
    }
    setShowSimilar(!showSimilar);
  };

  const handleOfflineDownload = async () => {
    toast.loading('Downloading event for offline access...');
    
    try {
      // Get user's current location for navigation
      let userLat = 0, userLng = 0;
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
      }
      
      // Create downloadable event data with map and location pin
      const eventData = {
        ...event,
        id: event.id || event._id,
        _id: event._id || event.id,
        downloadedAt: new Date().toISOString(),
        location: {
          name: event.location?.name || event.location_name || 'Event Location',
          address: event.location?.address || event.location_address || 'Address TBD',
          latitude: event.location?.latitude || 0,
          longitude: event.location?.longitude || 0
        },
        offlineData: {
          eventLocation: {
            latitude: event.location?.latitude || 0,
            longitude: event.location?.longitude || 0,
            name: event.location?.name || event.location_name
          },
          userLocation: { latitude: userLat, longitude: userLng },
          mapUrl: `https://maps.google.com/maps?q=${event.location?.latitude || 0},${event.location?.longitude || 0}&z=15`,
          navigationUrl: `https://maps.google.com/maps/dir/${userLat},${userLng}/${event.location?.latitude || 0},${event.location?.longitude || 0}`,
          emergencyInfo: 'Emergency: 911 | Local Police: Contact venue for details',
          wifiInfo: 'WiFi available at venue - ask staff for password',
          mapImage: mapImageUrl
        }
      };
      
      // Store in localStorage for offline access
      const offlineEvents = JSON.parse(localStorage.getItem('offlineEvents') || '[]');
      offlineEvents.push(eventData);
      localStorage.setItem('offlineEvents', JSON.stringify(offlineEvents));
      
      setIsOfflineDownloaded(true);
      toast.success('Event downloaded! Includes map with location pin, navigation from your location, and offline details.');
      
      // Auto-open offline viewer after download
      setTimeout(() => {
        setShowOfflineViewer(true);
      }, 1000);
    } catch (error) {
      toast.error('Failed to download event');
    }
  };

  const handleCalendarAdd = (type: 'google' | 'apple') => {
    const url = type === 'google' 
      ? OfflineService.generateCalendarEvent(event)
      : OfflineService.generateAppleCalendarEvent(event);
    
    if (type === 'apple') {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title}.ics`;
      link.click();
    } else {
      window.open(url, '_blank');
    }
    // Calendar options handled by CalendarDropdown component
  };

  const handleShareToGroup = async () => {
    RecommendationService.trackInteraction(event._id || event.id, 'share');
    
    if (userGroups.length === 0) {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/groups/my-groups`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const groups = await response.json();
            setUserGroups(groups);
          } else if (response.status === 401) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setUserGroups([]);
          }
        } catch (error) {
          setUserGroups([]);
        }
      }
    }
    
    setShowGroupOptions(!showGroupOptions);
  };

  const shareEventToGroup = async (groupId: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      console.log('Sharing event:', { groupId, eventId: event._id || event.id });
      const response = await fetch(`${API_URL}/api/groups/${groupId}/share-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId: event._id || event.id })
      });

      const data = await response.json();
      console.log('Share response:', data);

      if (response.ok) {
        toast.success('Event shared to group!');
        setShowGroupOptions(false);
      } else {
        console.error('Share failed:', data);
        toast.error(data.message || 'Failed to share event');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share event');
    }
  };

  const handleSaveEvent = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to save events');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/events/${event._id || event.id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const newSavedState = !isSaved;
        setIsSaved(newSavedState);
        RecommendationService.trackInteraction(event._id || event.id, 'save');
        toast.success(newSavedState ? 'Event saved!' : 'Event unsaved!');
        
        // Refresh saved events list and recheck save status
        await checkIfSaved();
        window.dispatchEvent(new CustomEvent('savedEventsChanged'));
      } else {
        toast.error('Failed to save event');
      }
    } catch (error) {
      toast.error('Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        // Refresh events list
        window.location.reload();
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 group relative">
      {event.is_exclusive && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
            EXCLUSIVE
          </span>
        </div>
      )}

      {/* Distance badge */}
      {distanceKm != null && (
        <div className="absolute top-3 left-3 z-10">
          <span style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', color: '#FB8B24', border: '1px solid rgba(251,139,36,0.35)', borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm} km`}
          </span>
        </div>
      )}
      
      {(event.flyerUrl || event.flyer_url) && (
        <div className="aspect-video overflow-hidden relative group">
          <img
            src={event.flyerUrl || event.flyer_url}
            alt={event.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.log('Image failed to load:', event.flyerUrl || event.flyer_url);
              // Don't hide the image, let it show broken image icon
            }}
          />
          <button
            onClick={async () => {
              try {
                const response = await fetch(event.flyerUrl || event.flyer_url);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${event.title}-flyer.jpg`;
                link.click();
                window.URL.revokeObjectURL(url);
              } catch (error) {
                window.open(event.flyerUrl || event.flyer_url, '_blank');
              }
            }}
            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      

      
      {/* Test with placeholder image if no flyer */}
      {!(event.flyerUrl || event.flyer_url) && (
        <div className="aspect-video overflow-hidden bg-gradient-to-br from-[#FB8B24]/20 to-[#DDAA52]/20 flex items-center justify-center">
          <div className="text-center text-white/60">
            <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">No flyer uploaded</p>
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">
              by {event.users?.first_name || event.creator?.firstName || event.creator?.first_name || 'Unknown'} {event.users?.last_name || event.creator?.lastName || event.creator?.last_name || 'User'}
            </p>
{(() => { const r = Number(event.rating); return r > 0 ? (
              <div className="flex items-center">
                <div className="flex items-center mr-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-3 h-3 ${star <= Math.round(r) ? 'text-[#DDAA52]' : 'text-white/20'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white/70 text-xs">{r.toFixed(1)}</span>
              </div>
            ) : null; })()}
          </div>

          
          {/* Analytics button for event owner/admin */}
          {(event.isOwner || event.isAdmin) && (
            <div className="mt-3">
              <button
                onClick={async () => {
                  if (!showAnalytics && !analyticsData) {
                    setAnalyticsLoading(true);
                    try {
                      const token = sessionStorage.getItem('token');
                      const res = await fetch(`${API_URL}/api/events/${event.id || event._id}/analytics`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (res.ok) setAnalyticsData(await res.json());
                    } catch {}
                    finally { setAnalyticsLoading(false); }
                  }
                  setShowAnalytics(!showAnalytics);
                }}
                className="w-full bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-2 px-4 rounded-xl font-medium hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all text-sm flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
              </button>
              
              {showAnalytics && (
                <div className="mt-3 p-4 bg-gradient-to-br from-[#FB8B24]/10 to-[#DDAA52]/10 rounded-xl border border-[#FB8B24]/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#FFFFFF] text-sm font-semibold">Your Event Analytics</span>
                    {event.isAdmin && (
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Event"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 9V6a1 1 0 011-1z" clipRule="evenodd" />
                          <path d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 8a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {analyticsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FB8B24] mx-auto" />
                    </div>
                  ) : analyticsData ? (
                    <>
                  {/* Main metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-[#171717]/50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <svg className="w-4 h-4 text-blue-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-[#FFFFFF] font-bold text-lg">{analyticsData.views}</div>
                      <div className="text-[#FFFFFF]/60 text-xs">Views</div>
                    </div>
                    <div className="bg-[#171717]/50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <svg className="w-4 h-4 text-green-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                      </div>
                      <div className="text-[#FFFFFF] font-bold text-lg">{analyticsData.rsvps}</div>
                      <div className="text-[#FFFFFF]/60 text-xs">RSVPs</div>
                    </div>
                  </div>

                  {/* Secondary metrics */}
                  <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                    <div className="text-center">
                      <div className="text-[#FFFFFF] font-semibold">{analyticsData.engagement}%</div>
                      <div className="text-[#FFFFFF]/60">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#FFFFFF] font-semibold">{analyticsData.reach}</div>
                      <div className="text-[#FFFFFF]/60">Reach</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#FFFFFF] font-semibold">{analyticsData.comments}</div>
                      <div className="text-[#FFFFFF]/60">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#FFFFFF] font-semibold">{analyticsData.saves}</div>
                      <div className="text-[#FFFFFF]/60">Saves</div>
                    </div>
                  </div>

                  {/* Rating */}
                  {analyticsData.ratingCount > 0 && (
                    <div className="text-center text-xs mb-3">
                      <div className="flex items-center justify-center gap-1 text-[#DDAA52] font-semibold text-sm">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {analyticsData.avgRating}
                      </div>
                      <div className="text-[#FFFFFF]/60">Avg rating ({analyticsData.ratingCount} {analyticsData.ratingCount === 1 ? 'review' : 'reviews'})</div>
                    </div>
                  )}

                  {/* Performance indicator */}
                  <div className="pt-3 border-t border-[#DDAA52]/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#FFFFFF]/70">Performance</span>
                      <span className="text-[#DDAA52] font-semibold">
                        {analyticsData.engagement > 25 ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                            Trending
                          </span>
                        ) : analyticsData.engagement > 15 ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                            Growing
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            Getting noticed
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                    </>
                  ) : (
                    <p className="text-[#FFFFFF]/50 text-xs text-center py-2">Failed to load analytics</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-white/80">
            <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
          </div>
          
          <div className="flex items-center text-white/80">
            <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{event.location?.name || event.location_name || 'Location TBD'}</span>
          </div>
        </div>

        <p className="text-white/70 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Attendance */}
        <div className="mb-4">
          {event.price > 0 || event.ticketTypes ? (
            <div className="space-y-2">
              <div className="text-center mb-3">
                <span className="text-[#FB8B24] font-semibold">Paid Event - Purchase Tickets</span>
              </div>
              
              {event.ticketTypes?.ussdCode && (
                <button
                  onClick={() => window.location.href = `tel:${event.ticketTypes.ussdCode}`}
                  className="w-full py-2 px-4 rounded-xl font-medium transition-all text-sm flex items-center justify-center bg-[#FB8B24] text-black hover:bg-[#DDAA52]"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Dial {event.ticketTypes.ussdCode}
                </button>
              )}
              
              {event.ticketTypes?.webLink && (
                <button
                  onClick={() => window.open(event.ticketTypes.webLink, '_blank')}
                  className="w-full py-2 px-4 rounded-xl font-medium transition-all text-sm flex items-center justify-center bg-[#171717] text-[#DDAA52] border border-[#DDAA52]/30 hover:bg-[#DDAA52] hover:text-black"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  Buy Online
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => onRSVP(event.id || event._id || 'temp-id', "going")}
              className={`w-full py-2 px-4 rounded-xl font-medium transition-all text-sm flex items-center justify-center ${
                event.userRSVP === 'going'
                  ? 'bg-[#FB8B24] text-black'
                  : 'bg-[#171717] text-[#DDAA52] border border-[#DDAA52]/30 hover:bg-[#DDAA52] hover:text-black'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                {event.userRSVP === 'going' ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                )}
              </svg>
              {event.userRSVP === 'going' ? 'Attending' : 'Attend Event'}
            </button>
          )}
        </div>

        {/* Action grid — row 1: 3 cols, row 2: 4 cols */}
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onRSVP(event.id || event._id || 'temp-id', "interested")}
              className={`flex flex-col items-center justify-center py-3 rounded-xl text-xs font-medium transition-all border ${
                event.userRSVP === 'interested'
                  ? 'bg-[#DDAA52]/20 text-[#DDAA52] border-[#DDAA52]/40'
                  : 'bg-[#171717] text-white/60 border-white/10 hover:border-[#DDAA52]/40 hover:text-[#DDAA52]'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill={event.userRSVP === 'interested' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {event.userRSVP === 'interested' ? 'Interested ✓' : 'Interested'}
            </button>
            <CalendarDropdown event={event} compact />
            <button
              onClick={handleShareToGroup}
              className="flex flex-col items-center justify-center py-3 rounded-xl text-xs font-medium transition-all border bg-[#171717] text-white/60 border-white/10 hover:border-[#FB8B24]/40 hover:text-[#FB8B24]"
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              Group
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex flex-col items-center justify-center py-3 rounded-xl text-xs font-medium transition-all border ${
                showComments ? 'bg-[#DDAA52]/15 text-[#DDAA52] border-[#DDAA52]/40' : 'bg-[#171717] text-white/60 border-white/10 hover:border-[#DDAA52]/40 hover:text-[#DDAA52]'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {comments.length > 0 ? `(${comments.length})` : 'Chat'}
            </button>
            <button
              onClick={() => setShowLocationMap(!showLocationMap)}
              className={`flex flex-col items-center justify-center py-3 rounded-xl text-xs font-medium transition-all border ${
                showLocationMap ? 'bg-[#DDAA52]/15 text-[#DDAA52] border-[#DDAA52]/40' : 'bg-[#171717] text-white/60 border-white/10 hover:border-[#DDAA52]/40 hover:text-[#DDAA52]'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Map
            </button>
            <button
              onClick={handleSaveEvent}
              className={`flex flex-col items-center justify-center py-3 rounded-xl text-xs font-medium transition-all border ${
                isSaved ? 'bg-[#DDAA52]/15 text-[#DDAA52] border-[#DDAA52]/40' : 'bg-[#171717] text-white/60 border-white/10 hover:border-[#DDAA52]/40 hover:text-[#DDAA52]'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={loadSimilarEvents}
              className={`flex flex-col items-center justify-center py-3 rounded-xl text-xs font-medium transition-all border ${
                showSimilar ? 'bg-[#DDAA52]/15 text-[#DDAA52] border-[#DDAA52]/40' : 'bg-[#171717] text-white/60 border-white/10 hover:border-[#DDAA52]/40 hover:text-[#DDAA52]'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
              Similar
            </button>
          </div>

          {/* Location Map */}
          {showLocationMap && (
            <div className="mt-1">
              <EventLocationMap
                event={event}
                onMapReady={(imageUrl) => setMapImageUrl(imageUrl)}
              />
            </div>
          )}

          {/* Similar Events List */}
          {showSimilar && similarEvents.length > 0 && (
            <div className="mt-1 p-3 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-white/80 text-sm font-medium mb-2">Because you viewed this event:</h4>
              <div className="space-y-2">
                {similarEvents.map((similar, index) => (
                  <div key={`similar-${similar._id || similar.id || `temp-${index}`}`} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{similar.category[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/90 text-sm font-medium truncate">{similar.title}</p>
                      <p className="text-white/60 text-xs">{new Date(similar.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group Options */}
          {showGroupOptions && (
            <div className="mt-1 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="space-y-2">
                {userGroups.length > 0 ? (
                  userGroups.map((group) => (
                    <button
                      key={group.id || group._id}
                      onClick={() => shareEventToGroup(group.id || group._id)}
                      className="w-full text-left px-3 py-2 text-white/80 hover:bg-white/10 rounded-lg text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Share to {group.name}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-white/60 text-sm mb-3">No groups found</p>
                    <button className="w-full text-left px-3 py-2 text-white/80 hover:bg-white/10 rounded-lg text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create New Group
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="space-y-3 mb-4 max-h-32 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm flex items-start space-x-2">
                  <CommentAvatar url={comment.users?.profile_picture} name={`${comment.users?.first_name || ''} ${comment.users?.last_name || ''}`.trim() || 'User'} />
                  <div className="flex-1">
                    <span className="text-white/80 font-medium">
                      {comment.users?.first_name} {comment.users?.last_name}:
                    </span>
                    <span className="text-white/70 ml-2">{comment.comment}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                id={`comment-input-${event._id || event.id}`}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm"
              />
              <button
                onClick={async () => {
                  if (newComment.trim()) {
                    await onComment(event.id || event._id || 'temp-id', newComment);
                    setNewComment('');
                    fetchComments();
                  }
                }}
                className="px-4 py-2 bg-[#FB8B24] text-black rounded-lg hover:bg-[#DDAA52] transition-colors text-sm font-medium flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                Post
              </button>
            </div>
          </div>
        )}
      </div>
      
      {showOfflineViewer && (
        <OfflineEventViewer 
          eventId={event._id || event.id || 'temp-id'} 
          onClose={() => setShowOfflineViewer(false)} 
        />
      )}
    </div>
  );
}