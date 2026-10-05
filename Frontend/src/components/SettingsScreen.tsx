import { useState } from "react";
import { toast } from "sonner";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsAndConditions from "./TermsAndConditions";
import CookiePolicy from "./CookiePolicy";

interface SettingsScreenProps {
  user: any;
  onUpgrade: () => void;
  onLogout: () => void;
}

type Section = 'account' | 'subscription' | 'preferences' | 'security' | 'legal' | 'danger';

// SVG icon components
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconSliders = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconAlertTriangle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);
const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconMonitor = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconCookie = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/>
  </svg>
);

const nav: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'account',      label: 'Account',      icon: <IconUser /> },
  { id: 'subscription', label: 'Subscription',  icon: <IconStar /> },
  { id: 'preferences',  label: 'Preferences',   icon: <IconSliders /> },
  { id: 'security',     label: 'Security',      icon: <IconLock /> },
  { id: 'legal',        label: 'Legal',         icon: <IconFile /> },
  { id: 'danger',       label: 'Danger Zone',   icon: <IconAlertTriangle /> },
];

const features = [
  'Unlimited event discovery radius',
  'Advanced filtering and sorting',
  'Personalized AI recommendations',
  'Exclusive events access',
  'Early access to popular events',
  'Group planning & global chat',
];

// Reusable row component
function Row({ icon, label, value, action }: { icon?: React.ReactNode; label: string; value?: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {icon && (
          <div style={{ color: 'rgba(251,139,36,0.7)', marginTop: 1, flexShrink: 0 }}>{icon}</div>
        )}
        <div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{label}</div>
          {value && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 2 }}>{value}</div>}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0, marginLeft: 16 }}>{action}</div>}
    </div>
  );
}

