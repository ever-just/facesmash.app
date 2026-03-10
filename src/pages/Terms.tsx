import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Scale, AlertTriangle, UserCheck, Ban, RefreshCw, Gavel, Mail, Shield, Cookie } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Terms = () => {
  const seoHead = (
    <SEOHead
      title="Terms of Service"
      description="FaceSmash Terms of Service — Read the terms governing your use of FaceSmash passwordless facial recognition authentication service."
      path="/terms"
    />
  );

  const lastUpdated = "March 11, 2026";

  const sections = [
    {
      icon: UserCheck,
      title: "1. Acceptance of Terms",
      content: [
        {
          subtitle: "Agreement",
          text: "By accessing or using FaceSmash (the \"Service\"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, do not use the Service. During registration, you must explicitly accept these Terms and our Privacy Policy by checking the consent checkbox before your account can be created.",
        },
        {
          subtitle: "Eligibility",
          text: "You must be at least 16 years of age to use FaceSmash. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you must have the consent of a parent or legal guardian. You must not use the Service if biometric data collection is prohibited in your jurisdiction without additional safeguards that we do not currently provide.",
        },
        {
          subtitle: "Modifications",
          text: "We reserve the right to modify these Terms at any time. Material changes will be communicated via email to registered users and a prominent notice on the Service at least 30 days before taking effect. Your continued use after changes constitutes acceptance.",
        },
      ],
    },
    {
      icon: FileText,
      title: "2. Description of Service",
      content: [
        {
          subtitle: "What FaceSmash Does",
          text: "FaceSmash is a facial-recognition authentication platform that allows you to register your face as a biometric credential and use it to securely sign in to your account and third-party applications that integrate FaceSmash via our SDK or API. The Service is provided by EVERJUST COMPANY.",
        },
        {
          subtitle: "How It Works",
          text: "During registration, the Service captures facial images via your device camera and extracts 128-dimensional facial geometry descriptors using client-side machine learning (TensorFlow.js). These descriptors are transmitted to our servers and stored in a PostgreSQL database with pgvector. During login, your facial descriptor is compared server-side against stored templates using cosine similarity to verify your identity.",
        },
        {
          subtitle: "SDK & API",
          text: "FaceSmash provides a JavaScript SDK (@facesmash/sdk) and REST API that allow third-party developers to integrate facial authentication into their applications. If you use these developer tools, you are responsible for ensuring your integration complies with applicable biometric privacy laws and for obtaining appropriate consent from your users.",
        },
        {
          subtitle: "Availability",
          text: "We strive to maintain the Service's availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will provide reasonable notice of scheduled maintenance when possible.",
        },
      ],
    },
    {
      icon: Shield,
      title: "3. Biometric Data Consent",
      content: [
        {
          subtitle: "What You Consent To",
          text: "By registering for FaceSmash and checking the consent checkbox, you provide explicit, informed, written consent for EVERJUST COMPANY to: (a) collect your facial geometry descriptors via your device's camera; (b) transmit these descriptors to our servers for storage; (c) store these descriptors in our database for the purpose of authenticating your identity; and (d) compare your facial descriptors against stored templates each time you sign in.",
        },
        {
          subtitle: "Purpose Limitation",
          text: "Your biometric data will be used solely for the purpose of authenticating your identity to FaceSmash and FaceSmash-integrated applications. We will not use your biometric data for any other purpose, including but not limited to: advertising, profiling, surveillance, training machine learning models, or sale to third parties.",
        },
        {
          subtitle: "Withdrawal of Consent",
          text: "You may withdraw your consent at any time by deleting your account from your dashboard. Upon withdrawal, all biometric data will be permanently destroyed in accordance with the retention schedule described in our Privacy Policy. Withdrawal of consent will prevent you from using the Service.",
        },
      ],
    },
    {
      icon: Scale,
      title: "4. User Obligations",
      content: [
        {
          subtitle: "Accurate Registration",
          text: "You agree to provide accurate information during registration and to register only your own face. Registering another person's facial biometrics without their explicit consent is strictly prohibited and may violate applicable law, including the Illinois Biometric Information Privacy Act (BIPA).",
        },
        {
          subtitle: "Account Security",
          text: "You are responsible for maintaining the security of your account. You agree to notify us immediately at security@facesmash.app if you suspect unauthorized access. Because authentication is biometric, you should not allow others to use your device's camera to impersonate you.",
        },
        {
          subtitle: "Lawful Use",
          text: "You agree to use the Service only for lawful purposes and in compliance with all applicable local, state, national, and international laws and regulations, including biometric privacy laws in your jurisdiction.",
        },
      ],
    },
    {
      icon: Ban,
      title: "5. Prohibited Conduct",
      content: [
        {
          subtitle: "You May Not",
          text: "Attempt to reverse-engineer, decompile, or extract the facial recognition models or algorithms used by the Service. Use the Service to collect biometric data of other individuals without their consent. Attempt to bypass, disable, or interfere with security features of the Service. Use automated scripts, bots, or scrapers to access or interact with the Service. Impersonate another person or misrepresent your identity. Use the API or SDK in violation of biometric privacy laws. Attempt to reconstruct facial images from stored descriptors.",
        },
        {
          subtitle: "Enforcement",
          text: "Violation of these prohibitions may result in immediate termination of your account and, where applicable, referral to law enforcement authorities. We reserve the right to report violations of biometric privacy laws to the appropriate regulatory authorities.",
        },
      ],
    },
    {
      icon: AlertTriangle,
      title: "6. Disclaimers & Limitation of Liability",
      content: [
        {
          subtitle: "\"As Is\" Service",
          text: "The Service is provided \"as is\" and \"as available\" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.",
        },
        {
          subtitle: "Biometric Accuracy",
          text: "While we strive for high accuracy, facial recognition technology is not infallible. We do not guarantee that the Service will correctly identify or authenticate every user in every circumstance. Environmental factors such as lighting, camera quality, and facial changes (e.g., aging, facial hair, accessories) may affect performance. False matches and false rejections may occur.",
        },
        {
          subtitle: "Limitation of Liability",
          text: "To the maximum extent permitted by law, EVERJUST COMPANY and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages. Our total aggregate liability shall not exceed $100 USD. This limitation does not apply to liability arising from our negligent handling of biometric data where prohibited by applicable law.",
        },
      ],
    },
    {
      icon: RefreshCw,
      title: "7. Termination",
      content: [
        {
          subtitle: "By You",
          text: "You may terminate your account at any time by deleting it from your dashboard settings. Upon termination, all your data — including biometric descriptors, face scan images, and sign-in logs — will be permanently deleted in accordance with our Privacy Policy within 30 days.",
        },
        {
          subtitle: "By Us",
          text: "We may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. Reasons for termination may include violation of these Terms, suspected fraudulent activity, or extended account inactivity (24+ months). We will notify you via email and delete your biometric data per our Privacy Policy.",
        },
        {
          subtitle: "Effect of Termination",
          text: "Upon termination, your right to use the Service ceases immediately. All biometric data will be destroyed per our retention schedule. Sections of these Terms that by their nature should survive termination will survive, including disclaimers, limitations of liability, biometric data destruction obligations, and governing law.",
        },
      ],
    },
    {
      icon: Cookie,
      title: "8. Cookies & Data Processing",
      content: [
        {
          subtitle: "Cookie Consent",
          text: "When you first visit FaceSmash, a cookie consent banner will appear allowing you to accept or reject non-essential cookies. Essential cookies (authentication, session management) are always active and required for the Service to function. Analytics cookies (Sentry error tracking and performance monitoring) require your explicit consent and can be enabled or disabled at any time.",
        },
        {
          subtitle: "Managing Preferences",
          text: "You can change your cookie preferences at any time by clicking the floating cookie settings button, using the 'Cookie Preferences' link in the footer, or through your dashboard settings. Your preferences are stored locally in your browser and take effect immediately.",
        },
        {
          subtitle: "Third-Party Data Processing",
          text: "When you consent to analytics cookies, we use Sentry (sentry.io) for error tracking and performance monitoring. Sentry processes technical data (error traces, HTTP metadata, browser info) on our behalf under their data processing agreement. No biometric data, facial images, or personal identifiers are sent to Sentry. You can review Sentry's privacy practices at sentry.io/privacy.",
        },
      ],
    },
    {
      icon: Gavel,
      title: "9. Governing Law & Disputes",
      content: [
        {
          subtitle: "Governing Law",
          text: "These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Where mandatory local laws apply (e.g., BIPA, GDPR, CCPA), those laws will take precedence over conflicting provisions of these Terms.",
        },
        {
          subtitle: "Dispute Resolution",
          text: "Any disputes arising from these Terms or the Service shall first be attempted to be resolved through good-faith negotiation for a period of 30 days. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, conducted in English.",
        },
        {
          subtitle: "Class Action Waiver",
          text: "You agree that any dispute resolution proceedings will be conducted on an individual basis and not as part of a class, consolidated, or representative action. This waiver does not apply where prohibited by law, including claims under the Illinois BIPA which expressly permit class actions.",
        },
      ],
    },
    {
      icon: Mail,
      title: "10. Contact Information",
      content: [
        {
          subtitle: "Questions",
          text: "If you have questions about these Terms, please contact us at: legal@facesmash.app",
        },
        {
          subtitle: "Privacy & Biometric Data Inquiries",
          text: "For privacy-related inquiries, biometric data requests, or deletion requests, contact: privacy@facesmash.app",
        },
        {
          subtitle: "EVERJUST COMPANY",
          text: "FaceSmash is a product of EVERJUST COMPANY. For formal legal notices, please direct correspondence to our registered address or email legal@facesmash.app.",
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
              <FileText className="size-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Terms of Service</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-white/40 text-sm">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* intro */}
          <div className="mb-12 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-white/60 text-[15px] leading-relaxed">
              Welcome to FaceSmash. These Terms of Service ("Terms") govern your access to and use of the FaceSmash facial-recognition authentication service ("Service") operated by EVERJUST COMPANY ("we," "us," or "our") at{" "}
              <a href="https://facesmash.app" className="text-emerald-400/70 hover:text-emerald-400 transition-colors">facesmash.app</a>.
            </p>
            <p className="text-white/60 text-[15px] leading-relaxed mt-4">
              <strong className="text-white/80">Please read these Terms carefully.</strong> By creating an account or using FaceSmash, you acknowledge that you have read, understood, and agree to be bound by these Terms and our{" "}
              <Link to="/privacy" className="text-emerald-400/70 hover:text-emerald-400 transition-colors">Privacy Policy</Link>.
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
              <Link to="/terms" className="text-emerald-400/50">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
