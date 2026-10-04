export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  region: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', flag: '🇺🇸', region: 'Americas' },
  { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'CA$', flag: '🇨🇦', region: 'Americas' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', flag: '🇬🇧', region: 'Europe' },
  { code: 'DE', name: 'Germany', currency: 'EUR', currencySymbol: '€', flag: '🇩🇪', region: 'Europe' },
  { code: 'FR', name: 'France', currency: 'EUR', currencySymbol: '€', flag: '🇫🇷', region: 'Europe' },
  { code: 'JP', name: 'Japan', currency: 'JPY', currencySymbol: '¥', flag: '🇯🇵', region: 'Asia-Pacific' },
  { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$', flag: '🇦🇺', region: 'Asia-Pacific' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', currencySymbol: 'CHF', flag: '🇨🇭', region: 'Europe' },
  { code: 'IT', name: 'Italy', currency: 'EUR', currencySymbol: '€', flag: '🇮🇹', region: 'Europe' },
  { code: 'ES', name: 'Spain', currency: 'EUR', currencySymbol: '€', flag: '🇪🇸', region: 'Europe' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', currencySymbol: '€', flag: '🇳🇱', region: 'Europe' },
  { code: 'SE', name: 'Sweden', currency: 'SEK', currencySymbol: 'kr', flag: '🇸🇪', region: 'Europe' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: 'S$', flag: '🇸🇬', region: 'Asia-Pacific' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', currencySymbol: 'AED', flag: '🇦🇪', region: 'Middle East' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', currencySymbol: 'R$', flag: '🇧🇷', region: 'Americas' },
  { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹', flag: '🇮🇳', region: 'Asia-Pacific' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', currencySymbol: 'Rs', flag: '🇵🇰', region: 'Asia-Pacific' },
  { code: 'MX', name: 'Mexico', currency: 'MXN', currencySymbol: 'MX$', flag: '🇲🇽', region: 'Americas' },
  { code: 'KR', name: 'South Korea', currency: 'KRW', currencySymbol: '₩', flag: '🇰🇷', region: 'Asia-Pacific' },
  { code: 'NO', name: 'Norway', currency: 'NOK', currencySymbol: 'kr', flag: '🇳🇴', region: 'Europe' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', currencySymbol: 'NZ$', flag: '🇳🇿', region: 'Asia-Pacific' }
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' }
];

export function formatPrice(amount: number, currency: string = 'USD'): string {
  const curr = CURRENCIES.find(c => c.code === currency);
  const symbol = curr ? curr.symbol : currency + ' ';
  
  // Format based on currency type (no decimal for JPY/KRW)
  if (currency === 'JPY' || currency === 'KRW') {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCountryByCode(code: string): CountryInfo | undefined {
  return COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase());
}
