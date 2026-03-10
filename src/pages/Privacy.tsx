import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Database, Trash2, Lock, Globe, Mail, Cookie, BarChart3 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Privacy = () => {
  const seoHead = (
    <SEOHead
      title="Privacy Policy"
      description="FaceSmash Privacy Policy — Learn how we protect your biometric data. No photos stored, AES-256 encryption, browser-native processing. Your face data never leaves your device unencrypted."
      path="/privacy"
    />
  );

  const lastUpdated = "March 11, 2026";

  const sections = [
    {
      icon: Eye,
      title: "1. Information We Collect",
      content: [
        {
          subtitle: "Biometric Data (Facial Geometry)",
          text: "When you register for FaceSmash, we capture facial images via your device's camera and extract 128-dimensional facial geometry descriptors (numerical representations of facial landmarks). These descriptors are used solely for authentication purposes — to verify your identity when you sign in. Raw photographs used during registration may be stored temporarily for quality assurance and are deleted within 30 days.",
        },
        {
          subtitle: "Account Information",
          text: "We collect the display name and email address you provide during registration. Your email is used for account identification and communication about your account. We do not require a phone number or password.",
        },
        {
          subtitle: "Authentication Cookies",
          text: "When you sign in, we issue a secure, httpOnly session cookie containing a signed JSON Web Token (JWT). This cookie is used solely to maintain your authenticated session and cannot be read by client-side JavaScript. The cookie expires after 7 days or when you sign out.",
        },
        {
          subtitle: "Device & Usage Data",
          text: "We collect basic technical information such as browser type, device type, and usage patterns (e.g., login timestamps, authentication success/failure rates) to maintain and improve the Service.",
        },
      ],
    },
    {
      icon: BarChart3,
      title: "1b. Error Tracking & Performance Monitoring",
      content: [
        {
          subtitle: "Sentry (Error & Performance Monitoring)",
          text: "With your consent, we use Sentry (sentry.io), a third-party error tracking and performance monitoring service, to identify and fix software bugs and performance issues. Sentry collects: JavaScript error stack traces, HTTP request metadata (URL, status code, method — no request bodies), browser and device type, page load and navigation timing data. Sentry does NOT receive any biometric data, facial images, personal names, or email addresses. We have configured Sentry with sendDefaultPii: false to prevent transmission of personally identifiable information.",
        },
        {
          subtitle: "Session Replay",
          text: "With your consent, Sentry may record anonymized session replays to help us understand and reproduce bugs. All text inputs are masked in replays — no passwords, emails, or personal data are visible. Session replay is sampled at 5% of normal sessions and 100% of sessions where an error occurs. You can disable session replay by declining analytics cookies.",
        },
        {
          subtitle: "Consent Requirement",
          text: "Sentry error tracking and session replay are ONLY enabled when you accept analytics cookies via our cookie consent banner. If you decline or choose 'Reject All,' no data is sent to Sentry. You can change your preference at any time using the floating cookie button or the Cookie Preferences link in the footer.",
        },
      ],
    },
    {
      icon: Database,
      title: "2. How We Process Biometric Data",
      content: [
        {
          subtitle: "Client-Side Feature Extraction",
          text: "Facial detection and descriptor extraction happen entirely within your web browser using on-device machine learning models (TensorFlow.js). Raw camera frames are never transmitted to our servers. Only the computed 128-dimensional facial descriptor vectors are sent for storage and matching.",
        },
        {
          subtitle: "Server-Side Matching",
          text: "When you sign in, your facial descriptor is sent to our server where it is compared against stored templates using cosine similarity via pgvector (a PostgreSQL extension for vector operations). This server-side matching ensures that biometric comparison is performed in a controlled, secure environment rather than in the browser.",
        },
        {
          subtitle: "Storage",
          text: "Facial descriptors are stored in a dedicated PostgreSQL database with the pgvector extension, hosted on our own infrastructure. Descriptors are associated with your account and used exclusively for identity verification. All data is encrypted at rest and in transit.",
        },
        {
          subtitle: "No Third-Party Sharing",
          text: "We do not sell, license, or share your biometric data with any third party. Biometric descriptors are never used for advertising, profiling, surveillance, or any purpose other than authenticating you to FaceSmash. We do not use your biometric data to train machine learning models.",
        },
      ],
    },
    {
      icon: Shield,
      title: "3. Legal Basis & Consent",
      content: [
        {
          subtitle: "Informed Consent",
          text: "Before collecting any biometric data, we require your explicit, informed, written consent via a mandatory checkbox during registration. By checking the consent box and completing your facial scan, you acknowledge that: (a) FaceSmash will collect and store your facial geometry descriptors; (b) the specific purpose is passwordless authentication; and (c) the retention and destruction schedule described in Section 5 applies. You may withdraw consent at any time by deleting your account.",
        },
        {
          subtitle: "BIPA Compliance (Illinois)",
          text: "In accordance with the Illinois Biometric Information Privacy Act (740 ILCS 14), we: (1) provide this written disclosure and obtain your written consent prior to any biometric data collection; (2) publish this retention and destruction schedule; (3) do not sell, lease, trade, or profit from your biometric data; (4) store and protect biometric data using a standard of care no less stringent than other confidential information; and (5) destroy biometric data per the schedule in Section 5.",
        },
        {
          subtitle: "CCPA/CPRA Compliance (California)",
          text: "Under the California Consumer Privacy Act and California Privacy Rights Act, your biometric data is classified as \"sensitive personal information.\" You have the right to: know what data we collect and why; request deletion of your data; opt out of the sale of personal information (we do not sell your data); and limit the use of sensitive personal information to what is necessary for the Service.",
        },
        {
          subtitle: "GDPR & International Users",
          text: "If you are located in the European Economic Area, the UK, or other jurisdictions with comprehensive data protection laws, our lawful basis for processing your biometric data is your explicit consent (Article 9(2)(a) GDPR). You have the right to access, rectify, port, and erase your data at any time. Our Data Protection contact is: privacy@facesmash.app.",
        },
      ],
    },
    {
      icon: Lock,
      title: "4. Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All data is encrypted in transit using TLS 1.3 (enforced via our Caddy reverse proxy with automatic HTTPS). Facial descriptors are stored in a dedicated, access-controlled PostgreSQL database. Database connections are encrypted and restricted to localhost and authorized services only.",
        },
        {
          subtitle: "Access Controls",
          text: "Access to biometric data is restricted to automated authentication systems via our Hono API. No human operator has routine access to stored facial descriptors. API endpoints that handle biometric data require authenticated sessions with valid JWT tokens.",
        },
        {
          subtitle: "Infrastructure",
          text: "Our backend infrastructure is self-hosted on DigitalOcean with dedicated compute resources. We use a hardened server configuration with firewall rules, SSH key-only access, and automated security updates. We perform regular security audits and dependency vulnerability assessments.",
        },
        {
          subtitle: "Incident Response",
          text: "In the event of a data breach involving biometric information, we will: (a) notify affected users within 72 hours; (b) notify relevant regulatory authorities as required by applicable law; (c) provide a description of the breach and steps taken to mitigate harm; and (d) offer guidance on protective measures.",
        },
      ],
    },
    {
      icon: Trash2,
      title: "5. Data Retention & Deletion",
      content: [
        {
          subtitle: "Retention Period",
          text: "Your facial descriptors and account data are retained for as long as your account is active. If your account is inactive for 24 consecutive months, we will automatically delete all associated biometric data and notify you at the email address on file prior to deletion.",
        },
        {
          subtitle: "Account Deletion",
          text: "You may delete your account and all associated biometric data at any time from your dashboard settings. Upon deletion, all facial descriptors, face scan images, sign-in logs, and account information are permanently and irreversibly removed from our systems within 30 days.",
        },
        {
          subtitle: "Destruction Schedule",
          text: "In compliance with BIPA (740 ILCS 14/15(a)) and similar regulations, biometric data is permanently destroyed when: (a) the initial purpose for collection (authentication) has been satisfied through account deletion; or (b) within 3 years of your last interaction with FaceSmash — whichever comes first. Destruction is performed by deleting records from our PostgreSQL database, which overwrites the physical storage.",
        },
      ],
    },
    {
      icon: Globe,
      title: "6. Your Rights",
      content: [
        {
          subtitle: "Access & Portability",
          text: "You have the right to request a copy of your stored data, including facial descriptors, in a machine-readable format (JSON). Submit requests to privacy@facesmash.app and we will respond within 30 days.",
        },
        {
          subtitle: "Correction",
          text: "You may update your display name, email, or re-register your facial scan at any time to correct inaccurate data.",
        },
        {
          subtitle: "Deletion",
          text: "You may request complete deletion of your account and all associated data at any time. We will process deletion requests within 30 days and confirm completion via email.",
        },
        {
          subtitle: "Objection & Restriction",
          text: "You have the right to object to processing or request restriction of processing. Note that restricting biometric processing will prevent you from using face-based authentication. To exercise this right, contact privacy@facesmash.app.",
        },
        {
          subtitle: "Non-Discrimination",
          text: "We will not discriminate against you for exercising any of your privacy rights. You will not receive different pricing, service quality, or access levels for exercising your rights under CCPA, GDPR, BIPA, or any other applicable law.",
        },
      ],
    },
    {
      icon: Cookie,
      title: "7. Cookies & Local Storage",
      content: [
        {
          subtitle: "Authentication Cookie",
          text: "We use a single httpOnly session cookie containing a signed JWT token to maintain your authenticated session. This cookie is essential, cannot be read by client-side JavaScript, and expires after 7 days or when you sign out. It is sent automatically by your browser with each API request.",
        },
        {
          subtitle: "Local Storage (Browser)",
          text: "We use your browser's localStorage to store the following non-cookie data: (1) Cookie consent preferences — your choice of which cookie categories to allow; (2) Session cache — a short-lived (5-minute) cache of your session verification to reduce API calls; (3) User settings — your dashboard preferences such as auto-lock timer, display options, and notification settings; (4) Profile cache — cached profile data for faster dashboard loading; (5) Announcement banner dismissal state; (6) Rate limiter state for security throttling. None of this data contains biometric information.",
        },
        {
          subtitle: "Cookie Categories",
          text: "Essential cookies (authentication, session, preferences) are always active and cannot be disabled — they are required for the Service to function. Analytics cookies (Sentry error tracking and performance monitoring) are optional and require your explicit consent. We do not use social media cookies, advertising cookies, or any third-party tracking cookies beyond Sentry.",
        },
        {
          subtitle: "Managing Preferences",
          text: "You can manage your cookie preferences at any time by clicking the floating cookie button on any page, using the 'Cookie Preferences' link in the footer, or through your dashboard settings. Changes take effect immediately. Rejecting analytics cookies will disable Sentry error tracking and session replay.",
        },
      ],
    },
    {
      icon: Mail,
      title: "8. Contact & Changes",
      content: [
        {
          subtitle: "Contact Us",
          text: "For privacy-related inquiries, data access requests, deletion requests, or concerns, contact us at: privacy@facesmash.app. We aim to respond to all requests within 30 days.",
        },
        {
          subtitle: "Policy Changes",
          text: "We may update this Privacy Policy from time to time. Material changes — especially those affecting biometric data processing — will be communicated via email to registered users and a prominent notice on the Service at least 30 days before taking effect. Continued use after changes constitutes acceptance of the updated policy.",
        },
        {
          subtitle: "Governing Law",
          text: "This Privacy Policy is governed by the laws of the State of Delaware, United States, without regard to conflict of law principles, except where overridden by mandatory local privacy laws (e.g., GDPR, BIPA, CCPA/CPRA).",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#07080A] text-white selection:bg-emerald-500/30 selection:text-white">
      {seoHead}
      {/* film-grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />

      {/* ambient light */}
      <div className="fixed top-[-15%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-teal-400/[0.02] blur-[120px] pointer-events-none" />

      {/* nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#07080A]/70 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/facesmash-logo.png" alt="FaceSmash" className="size-8 rounded-lg shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow" />
            <span className="text-[17px] font-semibold tracking-tight">FaceSmash</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-white/40 hover:text-white text-sm h-9 px-4 hover:bg-white/5">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* content */}
      <div className="max-w-3xl mx-auto px-6 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Shield className="size-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Privacy Policy</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-white/40 text-sm">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* intro */}
          <div className="mb-12 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-white/60 text-[15px] leading-relaxed">
              FaceSmash ("we," "us," or "our") is a facial-recognition authentication service operated by EVERJUST COMPANY. This Privacy Policy explains how we collect, use, store, and protect your information — including biometric data — when you use our website and services at{" "}
              <a href="https://facesmash.app" className="text-emerald-400/70 hover:text-emerald-400 transition-colors">facesmash.app</a>{" "}
              (the "Service").
            </p>
            <p className="text-white/60 text-[15px] leading-relaxed mt-4">
              <strong className="text-white/80">Your privacy matters.</strong> Because FaceSmash uses facial recognition, we take extra care to be transparent about what data we collect, how we process it, and what rights you have. We encourage you to read this policy in full.
            </p>
          </div>

          {/* sections */}
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="size-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <section.icon className="size-4 text-emerald-400/70" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              </div>
              <div className="space-y-4 pl-12">
                {section.content.map((item, j) => (
                  <div key={j}>
                    <h3 className="text-sm font-medium text-white/70 mb-1.5">{item.subtitle}</h3>
                    <p className="text-white/40 text-[14px] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* bottom links */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs">© 2026 EVERJUST COMPANY. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-white/30">
              <Link to="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-emerald-400/50">Privacy Policy</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
