import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

// SVG Icons
const IcoType = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
const IcoText = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;
const IcoGrid = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IcoImage = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IcoCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoMapPin = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoLocate = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>;
const IcoTicket = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>;
const IcoTag = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IcoPhone = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoLink = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IcoInfo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoSend = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IcoX = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoUpload = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcoMap = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;

const S = {
  wrap: { maxWidth: 680, margin: '0 auto', padding: '0 0 60px' } as React.CSSProperties,
  card: { background: '#111', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 20, padding: '24px', marginBottom: 20 } as React.CSSProperties,
  label: { display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  input: { width: '100%', padding: '12px 16px', background: '#0d0d0d', border: '1px solid rgba(221,170,82,0.18)', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
  row2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 } as React.CSSProperties,
  divider: { borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 24, paddingBottom: 24 } as React.CSSProperties,
};

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: { name: '', address: '', latitude: 0, longitude: 0 },
    hasTickets: false,
    ticketTypes: { ussdCode: '', webLink: '' },
    tags: [] as string[],
    flyerFile: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = ["Music", "Sports", "Food", "Art", "Business", "Technology", "Health", "Education", "Other"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to create events');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('date', formData.date);
      submitData.append('time', formData.time);
      submitData.append('location', JSON.stringify(formData.location));
      submitData.append('hasTickets', formData.hasTickets.toString());
      submitData.append('ticketTypes', JSON.stringify(formData.ticketTypes));
      submitData.append('tags', JSON.stringify(formData.tags));
      if (formData.flyerFile) {
        submitData.append('flyer', formData.flyerFile);
      }

      const response = await fetch(`${API_URL}/api/events/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: submitData
      });

      if (response.ok) {
        toast.success('Event submitted for admin approval! View it in your profile under "My Created Events".');
        window.dispatchEvent(new Event('navigateToProfile'));
        setFormData({
          title: '', description: '', category: '', date: '', time: '',
          location: { name: '', address: '', latitude: 0, longitude: 0 },
          hasTickets: false,
          ticketTypes: { ussdCode: '', webLink: '' },
          tags: [], flyerFile: null
        });
      } else {
        const data = await response.json();
        console.error('Server error:', data);
        toast.error(data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: { ...prev.location, latitude, longitude }
          }));
          setShowMap(true);
          toast.success('Location captured successfully!');
          setLocationLoading(false);
        },
        (error) => {
          toast.error('Failed to get location. Please enable location access.');
          setLocationLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
      setLocationLoading(false);
    }
  };

  const geocodeAddress = async () => {
    if (!formData.location.address) {
      toast.error('Please enter an address first');
      return;
    }
    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location.address)}&limit=1`
      );
      const data = await response.json();
      if (!data || data.length === 0) {
        toast.error('Address not found. Try a more specific address.');
        return;
      }
      const { lat, lon, display_name } = data[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      const venueName = formData.location.name || display_name.split(',')[0];
      setFormData(prev => ({
        ...prev,
        location: { name: venueName, address: formData.location.address, latitude, longitude }
      }));
      setShowMap(true);
      toast.success('Location found!');
    } catch (error) {
      toast.error('Failed to locate address. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 32, margin: 0 }}>Create Event</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>Fill in the details to submit your event for approval</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Title + Description */}
        <div style={S.card}>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}><IcoType /> Event Title</label>
            <input style={S.input} type="text" required placeholder="Enter event title"
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = '#FB8B24')}
              onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
            />
          </div>
          <div>
            <label style={S.label}><IcoText /> Description</label>
            <textarea style={{ ...S.input, resize: 'vertical', minHeight: 100 }} required placeholder="Describe your event"
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = '#FB8B24')}
              onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
            />
          </div>
        </div>

        {/* Category + Flyer */}
        <div style={{ ...S.card, ...S.row2 }}>
          <div>
            <label style={S.label}><IcoGrid /> Category</label>
            <select style={{ ...S.input, cursor: 'pointer' }} required
              value={formData.category}
              onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = '#FB8B24')}
              onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
            >
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}><IcoImage /> Event Flyer</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '1px dashed rgba(221,170,82,0.3)', borderRadius: 12, padding: '12px 16px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                background: '#0d0d0d', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#FB8B24')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(221,170,82,0.3)')}
            >
              <IcoUpload />
              <span style={{ color: formData.flyerFile ? '#FB8B24' : 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                {formData.flyerFile ? formData.flyerFile.name : 'Choose image file'}
              </span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => setFormData(p => ({ ...p, flyerFile: e.target.files?.[0] || null }))}
            />
          </div>
        </div>

        {/* Date + Time */}
        <div style={{ ...S.card, ...S.row2 }}>
          <div>
            <label style={S.label}><IcoCalendar /> Date</label>
            <input style={S.input} type="date" required
              value={formData.date}
              onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = '#FB8B24')}
              onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
            />
          </div>
          <div>
            <label style={S.label}><IcoClock /> Time</label>
            <input style={S.input} type="time" required
              value={formData.time}
              onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = '#FB8B24')}
              onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
            />
          </div>
        </div>

        {/* Location */}
        <div style={S.card}>
          <label style={{ ...S.label, marginBottom: 16 }}><IcoMapPin /> Location</label>
          <div style={{ marginBottom: 12 }}>
            <input style={S.input} type="text" required placeholder="Venue name"
              value={formData.location.name}
              onChange={e => setFormData(p => ({ ...p, location: { ...p.location, name: e.target.value } }))}
              onFocus={e => (e.target.style.borderColor = '#FB8B24')}
              onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input style={{ ...S.input, flex: 1 }} type="text" required placeholder="Full address"
              value={formData.location.address}
              onChange={e => setFormData(p => ({ ...p, location: { ...p.location, address: e.target.value } }))}
              onFocus={e => (e.target.style.borderColor = '#FB8B24')}
              onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
            />
            <button type="button" onClick={geocodeAddress} disabled={locationLoading} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px',
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)',
              borderRadius: 12, color: '#60a5fa', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.15)')}
            >
              <IcoSearch />{locationLoading ? 'Finding...' : 'Find'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={getCurrentLocation} disabled={locationLoading} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 18px', background: 'rgba(251,139,36,0.12)', border: '1px solid rgba(251,139,36,0.3)',
              borderRadius: 12, color: '#FB8B24', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,139,36,0.22)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(251,139,36,0.12)')}
            >
              <IcoLocate />{locationLoading ? 'Getting location...' : 'Use Current Location'}
            </button>
            {(formData.location.latitude !== 0 || formData.location.longitude !== 0) && (
              <button type="button" onClick={() => setShowMap(!showMap)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px',
                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: 12, color: '#a78bfa', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.22)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.12)')}
              >
                <IcoMap />{showMap ? 'Hide Map' : 'Show Map'}
              </button>
            )}
          </div>
          {(formData.location.latitude !== 0 || formData.location.longitude !== 0) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
              <IcoMapPin />{formData.location.latitude.toFixed(5)}, {formData.location.longitude.toFixed(5)}
            </div>
          )}
          {showMap && formData.location.latitude !== 0 && (
            <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(221,170,82,0.15)' }}>
              <iframe title="Event Location" width="100%" height="200" style={{ border: 0, display: 'block' }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.location.longitude - 0.01},${formData.location.latitude - 0.01},${formData.location.longitude + 0.01},${formData.location.latitude + 0.01}&layer=mapnik&marker=${formData.location.latitude},${formData.location.longitude}`}
              />
            </div>
          )}
        </div>

        {/* Tickets */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: formData.hasTickets ? 20 : 0 }}>
            <div onClick={() => setFormData(p => ({ ...p, hasTickets: !p.hasTickets }))} style={{
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative', flexShrink: 0,
              background: formData.hasTickets ? 'linear-gradient(90deg,#FB8B24,#DDAA52)' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: formData.hasTickets ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, fontSize: 14 }}>
              <span style={{ color: 'rgba(251,139,36,0.8)' }}><IcoTicket /></span> Requires Tickets
            </div>
          </div>

          {formData.hasTickets && (
            <>
              <div style={{ ...S.row2, marginBottom: 16 }}>
                <div style={{ background: '#0d0d0d', border: '1px solid rgba(221,170,82,0.15)', borderRadius: 14, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#FB8B24', fontWeight: 600, fontSize: 13 }}>
                    <IcoPhone /> USSD Code
                  </div>
                  <input style={S.input} type="text" placeholder="*123*456#"
                    value={formData.ticketTypes.ussdCode}
                    onChange={e => setFormData(p => ({ ...p, ticketTypes: { ...p.ticketTypes, ussdCode: e.target.value } }))}
                    onFocus={e => (e.target.style.borderColor = '#FB8B24')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
                  />
                  <p style={{ color: 'rgba(221,170,82,0.6)', fontSize: 12, marginTop: 8 }}>Clients tap to dial this code</p>
                </div>
                <div style={{ background: '#0d0d0d', border: '1px solid rgba(221,170,82,0.15)', borderRadius: 14, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#FB8B24', fontWeight: 600, fontSize: 13 }}>
                    <IcoLink /> Web Link
                  </div>
                  <input style={S.input} type="url" placeholder="https://tickets.example.com"
                    value={formData.ticketTypes.webLink}
                    onChange={e => setFormData(p => ({ ...p, ticketTypes: { ...p.ticketTypes, webLink: e.target.value } }))}
                    onFocus={e => (e.target.style.borderColor = '#FB8B24')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
                  />
                  <p style={{ color: 'rgba(221,170,82,0.6)', fontSize: 12, marginTop: 8 }}>Direct link to purchase page</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(251,139,36,0.06)', border: '1px solid rgba(251,139,36,0.2)', borderRadius: 12, padding: '12px 14px' }}>
                <span style={{ color: '#FB8B24', flexShrink: 0, marginTop: 1 }}><IcoInfo /></span>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>Provide a USSD code for mobile payments or a web link for online purchases. Clients will see clickable options on the event page.</p>
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        <div style={S.card}>
          <label style={{ ...S.label, marginBottom: 12 }}><IcoTag /> Tags</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input style={{ ...S.input, flex: 1 }} type="text" placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              onFocus={e => (e.target.style.borderColor = '#FB8B24')}
              onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
            />
            <button type="button" onClick={addTag} style={{
              padding: '12px 20px', background: 'rgba(251,139,36,0.12)', border: '1px solid rgba(251,139,36,0.3)',
              borderRadius: 12, color: '#FB8B24', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,139,36,0.22)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(251,139,36,0.12)')}
            >Add</button>
          </div>
          {formData.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {formData.tags.map((tag, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(251,139,36,0.12)', border: '1px solid rgba(251,139,36,0.25)',
                  borderRadius: 100, padding: '5px 12px', color: '#DDAA52', fontSize: 13, fontWeight: 500,
                }}>
                  {tag}
                  <button type="button" onClick={() => setFormData(p => ({ ...p, tags: p.tags.filter((_, j) => j !== i) }))} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(221,170,82,0.6)',
                    padding: 0, display: 'flex', alignItems: 'center', lineHeight: 1,
                  }}><IcoX /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? 'rgba(251,139,36,0.4)' : 'linear-gradient(90deg,#FB8B24,#DDAA52)',
          color: '#000', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10, transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
        }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          <IcoSend />{loading ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
}
