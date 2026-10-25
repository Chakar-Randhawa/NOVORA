import { useEffect, useState } from 'react';

// Benchmark FX conversion rates relative to USD (1.00 USD base)
export const FX_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155.0,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.90,
  SGD: 1.34,
  SEK: 10.60,
  AED: 3.67,
  BRL: 5.60,
  INR: 83.50,
  PKR: 278.0,
  MXN: 18.50,
  KRW: 1380.0,
  NOK: 10.90,
  NZD: 1.68
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'CHF ',
  SGD: 'S$',
  SEK: 'kr ',
  AED: 'AED ',
  BRL: 'R$',
  INR: '₹',
  PKR: 'Rs ',
  MXN: 'MX$',
  KRW: '₩',
  NOK: 'kr ',
  NZD: 'NZ$'
};

export const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW']);

const STORAGE_KEY = 'novora_preferred_currency';
const CURRENCY_CHANGE_EVENT = 'novora-currency-change';

/**
 * Get current stored user currency preference or default to USD
 */
export function getStoredCurrencyPreference(): string {
  if (typeof window === 'undefined') return 'USD';
  try {
    return localStorage.getItem(STORAGE_KEY) || 'USD';
  } catch {
    return 'USD';
  }
}

/**
 * Store updated currency preference and notify all components
 */
export function setStoredCurrencyPreference(currency: string): void {
  if (typeof window === 'undefined') return;
  try {
    const code = currency.toUpperCase();
    localStorage.setItem(STORAGE_KEY, code);
    window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: code }));
  } catch {
    // ignore local storage restrictions
  }
}

/**
 * Convert numerical amount between currencies using benchmark FX rates
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD'
): number {
  if (!amount || isNaN(amount)) return 0;
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  if (from === to) return amount;

  const rateFrom = FX_RATES_TO_USD[from] ?? 1.0;
  const rateTo = FX_RATES_TO_USD[to] ?? 1.0;

  // Convert to USD intermediate, then to destination currency
  const inUsd = amount / rateFrom;
  return inUsd * rateTo;
}

/**
 * Standard single-currency formatter with localized symbols and proper decimal precision
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  const code = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] ?? `${code} `;

  if (ZERO_DECIMAL_CURRENCIES.has(code)) {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }

  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export interface DynamicPriceOptions {
  showOriginal?: boolean;
  originalLabel?: string;
}

export interface DynamicPriceParts {
  convertedAmount: number;
  formattedPrice: string;
  originalPrice: string;
  isConverted: boolean;
  targetCurrency: string;
  sourceCurrency: string;
}

/**
 * Parse dynamic price and return structured parts for UI presentation
 */
export function getDynamicPriceParts(
  amount: number,
  fromCurrency: string = 'USD',
  userCurrency?: string | null
): DynamicPriceParts {
  const source = (fromCurrency || 'USD').toUpperCase();
  const target = (userCurrency || getStoredCurrencyPreference() || 'USD').toUpperCase();
  const isConverted = source !== target;

  const convertedAmount = isConverted ? convertCurrency(amount, source, target) : amount;
  const formattedPrice = formatCurrency(convertedAmount, target);
  const originalPrice = formatCurrency(amount, source);

  return {
    convertedAmount,
    formattedPrice,
    originalPrice,
    isConverted,
    targetCurrency: target,
    sourceCurrency: source
  };
}

/**
 * Format currency dynamically based on current user's preference
 * If target currency differs from source currency, automatically converts and formats.
 */
export function formatDynamicPrice(
  amount: number,
  fromCurrency: string = 'USD',
  userCurrency?: string | null,
  options?: DynamicPriceOptions
): string {
  const parts = getDynamicPriceParts(amount, fromCurrency, userCurrency);

  if (parts.isConverted && options?.showOriginal) {
    const label = options.originalLabel || 'Orig.';
    return `${parts.formattedPrice} (${label} ${parts.originalPrice})`;
  }

  return parts.formattedPrice;
}

/**
 * React Hook that reactively updates whenever the user changes their currency preference
 */
export function useUserCurrencyPreference(initialFallback: string = 'USD'): string {
  const [currency, setCurrency] = useState<string>(() => {
    return getStoredCurrencyPreference() || initialFallback;
  });

  useEffect(() => {
    const handleCurrencyChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setCurrency(customEvent.detail);
      } else {
        setCurrency(getStoredCurrencyPreference());
      }
    };

    window.addEventListener(CURRENCY_CHANGE_EVENT, handleCurrencyChange);
    window.addEventListener('storage', handleCurrencyChange);

    return () => {
      window.removeEventListener(CURRENCY_CHANGE_EVENT, handleCurrencyChange);
      window.removeEventListener('storage', handleCurrencyChange);
    };
  }, []);

  return currency;
}
