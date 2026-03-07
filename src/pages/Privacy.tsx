import { Link } from "react-router-dom";
import { Scan, ArrowLeft, Shield, Eye, Database, Trash2, Lock, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Privacy = () => {
  const lastUpdated = "March 7, 2026";

  const sections = [
    {
      icon: Eye,
      title: "1. Information We Collect",
      content: [
        {
          subtitle: "Biometric Data (Facial Geometry)",
          text: "When you register for FaceSmash, we capture facial images via your device's camera and extract facial geometry descriptors (numerical representations of facial landmarks). These descriptors are used solely for authentication purposes — to verify your identity when you sign in.",
        },
        {
          subtitle: "Account Information",
          text: "We collect the display name you provide during registration. We do not require an email address, phone number, or password to create an account.",
        },
        {
          subtitle: "Device & Usage Data",
          text: "We may collect basic technical information such as browser type, device type, and general usage patterns (e.g., login timestamps) to maintain and improve the Service. We do not use tracking cookies or third-party analytics.",
        },
      ],
    },
    {
      icon: Database,
      title: "2. How We Process Biometric Data",
      content: [
        {
          subtitle: "Client-Side Processing",
          text: "Facial detection and descriptor extraction happen entirely within your web browser using on-device machine learning models. Raw camera frames are never transmitted to our servers. Only the computed facial descriptors (numerical vectors) are stored for future authentication matching.",
        },
        {
          subtitle: "Storage",
          text: "Facial descriptors are stored securely in our backend database. They are associated with your account and used exclusively for identity verification during login. Descriptors are encrypted at rest and in transit.",
        },
        {
          subtitle: "No Third-Party Sharing",
          text: "We do not sell, license, or share your biometric data with any third party. Biometric descriptors are never used for advertising, surveillance, or any purpose other than authenticating you to FaceSmash.",
        },
      ],
    },
    {
      icon: Shield,
      title: "3. Legal Basis & Consent",
      content: [
        {
          subtitle: "Informed Consent",
          text: "By registering for FaceSmash and capturing your facial scan, you provide explicit, informed consent for us to collect and process your facial geometry descriptors for authentication. You may withdraw consent at any time by deleting your account.",
        },
        {
          subtitle: "BIPA Compliance",
          text: "In accordance with the Illinois Biometric Information Privacy Act (BIPA) and similar state laws, we provide this written disclosure prior to collection, obtain your consent, and maintain a publicly available retention and destruction schedule (see Section 5).",
        },
        {
          subtitle: "GDPR & International Users",
          text: "If you are located in the European Economic Area, the UK, or other jurisdictions with comprehensive data protection laws, our lawful basis for processing your biometric data is your explicit consent (Article 9(2)(a) GDPR). You have the right to access, rectify, port, and erase your data at any time.",
        },
      ],
    },
    {
      icon: Lock,
      title: "4. Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Facial descriptors are stored in an isolated, access-controlled database.",
        },
        {
          subtitle: "Access Controls",
          text: "Access to biometric data is restricted to automated authentication systems. No human operator has routine access to stored facial descriptors.",
        },
        {
          subtitle: "Infrastructure",
          text: "Our backend infrastructure is hosted on secure cloud providers with SOC 2 compliance. We perform regular security audits and vulnerability assessments.",
        },
      ],
    },
    {
      icon: Trash2,
      title: "5. Data Retention & Deletion",
      content: [
        {
          subtitle: "Retention Period",
          text: "Your facial descriptors and account data are retained for as long as your account is active. If your account is inactive for 24 consecutive months, we will automatically delete all associated biometric data.",
        },
        {
          subtitle: "Account Deletion",
          text: "You may delete your account and all associated biometric data at any time from your dashboard settings. Upon deletion, all facial descriptors are permanently and irreversibly removed from our systems within 30 days.",
        },
        {
          subtitle: "Destruction Schedule",
          text: "In compliance with BIPA and similar regulations, biometric data is destroyed when: (a) the purpose for collection has been satisfied, or (b) within 3 years of your last interaction with FaceSmash — whichever comes first.",
        },
      ],
    },
    {
      icon: Globe,
      title: "6. Your Rights",
      content: [
        {
          subtitle: "Access & Portability",
          text: "You have the right to request a copy of your stored data, including facial descriptors, in a machine-readable format.",
        },
        {
          subtitle: "Correction",
          text: "You may update your display name or re-register your facial scan at any time to correct inaccurate data.",
        },
        {
          subtitle: "Deletion",
          text: "You may request complete deletion of your account and all associated data. We will process deletion requests within 30 days.",
        },
        {
          subtitle: "Objection & Restriction",
          text: "You have the right to object to processing or request restriction of processing. Note that restricting biometric processing will prevent you from using face-based authentication.",
        },
      ],
    },
    {
      icon: Mail,
      title: "7. Contact & Changes",
      content: [
        {
          subtitle: "Contact Us",
          text: "For privacy-related inquiries, data requests, or concerns, contact us at: privacy@facesmash.app",
        },
        {
          subtitle: "Policy Changes",
          text: "We may update this Privacy Policy from time to time. Material changes will be communicated via a prominent notice on the Service. Continued use after changes constitutes acceptance of the updated policy.",
        },
        {
          subtitle: "Governing Law",
          text: "This Privacy Policy is governed by the laws of the State of Delaware, United States, without regard to conflict of law principles, except where overridden by mandatory local privacy laws (e.g., GDPR, BIPA).",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#07080A] text-white selection:bg-emerald-500/30 selection:text-white">
      {/* film-grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />

      {/* ambient light */}
      <div className="fixed top-[-15%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-teal-400/[0.02] blur-[120px] pointer-events-none" />

      {/* nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#07080A]/70 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <Scan className="size-4 text-white" strokeWidth={2.5} />
            </div>
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
