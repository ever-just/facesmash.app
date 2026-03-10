/**
 * Consent Manager — bridges react-cookie-manager consent state with services like Sentry.
 *
 * react-cookie-manager stores consent in a browser cookie named "cookie-consent".
 * This module reads that cookie and exposes helpers so other parts of the app
 * (especially the Sentry initializer in main.tsx) can gate behaviour on consent.
 */

import * as Sentry from '@sentry/react';

// ── Types ──

interface ConsentPreferences {
  analytics: boolean;
  social: boolean;
  advertising: boolean;
}

// ── Cookie helper ──

function getCookieValue(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// ── Module-level consent state (used by Sentry beforeSend) ──

let _analyticsConsented = false;

export const isAnalyticsConsented = () => _analyticsConsented;

/**
 * Update the module-level consent flag AND toggle the Sentry client accordingly.
 * Called from the React layer whenever consent changes (onAccept / onDecline / onManage).
 */
export function applyConsentToSentry(analytics: boolean): void {
  _analyticsConsented = analytics;

  const client = Sentry.getClient();
  if (!client) return;

  // Toggle the enabled flag on the live client
  // When disabled, Sentry stops sending events but keeps integrations warm
  // so re-enabling is instant.
  (client.getOptions() as { enabled: boolean }).enabled = analytics && import.meta.env.PROD;
}

/**
 * Read the persisted consent from the cookie (set by react-cookie-manager).
 * Returns the analytics consent boolean, defaulting to false if nothing stored.
 */
export function readPersistedConsent(): ConsentPreferences {
  try {
    const raw = getCookieValue('cookie-consent');
    if (!raw) return { analytics: false, social: false, advertising: false };

    const decoded = decodeURIComponent(raw);

    const parsed = JSON.parse(decoded);

    // react-cookie-manager stores either a simple boolean (accepted all)
    // or an object with { Analytics, Social, Advertising } keys.
    if (typeof parsed === 'boolean') {
      return { analytics: parsed, social: parsed, advertising: parsed };
    }

    // Handle the detailed consent object format
    if (parsed && typeof parsed === 'object') {
      // Could be { Analytics: { consented: true }, ... } or { analytics: true, ... }
      const getVal = (key: string): boolean => {
        const v = parsed[key] ?? parsed[key.toLowerCase()];
        if (typeof v === 'boolean') return v;
        if (v && typeof v === 'object' && 'consented' in v) return !!v.consented;
        return false;
      };

      return {
        analytics: getVal('Analytics'),
        social: getVal('Social'),
        advertising: getVal('Advertising'),
      };
    }
  } catch {
    // Corrupted cookie — treat as no consent
  }

  return { analytics: false, social: false, advertising: false };
}

/**
 * Bootstrap: read persisted consent and apply to Sentry immediately.
 * Called once at app startup (before React renders) so that Sentry
 * respects the user's previous choice from the first network request.
 */
export function bootstrapConsent(): void {
  const { analytics } = readPersistedConsent();
  _analyticsConsented = analytics;
}

/**
 * Clear all non-essential cached data from localStorage.
 * Keeps essential keys (auth, consent) intact.
 */
export function clearNonEssentialData(): void {
  const essentialPrefixes = [
    'currentUserName',          // auth
    'facesmash_session_cache',  // auth session cache
    'facesmash_user_settings',  // user preferences
  ];

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !essentialPrefixes.some(p => key.startsWith(p))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(k => localStorage.removeItem(k));
}