// Toggle switch
function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div onClick={() => setOn(!on)} style={{
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative',
      background: on ? 'linear-gradient(90deg,#FB8B24,#DDAA52)' : 'rgba(255,255,255,0.1)',
      transition: 'background 0.3s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

// Arrow link button
function LinkBtn({ children, onClick, danger }: { children: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        color: danger ? (hov ? '#ff6b6b' : '#ff4444') : (hov ? '#FB8B24' : '#DDAA52'),
        fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
        transition: 'color 0.2s',
      }}>
      {children}
      <IconArrowRight />
    </button>
  );
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SettingsScreen({ user, onUpgrade, onLogout }: SettingsScreenProps) {
  const [active, setActive] = useState<Section>('account');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookies, setShowCookies] = useState(false);

  const getToken = () => sessionStorage.getItem('token');

  const handleChangePassword = async () => {
    const current = prompt('Enter your current password:');
    if (!current) return;
    const next = prompt('Enter your new password (min 8 chars):');
    if (!next || next.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    try {
      const res = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      res.ok ? toast.success('Password changed successfully') : toast.error(data.message || 'Failed to change password');
    } catch { toast.error('Failed to change password'); }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/2fa/enable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      res.ok ? toast.success(data.message || '2FA setup initiated — check your email') : toast.error(data.message || 'Failed to enable 2FA');
    } catch { toast.error('Failed to enable 2FA'); }
  };

  const handleViewSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/sessions`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        const list = data.sessions?.map((s: any) => `• ${s.device} — ${s.location} (${s.last_active})`).join('\n') || 'No active sessions found.';
        alert(`Active Sessions:\n\n${list}`);
      } else toast.error(data.message || 'Failed to fetch sessions');
    } catch { toast.error('Failed to fetch sessions'); }
  };

  const handleDataExport = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/data-export`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'euforia-data.json'; a.click();
        URL.revokeObjectURL(url);
        toast.success('Data export downloaded');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to export data');
      }
    } catch { toast.error('Failed to export data'); }
  };

  const card = (children: React.ReactNode) => (
    <div style={{
      background: '#111', border: '1px solid rgba(221,170,82,0.12)',
      borderRadius: 20, padding: '28px 28px 8px', marginBottom: 20,
    }}>
      {children}
    </div>
  );

  const sectionTitle = (title: string, subtitle?: string) => (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 18, margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
  );

  const renderContent = () => {
    switch (active) {

      case 'account':
        return (
          <>
            {/* Avatar + name banner */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(251,139,36,0.12),rgba(163,24,24,0.08))',
              border: '1px solid rgba(251,139,36,0.2)', borderRadius: 20,
              padding: '28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                background: 'linear-gradient(135deg,#FB8B24,#A31818)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 800, color: '#fff',
                boxShadow: '0 0 24px rgba(251,139,36,0.3)',
              }}>
                {(user.profilePicture || user.avatarUrl || user.profile_picture)
                  ? <img
                      src={user.profilePicture || user.avatarUrl || user.profile_picture}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  : (user.firstName?.[0] || '?').toUpperCase()
                }
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>{user.firstName} {user.lastName}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 2 }}>{user.email}</div>
              </div>
            </div>

            {card(
              <>
                {sectionTitle('Account Details')}
                <Row label="Email" value={user.email} />
                <Row label="Full Name" value={`${user.firstName} ${user.lastName}`} />
                <Row label="Member Since" value="2024" action={<span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Active</span>} />
                <div style={{ height: 16 }} />
              </>
            )}

            {card(
              <>
                {sectionTitle('Language', 'Change the language used in the app')}
                <div style={{ paddingBottom: 20 }}>
                  <select style={{
                    background: '#1a1a1a', border: '1px solid rgba(221,170,82,0.25)',
                    borderRadius: 10, padding: '10px 16px', color: '#fff', fontSize: 14,
                    outline: 'none', cursor: 'pointer', width: '100%', maxWidth: 220,
                  }}>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="pt">🇧🇷 Português</option>
                  </select>
                </div>
              </>
            )}
          </>
        );

      case 'subscription':
        return (
          <>
            <div style={{
              background: '#111', border: '1px solid rgba(221,170,82,0.12)',
              borderRadius: 20, overflow: 'hidden', marginBottom: 20,
            }}>
              <div style={{ height: 3, background: 'linear-gradient(90deg,#FB8B24,#DDAA52,#A31818)' }} />
              <div style={{ padding: 28 }}>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Current Plan</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginTop: 4, letterSpacing: '-0.3px' }}>Free Plan</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>You have access to every feature — completely free.</div>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
                  {features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FB8B24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 'preferences':
        return card(
          <>
            {sectionTitle('Preferences', 'Customize your Euforia experience')}
            <Row icon={<IconBell />} label="Push Notifications" value="Get notified about new events and updates" action={<Toggle defaultOn={true} />} />
            <Row icon={<IconMapPin />} label="Location Services" value="Allow location access for nearby events" action={<Toggle defaultOn={true} />} />
            <Row icon={<IconMail />} label="Email Digest" value="Weekly summary of events near you" action={<Toggle defaultOn={false} />} />
            <Row icon={<IconUsers />} label="Friend Activity" value="See when friends RSVP to events" action={<Toggle defaultOn={true} />} />
            <div style={{ height: 16 }} />
          </>
        );

      case 'security':
        return (
          <>
            {card(
              <>
                {sectionTitle('Security', 'Keep your account safe')}
                <Row icon={<IconKey />} label="Password" value="Last changed recently" action={<LinkBtn onClick={() => handleChangePassword()}>Change Password</LinkBtn>} />
                <Row icon={<IconShield />} label="Two-Factor Auth" value="Add an extra layer of security" action={<LinkBtn onClick={() => handleEnable2FA()}>Enable 2FA</LinkBtn>} />
                <Row icon={<IconMonitor />} label="Active Sessions" value="Manage devices logged in" action={<LinkBtn onClick={() => handleViewSessions()}>View Sessions</LinkBtn>} />
                <div style={{ height: 16 }} />
              </>
            )}
            {card(
              <>
                {sectionTitle('Privacy', 'Control your data and visibility')}
                <Row icon={<IconEye />} label="Privacy Settings" value="Manage what you share on Euforia" action={<LinkBtn>Manage</LinkBtn>} />
                <Row icon={<IconDownload />} label="Data Export" value="Download a copy of your data" action={<LinkBtn onClick={() => handleDataExport()}>Export</LinkBtn>} />
                <div style={{ height: 16 }} />
              </>
            )}
          </>
        );

      case 'legal':
        return card(
          <>
            {sectionTitle('Legal', 'Policies and terms')}
            <Row icon={<IconEye />} label="Privacy Policy" value="How we handle your data" action={<LinkBtn onClick={() => setShowPrivacy(true)}>Read</LinkBtn>} />
            <Row icon={<IconFile />} label="Terms & Conditions" value="Rules for using Euforia" action={<LinkBtn onClick={() => setShowTerms(true)}>Read</LinkBtn>} />
            <Row icon={<IconCookie />} label="Cookie Policy" value="How we use cookies" action={<LinkBtn onClick={() => setShowCookies(true)}>Read</LinkBtn>} />
            <div style={{ height: 16 }} />
          </>
        );

      case 'danger':
        return (
          <>
            <div style={{
              background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.2)',
              borderRadius: 20, padding: 28, marginBottom: 20,
            }}>
              {sectionTitle('Sign Out', 'End your current session')}
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20 }}>
                You'll need to sign in again to access your account.
              </p>
              <button onClick={onLogout} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', borderRadius: 12, padding: '11px 28px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                Sign Out
              </button>
            </div>

            <div style={{
              background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.2)',
              borderRadius: 20, padding: 28,
            }}>
              {sectionTitle('Delete Account', 'Permanently remove your account')}
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20 }}>
                This will permanently delete your account, events, and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={async () => {
                  if (confirm('Are you sure? This cannot be undone.')) {
                    try {
                      const token = sessionStorage.getItem('token');
                      const res = await fetch('/api/users/account', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                      if (res.ok) { toast.success('Account deleted'); onLogout(); }
                      else toast.error('Failed to delete account');
                    } catch { toast.error('Failed to delete account'); }
                  }
                }}
                style={{
                  background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)',
                  color: '#ff4444', borderRadius: 12, padding: '11px 28px',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,68,68,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,68,68,0.15)')}
              >
                Delete Account
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 0 60px' }}>
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsAndConditions onClose={() => setShowTerms(false)} />}
      {showCookies && <CookiePolicy onClose={() => setShowCookies(false)} />}

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#FB8B24,#A31818)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', boxShadow: '0 0 20px rgba(251,139,36,0.25)' }}>
          {(user.profilePicture || user.avatarUrl || user.profile_picture)
            ? <img src={user.profilePicture || user.avatarUrl || user.profile_picture} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
            : (user.firstName?.[0] || '?').toUpperCase()
          }
        </div>
        <div>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 28, margin: 0 }}>Settings</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>Manage your account and preferences</p>
        </div>
      </div>

      {/* Mobile: horizontal scrollable nav */}
      <div className="md:hidden" style={{ overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
          {nav.map(n => {
            const isActive = active === n.id;
            const isDanger = n.id === 'danger';
            return (
              <button key={n.id} onClick={() => setActive(n.id)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px',
                borderRadius: 20, border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
                background: isActive ? (isDanger ? 'rgba(255,68,68,0.15)' : 'rgba(251,139,36,0.15)') : 'rgba(255,255,255,0.04)',
                color: isActive ? (isDanger ? '#ff4444' : '#FB8B24') : 'rgba(255,255,255,0.55)',
                fontWeight: isActive ? 700 : 500, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {n.icon} {n.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar nav — desktop only */}
        <div className="hidden md:block" style={{ width: 200, flexShrink: 0, background: '#111', border: '1px solid rgba(221,170,82,0.12)', borderRadius: 20, padding: 10, position: 'sticky', top: 20 }}>
          {nav.map(n => {
            const isActive = active === n.id;
            const isDanger = n.id === 'danger';
            return (
              <button key={n.id} onClick={() => setActive(n.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: isActive ? (isDanger ? 'rgba(255,68,68,0.12)' : 'rgba(251,139,36,0.12)') : 'transparent',
                color: isActive ? (isDanger ? '#ff4444' : '#FB8B24') : (isDanger ? 'rgba(255,100,100,0.6)' : 'rgba(255,255,255,0.55)'),
                fontWeight: isActive ? 700 : 500, fontSize: 13, textAlign: 'left', transition: 'all 0.2s', marginBottom: 2,
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{n.icon}</span>
                {n.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
