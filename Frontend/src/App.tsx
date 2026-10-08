import { useState, useEffect, lazy, Suspense } from 'react';
import { useLiveUpdates } from './hooks/useLiveUpdates';
import { Box, Flex, Button, Text, HStack, VStack, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { Toaster } from 'sonner';
import Homepage from './components/Homepage';
import { AuthCallback } from './components/AuthCallback';
import UserAvatar from './components/UserAvatar';
import { currencyService } from './services/currencyService';
import { API_URL } from './config';
import './index.css';

// Lazy-load heavy views — only downloaded when the user navigates to them
const EventDiscovery   = lazy(() => import('./components/EventDiscovery'));
const UserProfile      = lazy(() => import('./components/UserProfile'));
const CreateEvent      = lazy(() => import('./components/CreateEvent'));
const AdminDashboard   = lazy(() => import('./components/AdminDashboard'));
const SettingsScreen   = lazy(() => import('./components/SettingsScreen'));
const UpdateNotification = lazy(() => import('./components/UpdateNotification'));
const CurrencySelector = lazy(() => import('./components/CurrencySelector'));

const ViewLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(251,139,36,0.2)', borderTopColor: '#FB8B24', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  is_premium: boolean;
  is_admin?: boolean;
  profilePicture?: string;
  avatarUrl?: string;
  profile_picture?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [currentView, setCurrentView] = useState<'events' | 'profile' | 'premium' | 'settings' | 'create' | 'admin'>('events');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'requesting'>('prompt');
  const [deepLinkEventId, setDeepLinkEventId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('event');
  });
  
  const [currency, setCurrency] = useState(currencyService.getCurrentCurrency());

  // Eager live updates for everyone
  useLiveUpdates();

  // Handle deep link: ?event=ID — navigate to events tab and clear param
  useEffect(() => {
    if (deepLinkEventId) {
      setCurrentView('events');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [deepLinkEventId]);

  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationPermission('denied'); return; }
    setLocationPermission('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocationPermission('granted');
        // Start watching only after initial permission is granted
        navigator.geolocation.watchPosition(
          (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => {},
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        );
      },
      () => setLocationPermission('denied'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleUpgrade = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setCurrentView('events');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setCurrentView('events');
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');

    if (token && savedUser) {
      // Show cached user immediately, then refresh in background
      setUser(JSON.parse(savedUser));
      fetch(`${API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
        if (res.ok) {
          return res.json().then(profileData => {
            const merged = { ...JSON.parse(savedUser), ...profileData };
            setUser(merged);
            sessionStorage.setItem('user', JSON.stringify(merged));
          });
        } else if (res.status === 401) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setUser(null);
        }
      }).catch(() => {});
    }

    requestLocation();

    // Defer currency detection — not needed for initial render
    setTimeout(() => {
      if (userLocation) {
        currencyService.detectCurrencyFromLocation(userLocation.latitude, userLocation.longitude)
          .then(() => setCurrency(currencyService.getCurrentCurrency()));
      }
    }, 3000);

    const handleNavigateToCreate = () => setCurrentView('create');
    const handleNavigateToEvents = () => setCurrentView('events');
    const handleNavigateToProfile = () => setCurrentView('profile');

    window.addEventListener('navigateToCreate', handleNavigateToCreate);
    window.addEventListener('navigateToEvents', handleNavigateToEvents);
    window.addEventListener('navigateToProfile', handleNavigateToProfile);

    return () => {
      window.removeEventListener('navigateToCreate', handleNavigateToCreate);
      window.removeEventListener('navigateToEvents', handleNavigateToEvents);
      window.removeEventListener('navigateToProfile', handleNavigateToProfile);
    };
  }, []);

  const isAuthCallback = window.location.pathname === '/auth/callback';
  if (isAuthCallback) {
    return (
      <>
        <AuthCallback onAuthSuccess={handleAuthSuccess} />
        <Toaster position="top-right" />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Homepage onAuthSuccess={handleAuthSuccess} />
        <Toaster position="top-right" />
        <UpdateNotification />
      </>
    );
  }

  return (
    <Box minH="100vh" bg="#000000">
      {/* Desktop top nav — hidden on mobile */}
      <Box bg="whiteAlpha.100" backdropFilter="blur(10px)" borderBottom="1px" borderColor="whiteAlpha.200" display={['none', 'none', 'block']}>
        <Box maxW="7xl" mx="auto" px={[4, 6, 8]}>
          <Flex justify="space-between" align="center" h={16}>
            <HStack spacing={8}>
              <HStack spacing={3}>
                <Text fontSize="2xl" fontWeight="bold" color="white">Euforia</Text>
              </HStack>
              <HStack spacing={4}>
                {(['events', 'profile', 'create', 'settings'] as const).map(view => (
                  <Button key={view} onClick={() => setCurrentView(view)}
                    variant={currentView === view ? 'solid' : 'ghost'}
                    colorScheme={currentView === view ? 'whiteAlpha' : undefined}
                    color={currentView === view ? 'white' : 'whiteAlpha.700'}
                    _hover={{ color: 'white', bg: 'whiteAlpha.100' }} size="sm"
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </Button>
                ))}
                {user.is_admin && (
                  <Button onClick={() => setCurrentView('admin')}
                    variant={currentView === 'admin' ? 'solid' : 'ghost'}
                    bgGradient={currentView === 'admin' ? 'linear(to-r, purple.500, pink.500)' : undefined}
                    color={currentView === 'admin' ? 'white' : 'whiteAlpha.700'}
                    _hover={{ color: 'white', bg: 'whiteAlpha.100' }} size="sm"
                  >Admin</Button>
                )}
              </HStack>
            </HStack>
            <HStack spacing={3}>
              <UserAvatar
                src={user.avatarUrl || user.profilePicture || user.profile_picture}
                name={`${user.firstName} ${user.lastName}`}
                size={34}
                radius={10}
              />
              <Text color="whiteAlpha.700" fontSize="sm">{user.firstName}</Text>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Mobile top bar */}
      <Box bg="#0a0a0a" borderBottom="1px solid rgba(255,255,255,0.07)" px={4} py={3} display={['flex', 'flex', 'none']} alignItems="center" justifyContent="space-between" position="sticky" top={0} zIndex={100}>
        <Text fontSize="xl" fontWeight="bold" color="white">Euforia</Text>
        <Box as="button" onClick={() => setCurrentView('profile')} bg="transparent" border="none" cursor="pointer" p={0}>
          <UserAvatar
            src={user.avatarUrl || user.profilePicture || user.profile_picture}
            name={`${user.firstName} ${user.lastName}`}
            size={32}
            radius={9}
          />
        </Box>
      </Box>

      {(locationPermission === 'denied' || locationPermission === 'requesting') && (
        <Alert status="warning" bg="rgba(251,139,36,0.1)" borderBottom="1px" borderColor="rgba(251,139,36,0.3)">
          <Box maxW="7xl" mx="auto" w="full" px={[3,4,8]}>
            <Flex justify="space-between" align="center" gap={2} flexWrap="wrap" py={1}>
              <HStack spacing={3}>
                <AlertIcon color="#FB8B24" />
                <VStack align="start" spacing={0}>
                  <AlertTitle color="white" fontWeight="semibold" fontSize={['sm', 'md']}>
                    {locationPermission === 'requesting' ? 'Waiting for permission...' : 'Location needed'}
                  </AlertTitle>
                  <AlertDescription color="whiteAlpha.700" fontSize="xs">
                    {locationPermission === 'requesting'
                      ? 'Please allow location access in your browser prompt'
                      : 'Enable location to find events near you'}
                  </AlertDescription>
                </VStack>
              </HStack>
              {locationPermission === 'denied' && (
                <Button onClick={requestLocation}
                  size="sm"
                  style={{ background: 'linear-gradient(90deg,#FB8B24,#DDAA52)', color: '#000', fontWeight: 700, borderRadius: 10 }}>
                  Enable Location
                </Button>
              )}
              {locationPermission === 'requesting' && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(251,139,36,0.3)', borderTopColor: '#FB8B24', animation: 'spin 0.8s linear infinite' }} />
              )}
            </Flex>
          </Box>
        </Alert>
      )}

      {/* Main content — add bottom padding on mobile for tab bar */}
      <Box as="main" maxW="7xl" mx="auto" px={[3, 4, 8]} py={[4, 6, 8]} pb={['80px', '80px', 8]}>
        <div key={currentView} className="page-enter will-animate">
          <Suspense fallback={<ViewLoader />}>
            {currentView === 'events'   && <EventDiscovery userLocation={userLocation} currency={currency} deepLinkEventId={deepLinkEventId} />}
            {currentView === 'profile'  && <UserProfile user={user} onLogout={handleLogout} />}
            {currentView === 'create'   && <CreateEvent />}
            {currentView === 'settings' && <SettingsScreen user={user} onUpgrade={handleUpgrade} onLogout={handleLogout} />}
            {currentView === 'admin'    && user.is_admin && <AdminDashboard />}
          </Suspense>
        </div>
      </Box>

      {/* Mobile bottom tab bar */}
      <Box display={['flex', 'flex', 'none']} className="tab-bar">
        {([
          {
            view: 'events', label: 'Events',
            icon: (active: boolean) => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            ),
          },
          {
            view: 'profile', label: 'Profile',
            icon: (active: boolean) => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            ),
          },
          {
            view: 'create', label: 'Create',
            icon: (active: boolean) => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            ),
          },
          {
            view: 'settings', label: 'Settings',
            icon: (active: boolean) => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            ),
          },
          ...(user.is_admin ? [{
            view: 'admin' as const, label: 'Admin',
            icon: (active: boolean) => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            ),
          }] : []),
        ] as { view: typeof currentView; label: string; icon: (active: boolean) => JSX.Element }[]).map(({ view, label, icon }) => {
          const active = currentView === view;
          return (
            <button key={view} className={`tab-item${active ? ' active' : ''}`} onClick={() => setCurrentView(view)}>
              <span className="tab-item__icon">{icon(active)}</span>
              <span className="tab-item__label">{label}</span>
            </button>
          );
        })}
      </Box>

      <Toaster position="top-right" />
    </Box>
  );
}

export default App;