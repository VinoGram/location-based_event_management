const CURRENCY_MAP: Record<string, { code: string; symbol: string }> = {
  US: { code: 'usd', symbol: '$' },
  GB: { code: 'gbp', symbol: '£' },
  GH: { code: 'ghs', symbol: 'GH₵' },
  NG: { code: 'ngn', symbol: '₦' },
  KE: { code: 'kes', symbol: 'KSh' },
  ZA: { code: 'zar', symbol: 'R' },
  CA: { code: 'cad', symbol: 'C$' },
  EU: { code: 'eur', symbol: '€' }
};

export async function detectCurrency(): Promise<{ code: string; symbol: string }> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return CURRENCY_MAP[data.country_code] || CURRENCY_MAP.US;
  } catch {
    const locale = navigator.language.split('-')[1] || 'US';
    return CURRENCY_MAP[locale] || CURRENCY_MAP.US;
  }
}

export async function getUserCurrency(): Promise<{ code: string; symbol: string }> {
  return detectCurrency();
}

export function formatCurrency(amount: number, currency: { code: string; symbol: string }): string {
  return `${currency.symbol}${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = Object.values(CURRENCY_MAP).find(c => c.code === currencyCode.toLowerCase());
  return currency?.symbol || '$';
}