interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

class CurrencyConverter {
  private rates: ExchangeRates = {};
  private lastUpdate: number = 0;
  private readonly UPDATE_INTERVAL = 3600000; // 1 hour

  private currencies: { [key: string]: CurrencyInfo } = {
    USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
    NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    GHS: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
    KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
  };

  async updateRates(): Promise<void> {
    const now = Date.now();
    if (now - this.lastUpdate < this.UPDATE_INTERVAL && Object.keys(this.rates).length > 0) {
      return;
    }

    try {
      // Using a free API for exchange rates
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      this.rates = data.rates;
      this.lastUpdate = now;
      
      // Store in localStorage for offline use
      localStorage.setItem('exchangeRates', JSON.stringify({
        rates: this.rates,
        timestamp: now
      }));
    } catch (error) {
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem('exchangeRates');
      if (stored) {
        const { rates, timestamp } = JSON.parse(stored);
        if (now - timestamp < 86400000) { // Use cached rates if less than 24 hours old
          this.rates = rates;
          this.lastUpdate = timestamp;
        }
      }
      
      // Ultimate fallback rates
      if (Object.keys(this.rates).length === 0) {
        this.rates = {
          USD: 1, EUR: 0.85, GBP: 0.73, NGN: 1650, GHS: 12,
          KES: 129, ZAR: 18.5, CAD: 1.35, AUD: 1.52, JPY: 150
        };
      }
    }
  }

  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = this.rates[fromCurrency] || 1;
    const toRate = this.rates[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }

  formatPrice(amount: number, currency: string): string {
    const currencyInfo = this.currencies[currency];
    if (!currencyInfo) return `${Math.round(amount)} ${currency}`;
    
    // Format with no decimals for whole numbers, or appropriate decimals
    const formatted = amount % 1 === 0 ? Math.round(amount) : amount.toFixed(2);
    return `${currencyInfo.symbol}${formatted}`;
  }

  getCurrencyInfo(code: string): CurrencyInfo | null {
    return this.currencies[code] || null;
  }

  getAvailableCurrencies(): CurrencyInfo[] {
    return Object.values(this.currencies);
  }

  async detectUserCurrency(userLocation?: { latitude: number; longitude: number }): Promise<string> {
    // Try to detect currency based on location
    if (userLocation) {
      const { latitude, longitude } = userLocation;
      
      // Simple region-based currency detection
      if (latitude >= 25 && latitude <= 49 && longitude >= -125 && longitude <= -66) return 'USD'; // USA
      if (latitude >= 35 && latitude <= 71 && longitude >= -10 && longitude <= 40) return 'EUR'; // Europe
      if (latitude >= 50 && latitude <= 61 && longitude >= -8 && longitude <= 2) return 'GBP'; // UK
      if (latitude >= 4 && latitude <= 14 && longitude >= 3 && longitude <= 15) return 'NGN'; // Nigeria
      if (latitude >= 4.5 && latitude <= 11.5 && longitude >= -3.5 && longitude <= 1.5) return 'GHS'; // Ghana
      if (latitude >= -5 && latitude <= 5 && longitude >= 34 && longitude <= 42) return 'KES'; // Kenya
      if (latitude >= -35 && latitude <= -22 && longitude >= 16 && longitude <= 33) return 'ZAR'; // South Africa
    }

    // Fallback to browser locale
    try {
      const locale = navigator.language || 'en-US';
      const region = locale.split('-')[1];
      
      const regionToCurrency: { [key: string]: string } = {
        'US': 'USD', 'GB': 'GBP', 'NG': 'NGN', 'GH': 'GHS',
        'KE': 'KES', 'ZA': 'ZAR', 'CA': 'CAD', 'AU': 'AUD', 'JP': 'JPY'
      };
      
      return regionToCurrency[region] || 'USD';
    } catch {
      return 'USD';
    }
  }
}

export const currencyConverter = new CurrencyConverter();