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
  release: `facesmash@${import.meta.env.VITE_APP_VERSION ?? '2.0.0'}`,
  // Only send events in production to avoid noisy dev errors
  enabled: import.meta.env.PROD,
  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,
  // Capture 10% of sessions for replay (only on errors)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  sendDefaultPii: false, // Do not send PII (IP, user agent) by default
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
