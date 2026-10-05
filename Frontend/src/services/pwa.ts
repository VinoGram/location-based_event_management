export class PWAService {
  private registration: ServiceWorkerRegistration | null = null;

  async register() {
    if ('serviceWorker' in navigator) {
      try {
        // Disable service worker registration for now
        console.log('Service worker registration disabled');
        return null;
      } catch (error) {
        console.log('SW registration failed:', error);
      }
    }
  }

  private onUpdateFound = () => {
    const newWorker = this.registration?.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.showUpdateNotification();
        }
      });
    }
  };

  private showUpdateNotification() {
    if (confirm('New version available. Click to update.')) {
      this.skipWaiting();
    }
  }

  private skipWaiting() {
    const newWorker = this.registration?.waiting;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
}

export const pwaService = new PWAService();