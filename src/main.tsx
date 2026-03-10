import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

// Initialize Sentry error monitoring as early as possible.
// DSN is safe to expose in client-side code — it only allows sending events,
// not reading them. See: https://docs.sentry.io/concepts/key-concepts/dsn-explainer/
Sentry.init({
  dsn: "https://e7918bb4314a8ab5673f3a9b4a120260@o4511019724439552.ingest.us.sentry.io/4511019737088000",
  environment: import.meta.env.MODE, // 'production' | 'development'
  release: `facesmash@${__APP_VERSION__}`,
  // Only send events in production to avoid noisy dev errors
  enabled: import.meta.env.PROD,
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
