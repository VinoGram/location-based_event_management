import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { compressImage } from '../utils/imageCompression';
import { API_URL } from '../config';

interface UserProfileProps {
  user: any;
  onLogout: () => void;
}

export default function UserProfile({ user, onLogout }: UserProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: {
      city: "",
      state: "",
      latitude: 0,
      longitude: 0,
    },
    interests: [] as string[],
    notificationPreferences: {
      eventReminders: true,
      newEventsNearby: true,
      friendActivity: true,
      adminUpdates: true,
    },
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          bio: data.bio || "",
          location: data.location || { city: "", state: "", latitude: 0, longitude: 0 },
          interests: data.interests || [],
          notificationPreferences: data.notificationPreferences || {
            eventReminders: true,
            newEventsNearby: true,
            friendActivity: true,
            adminUpdates: true,
          },
        });
      } else {
        console.error('Profile fetch failed:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const interestOptions = [
    "Music", "Sports", "Food & Drink", "Arts & Culture", 
    "Business", "Technology", "Health & Wellness", "Education",
    "Outdoor Activities", "Gaming", "Photography", "Travel"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: locationField === "latitude" || locationField === "longitude" 
            ? Number(value) 
            : value,
        }
      }));
    } else if (name.startsWith("notificationPreferences.")) {
      const prefField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [prefField]: (e.target as HTMLInputElement).checked,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      
      try {
        const compressedFile = await compressImage(file, 2048);
        setAvatarFile(compressedFile);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        toast.error("Failed to process image");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem('token');
      
      if (avatarFile) {
        const formDataWithAvatar = new FormData();
        formDataWithAvatar.append('avatar', avatarFile);
        Object.entries(formData).forEach(([key, value]) => {
          formDataWithAvatar.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });
        
        const response = await fetch(`${API_URL}/api/users/profile`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formDataWithAvatar
        });
        
        if (response.ok) {
          const updatedProfile = await response.json();
          setProfile(updatedProfile);
          setIsEditing(false);
          setAvatarFile(null);
          setAvatarPreview(null);
          toast.success("Profile updated successfully!");
        } else {
          const errorData = await response.json();
          console.error('Profile update error:', errorData);
          toast.error(errorData.message || "Failed to update profile");
        }
      } else {
        const response = await fetch(`${API_URL}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const updatedProfile = await response.json();
          setProfile(updatedProfile);
          setIsEditing(false);
          toast.success("Profile updated successfully!");
        } else {
          const errorData = await response.json();
          console.error('Profile update error:', errorData);
          toast.error(errorData.message || "Failed to update profile");
        }
      }
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(251,139,36,0.2)', borderTopColor: '#FB8B24', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!profile && !isEditing) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 60px' }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 26, margin: 0 }}>Complete Your Profile</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>Tell us about yourself to get started</p>
        </div>
        <div style={{ background: '#111', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 20, padding: 16 }}>
          <ProfileForm
            formData={formData}
            avatarPreview={avatarPreview}
            interestOptions={interestOptions}
            isSubmitting={isSubmitting}
            fileInputRef={fileInputRef}
            onInputChange={handleInputChange}
            onInterestToggle={handleInterestToggle}
            onAvatarUpload={handleAvatarUpload}
            onSubmit={handleSubmit}
            onCancel={undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 60px' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 26, margin: 0 }}>
          {profile ? 'My Profile' : 'Complete Your Profile'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>
          {profile ? 'Manage your account settings and preferences' : 'Tell us about yourself to get started'}
        </p>
      </div>

      <div style={{ background: '#111', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 20, padding: 16 }}>
        {!isEditing && profile ? (
          <ProfileView
            profile={profile}
            user={user}
            onEdit={() => setIsEditing(true)}
            onLogout={onLogout}
          />
        ) : (
          <ProfileForm
            formData={formData}
            avatarPreview={avatarPreview || profile?.avatarUrl || null}
            interestOptions={interestOptions}
            isSubmitting={isSubmitting}
            fileInputRef={fileInputRef}
            onInputChange={handleInputChange}
            onInterestToggle={handleInterestToggle}
            onAvatarUpload={handleAvatarUpload}
            onSubmit={handleSubmit}
            onCancel={profile ? () => setIsEditing(false) : undefined}
          />
        )}
      </div>
    </div>
  );
}

// SVG Icons
const IcoUser = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoEdit = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoLogout = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoTrash = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoStar = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoShield = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoBell = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoMapPin = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoTag = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IcoCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoUsers = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoSettings = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IcoCamera = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative', flexShrink: 0,
      background: on ? 'linear-gradient(90deg,#FB8B24,#DDAA52)' : 'rgba(255,255,255,0.1)',
      transition: 'background 0.3s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

function ProfileView({ 
  profile, 
  user,
  onEdit,
  onLogout
}: { 
  profile: any; 
  user: any;
  onEdit: () => void;
  onLogout: () => void;
}) {
  const [notificationPrefs, setNotificationPrefs] = useState({
    eventReminders: profile.notificationPreferences?.eventReminders || false,
    newEventsNearby: profile.notificationPreferences?.newEventsNearby || false,
    friendActivity: profile.notificationPreferences?.friendActivity || false,
    adminUpdates: profile.notificationPreferences?.adminUpdates || false,
  });
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [myEventsLoading, setMyEventsLoading] = useState(true);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSaved = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) { setSavedLoading(false); return; }
      try {
        const res = await fetch(`${API_URL}/api/events/user/saved`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setSavedEvents(await res.json());
      } catch {}
      finally { setSavedLoading(false); }
    };

    const fetchMyEvents = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) { setMyEventsLoading(false); return; }
      try {
        const res = await fetch(`${API_URL}/api/events/user/my-events`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setMyEvents(await res.json());
      } catch {}
      finally { setMyEventsLoading(false); }
    };

    fetchSaved();
    fetchMyEvents();
  }, []);

  const handleNotificationChange = async (key: string, value: boolean) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: value }));
    
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          notificationPreferences: { ...notificationPrefs, [key]: value }
        })
      });
      toast.success('Notification preferences updated!');
    } catch (error) {
      toast.error('Failed to update preferences');
      setNotificationPrefs(prev => ({ ...prev, [key]: !value }));
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Avatar + info banner */}
      <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Top accent bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg,#FB8B24,#DDAA52,#A31818)' }} />
        <div style={{
          background: '#161616', padding: '16px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18, flexShrink: 0, overflow: 'hidden',
              background: 'linear-gradient(135deg,#FB8B24,#A31818)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.currentTarget.style.display = 'none')} />
                : <IcoUser />}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: '-0.3px' }}>{profile.firstName} {profile.lastName}</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, marginTop: 3 }}>{user?.email}</div>
              {user?.is_admin && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#eab308', fontWeight: 600, marginTop: 8, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                  <IcoShield /> Admin
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={onEdit} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
              background: 'linear-gradient(90deg,#FB8B24,#DDAA52)', border: 'none',
              borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '-0.1px',
            }}><IcoEdit /> Edit Profile</button>
            <button onClick={onLogout} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}><IcoLogout /> Logout</button>

          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div style={{ background: '#111', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>About</div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{profile.bio}</p>
        </div>
      )}

      {/* Location + Interests row */}
      <div style={{ display: 'grid', gridTemplateColumns: profile.location && profile.interests?.length ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr', gap: 16 }}>
        {profile.location && (
          <div style={{ background: '#111', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(251,139,36,0.8)', marginBottom: 10 }}>
              <IcoMapPin />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</span>
            </div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{profile.location.city}{profile.location.state ? `, ${profile.location.state}` : ''}</div>
          </div>
        )}
        {profile.interests && profile.interests.length > 0 && (
          <div style={{ background: '#111', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(251,139,36,0.8)', marginBottom: 10 }}>
              <IcoTag />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interests</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.interests.map((i: string) => (
                <span key={i} style={{ background: 'rgba(251,139,36,0.1)', border: '1px solid rgba(251,139,36,0.2)', borderRadius: 100, padding: '4px 12px', color: '#DDAA52', fontSize: 12, fontWeight: 500 }}>{i}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* My Created Events */}
      <div style={{ background: '#111', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 16, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ color: 'rgba(251,139,36,0.8)' }}><IcoCalendar /></span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>My Created Events</span>
          <span style={{ marginLeft: 'auto', background: 'rgba(251,139,36,0.15)', color: '#FB8B24', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{myEvents.length}</span>
        </div>
        {myEventsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(251,139,36,0.2)', borderTopColor: '#FB8B24', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : myEvents.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0, textAlign: 'center', padding: '12px 0' }}>No events created yet. Use the Create tab to submit your first event.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myEvents.map((ev: any) => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#161616', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {ev.flyer_url
                  ? <img src={ev.flyer_url} alt={ev.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'linear-gradient(135deg,rgba(251,139,36,0.3),rgba(163,24,24,0.3))', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(251,139,36,0.6)', fontSize: 20 }}>🎪</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                    {ev.date ? new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    {ev.location_name ? ` · ${ev.location_name}` : ''}
                  </div>
                </div>
                <span style={{
                  background: ev.status === 'approved' ? 'rgba(34,197,94,0.15)' : ev.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                  color: ev.status === 'approved' ? '#4ade80' : ev.status === 'rejected' ? '#f87171' : '#facc15',
                  borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, flexShrink: 0, textTransform: 'capitalize'
                }}>{ev.status}</span>
                <button
                  disabled={deletingEventId === ev.id}
                  onClick={async () => {
                    if (!confirm('Delete this event? This cannot be undone.')) return;
                    setDeletingEventId(ev.id);
                    try {
                      const token = sessionStorage.getItem('token');
                      const res = await fetch(`${API_URL}/api/events/user/my-events/${ev.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (res.ok) {
                        setMyEvents(prev => prev.filter(e => e.id !== ev.id));
                        toast.success('Event deleted');
                      } else {
                        const d = await res.json();
                        toast.error(d.message || 'Failed to delete event');
                      }
                    } catch { toast.error('Failed to delete event'); }
                    finally { setDeletingEventId(null); }
                  }}
                  style={{ background: 'transparent', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, color: 'rgba(255,80,80,0.7)', cursor: 'pointer', padding: '6px 10px', fontSize: 12, flexShrink: 0, opacity: deletingEventId === ev.id ? 0.5 : 1 }}
                >
                  {deletingEventId === ev.id ? '…' : <IcoTrash />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Events */}
      <div style={{ background: '#111', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 16, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ color: 'rgba(251,139,36,0.8)' }}><IcoCalendar /></span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Saved Events</span>
          <span style={{ marginLeft: 'auto', background: 'rgba(251,139,36,0.15)', color: '#FB8B24', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{savedEvents.length}</span>
        </div>
        {savedLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(251,139,36,0.2)', borderTopColor: '#FB8B24', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : savedEvents.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0, textAlign: 'center', padding: '12px 0' }}>No saved events yet. Bookmark events to see them here.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {savedEvents.filter(Boolean).map((ev: any) => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#161616', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {ev.flyer_url
                  ? <img src={ev.flyer_url} alt={ev.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'linear-gradient(135deg,rgba(251,139,36,0.3),rgba(163,24,24,0.3))', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(251,139,36,0.6)', fontSize: 20 }}>🎫</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                    {ev.date ? new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    {ev.location_name ? ` · ${ev.location_name}` : ''}
                  </div>
                </div>
                <span style={{ background: 'rgba(221,170,82,0.1)', color: '#DDAA52', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{ev.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div style={{ background: '#111', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 16, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ color: 'rgba(251,139,36,0.8)' }}><IcoBell /></span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Notification Preferences</span>
        </div>
        {([
          { key: 'eventReminders',  label: 'Event Reminders',  icon: <IcoCalendar />,  desc: 'Reminders before events you RSVP to' },
          { key: 'newEventsNearby', label: 'New Events Nearby', icon: <IcoMapPin />,    desc: 'Alerts for events in your area' },
          { key: 'friendActivity',  label: 'Friend Activity',  icon: <IcoUsers />,     desc: 'When friends RSVP to events' },
          { key: 'adminUpdates',    label: 'Admin Updates',    icon: <IcoSettings />,  desc: 'Platform announcements' },
        ] as { key: keyof typeof notificationPrefs; label: string; icon: React.ReactNode; desc: string }[]).map(({ key, label, icon, desc }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ color: 'rgba(251,139,36,0.7)', marginTop: 1 }}>{icon}</span>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{label}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
            <Toggle on={notificationPrefs[key]} onChange={v => handleNotificationChange(key, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileForm({
  formData,
  avatarPreview,
  interestOptions,
  isSubmitting,
  fileInputRef,
  onInputChange,
  onInterestToggle,
  onAvatarUpload,
  onSubmit,
  onCancel,
}: {
  formData: any;
  avatarPreview: string | null;
  interestOptions: string[];
  isSubmitting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onInterestToggle: (interest: string) => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
}) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
          background: 'linear-gradient(135deg,#FB8B24,#A31818)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(251,139,36,0.25)', color: '#fff',
        }}>
          {avatarPreview
            ? <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.currentTarget.style.display = 'none')} />
            : <IcoUser />}
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          color: '#DDAA52', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}><IcoCamera /> Change Avatar</button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarUpload} style={{ display: 'none' }} />
      </div>

      {/* Name */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {[{ label: 'First Name', name: 'firstName', val: formData.firstName }, { label: 'Last Name', name: 'lastName', val: formData.lastName }].map(f => (
          <div key={f.name}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{f.label}</label>
            <input type="text" name={f.name} value={f.val} onChange={onInputChange} required
              style={{ width: '100%', padding: '12px 16px', background: '#0d0d0d', border: '1px solid rgba(221,170,82,0.18)', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#FB8B24')} onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
            />
          </div>
        ))}
      </div>

      {/* Bio */}
      <div>
        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Bio</label>
        <textarea name="bio" value={formData.bio} onChange={onInputChange} rows={3}
          placeholder="Tell us about yourself..."
          style={{ width: '100%', padding: '12px 16px', background: '#0d0d0d', border: '1px solid rgba(221,170,82,0.18)', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          onFocus={e => (e.target.style.borderColor = '#FB8B24')} onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
        />
      </div>

      {/* Location */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {[{ label: 'City', name: 'location.city', val: formData.location.city }, { label: 'State', name: 'location.state', val: formData.location.state }].map(f => (
          <div key={f.name}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{f.label}</label>
            <input type="text" name={f.name} value={f.val} onChange={onInputChange}
              style={{ width: '100%', padding: '12px 16px', background: '#0d0d0d', border: '1px solid rgba(221,170,82,0.18)', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#FB8B24')} onBlur={e => (e.target.style.borderColor = 'rgba(221,170,82,0.18)')}
            />
          </div>
        ))}
      </div>

      {/* Interests */}
      <div>
        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Interests</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {interestOptions.map(i => (
            <button key={i} type="button" onClick={() => onInterestToggle(i)} style={{
              padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              background: formData.interests.includes(i) ? 'linear-gradient(90deg,#FB8B24,#DDAA52)' : 'rgba(255,255,255,0.05)',
              border: formData.interests.includes(i) ? 'none' : '1px solid rgba(221,170,82,0.2)',
              color: formData.interests.includes(i) ? '#000' : 'rgba(255,255,255,0.6)',
            }}>{i}</button>
          ))}
        </div>
      </div>

      {/* Notification Prefs */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 14, padding: '20px 20px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ color: 'rgba(251,139,36,0.8)' }}><IcoBell /></span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notification Preferences</span>
        </div>
        {([
          { name: 'notificationPreferences.eventReminders',  label: 'Event Reminders',  checked: formData.notificationPreferences.eventReminders },
          { name: 'notificationPreferences.newEventsNearby', label: 'New Events Nearby', checked: formData.notificationPreferences.newEventsNearby },
          { name: 'notificationPreferences.friendActivity',  label: 'Friend Activity',  checked: formData.notificationPreferences.friendActivity },
          { name: 'notificationPreferences.adminUpdates',    label: 'Admin Updates',    checked: formData.notificationPreferences.adminUpdates },
        ]).map(pref => (
          <div key={pref.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{pref.label}</span>
            <input type="checkbox" name={pref.name} checked={pref.checked} onChange={onInputChange}
              style={{ width: 18, height: 18, accentColor: '#FB8B24', cursor: 'pointer' }} />
          </div>
        ))}
        <div style={{ height: 8 }} />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" disabled={isSubmitting} style={{
          flex: 1, padding: '13px', borderRadius: 12, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
          background: 'linear-gradient(90deg,#FB8B24,#DDAA52)', color: '#000', fontWeight: 700, fontSize: 14, opacity: isSubmitting ? 0.6 : 1,
        }}>{isSubmitting ? 'Saving...' : 'Save Profile'}</button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{
            flex: 1, padding: '13px', borderRadius: 12, cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>Cancel</button>
        )}
      </div>
    </form>
  );
}
