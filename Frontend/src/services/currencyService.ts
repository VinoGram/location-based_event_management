interface Currency {
  code: string;
  symbol: string;
  name: string;
  priceRanges: {
    low: number;
    medium: number;
    high: number;
  };
}

const CURRENCY_MAP: Record<string, Currency> = {
  US: { code: 'USD', symbol: '$', name: 'US Dollar', priceRanges: { low: 25, medium: 50, high: 100 } },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound', priceRanges: { low: 20, medium: 40, high: 80 } },
  GH: { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi', priceRanges: { low: 150, medium: 300, high: 600 } },
  NG: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', priceRanges: { low: 10000, medium: 20000, high: 40000 } },
  KE: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', priceRanges: { low: 2500, medium: 5000, high: 10000 } },
  ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand', priceRanges: { low: 400, medium: 800, high: 1600 } },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', priceRanges: { low: 30, medium: 60, high: 120 } },
  FR: { code: 'EUR', symbol: '€', name: 'Euro', priceRanges: { low: 20, medium: 40, high: 80 } },
  DE: { code: 'EUR', symbol: '€', name: 'Euro', priceRanges: { low: 20, medium: 40, high: 80 } },
  IT: { code: 'EUR', symbol: '€', name: 'Euro', priceRanges: { low: 20, medium: 40, high: 80 } },
  ES: { code: 'EUR', symbol: '€', name: 'Euro', priceRanges: { low: 20, medium: 40, high: 80 } },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee', priceRanges: { low: 2000, medium: 4000, high: 8000 } },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', priceRanges: { low: 3000, medium: 6000, high: 12000 } },
  CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', priceRanges: { low: 150, medium: 300, high: 600 } },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', priceRanges: { low: 35, medium: 70, high: 140 } }
};

class CurrencyService {
  private static instance: CurrencyService;
  private currentCurrency: Currency = CURRENCY_MAP.US;
  private initialized: boolean = false;

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  async detectCurrencyFromLocation(latitude?: number, longitude?: number): Promise<Currency> {
    try {
      let countryCode;
      
      if (latitude && longitude) {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await response.json();
        countryCode = data.countryCode;
      } else {
        // Fallback to IP-based detection
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        countryCode = data.country_code;
      }
      
      this.currentCurrency = CURRENCY_MAP[countryCode] || CURRENCY_MAP.US;
      localStorage.setItem('userCurrency', JSON.stringify(this.currentCurrency));
      this.initialized = true;
      return this.currentCurrency;
    } catch (error) {
      console.error('Failed to detect currency from location:', error);
      return this.getCurrentCurrency();
    }
  }

  async initializeCurrency(): Promise<Currency> {
    if (this.initialized) {
      return this.currentCurrency;
    }

    // Try to get user's location for currency detection
    if (navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const currency = await this.detectCurrencyFromLocation(
              position.coords.latitude,
              position.coords.longitude
            );
            resolve(currency);
          },
          async () => {
            // Fallback to IP-based detection
            const currency = await this.detectCurrencyFromLocation();
            resolve(currency);
          }
        );
      });
    } else {
      return this.detectCurrencyFromLocation();
    }
  }

  getCurrentCurrency(): Currency {
    if (!this.initialized) {
      const stored = localStorage.getItem('userCurrency');
      if (stored) {
        try {
          this.currentCurrency = JSON.parse(stored);
          this.initialized = true;
        } catch {
          this.currentCurrency = CURRENCY_MAP.US;
        }
      } else {
        // Auto-initialize if not done yet
        this.initializeCurrency();
      }
    }
    return this.currentCurrency;
  }

  formatPrice(amount: number): string {
    const currency = this.getCurrentCurrency();
    return `${currency.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getCurrencySymbol(): string {
    return this.getCurrentCurrency().symbol;
  }

  getPriceRanges(): { low: number; medium: number; high: number } {
    return this.getCurrentCurrency().priceRanges;
  }

  formatPriceRange(min: number, max?: number): string {
    const currency = this.getCurrentCurrency();
    if (max) {
      return `${currency.symbol}${min} - ${currency.symbol}${max}`;
    }
    return `${currency.symbol}${min}+`;
  }

  getAllCurrencies(): Currency[] {
    const uniqueCurrencies = new Map<string, Currency>();
    Object.values(CURRENCY_MAP).forEach(currency => {
      uniqueCurrencies.set(currency.code, currency);
    });
    return Array.from(uniqueCurrencies.values());
  }
}

export const currencyService = CurrencyService.getInstance();
export type { Currency };