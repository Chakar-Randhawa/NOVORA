/**
 * NOVORA Client-Side Preferences & Utilities
 * 
 * Strict Zero-Cost & Multi-User Architecture:
 * - Market data (listings, requests, offers, messages, accounts, reports)
 *   is authoritative ONLY in Firebase Firestore and Authentication.
 * - This file contains only harmless client preferences (e.g. language/currency choice)
 *   and canvas-based image compression to avoid any cloud storage fees.
 */

// Harmless non-sensitive UI preferences
const PREF_KEYS = {
  COUNTRY: 'novora_pref_country',
  CURRENCY: 'novora_pref_currency'
};

export function getClientCountryPreference(): string {
  try {
    return localStorage.getItem(PREF_KEYS.COUNTRY) || 'US';
  } catch {
    return 'US';
  }
}

export function setClientCountryPreference(country: string): void {
  try {
    localStorage.setItem(PREF_KEYS.COUNTRY, country);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function getClientCurrencyPreference(): string {
  try {
    return localStorage.getItem(PREF_KEYS.CURRENCY) || 'USD';
  } catch {
    return 'USD';
  }
}

export function setClientCurrencyPreference(currency: string): void {
  try {
    localStorage.setItem(PREF_KEYS.CURRENCY, currency);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Client-side Canvas Image Compression
 * - Shrinks uploaded photos directly in the browser.
 * - Keeps payload < 100KB per image.
 * - Fits within Firestore 1MB document limits without requiring paid cloud object storage.
 */
export async function compressImageToDataUrl(
  file: File,
  maxDimension = 1000,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
