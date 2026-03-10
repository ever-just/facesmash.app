import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import { bootstrapConsent, isAnalyticsConsented } from './utils/consentManager';

// Read persisted consent BEFORE Sentry init so that the `enabled` flag
// respects the user's previous choice from the very first page load.
bootstrapConsent();

// Initialize Sentry error monitoring.
// DSN is safe to expose in client-side code — it only allows sending events,
// not reading them. See: https://docs.sentry.io/concepts/key-concepts/dsn-explainer/
//
// IMPORTANT: Sentry is gated on analytics consent.  If the user has not
// accepted analytics cookies, `enabled` is false and no data is sent.
// The consentManager toggles this at runtime when the user updates preferences.
Sentry.init({
  dsn: "https://e7918bb4314a8ab5673f3a9b4a120260@o4511019724439552.ingest.us.sentry.io/4511019737088000",
  environment: import.meta.env.MODE, // 'production' | 'development'
  release: `facesmash@${__APP_VERSION__}`,
  // Only send events when: (a) in production AND (b) user consented to analytics
  enabled: import.meta.env.PROD && isAnalyticsConsented(),
  // Capture 20% of transactions for performance monitoring
  tracesSampleRate: 0.2,
  // Capture 100% of sessions with errors for replay, 5% of all sessions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  sendDefaultPii: false, // Do not send PII (IP, user agent) by default
  // Automatically capture console.error as breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
      return null; // skip verbose console.log breadcrumbs
    }
    return breadcrumb;
  },
  // Double-gate: even if enabled gets toggled, drop events when consent is revoked
  beforeSend(event) {
    return isAnalyticsConsented() ? event : null;
  },
  beforeSendTransaction(event) {
    return isAnalyticsConsented() ? event : null;
  },
  integrations: [
    Sentry.browserTracingIntegration({
      // Track these routes for performance
      tracePropagationTargets: ['api.facesmash.app', /^\/api\//],
    }),
    Sentry.replayIntegration({
      // Mask all text inputs and user data in replays
      maskAllText: false,
      maskAllInputs: true,
      blockAllMedia: false,
    }),
    Sentry.httpClientIntegration({
      // Capture failed HTTP requests as Sentry events
      failedRequestStatusCodes: [[500, 599]],
      failedRequestTargets: ['api.facesmash.app'],
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
