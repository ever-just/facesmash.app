import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppNav from "@/components/AppNav";
import ContinuousQualityCapture from "@/components/ContinuousQualityCapture";
import InlineNotification from "@/components/InlineNotification";
import { useFaceAPI } from "@/contexts/FaceAPIContext";
import { analyzeFaceQuality, base64ToBlob } from "@/utils/enhancedFaceRecognition";
import { api } from "@/integrations/api/client";

const stepLabels = ["Details", "Face scan", "Done"];

const Register = () => {
  const seoHead = (
    <SEOHead
      title="Create Your FaceSmash — Free Signup"
      description="Set up FaceSmash in 60 seconds. Register your face and start signing in to websites without passwords. Free, secure, and works on any device."
      path="/register"
    />
  );

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'duplicate';
    title: string;
    message: string;
    userEmail?: string;
  } | null>(null);
  const { isLoaded, error: faceAPIError } = useFaceAPI();
  const navigate = useNavigate();

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      if (!isLoaded) {
        setNotification({
          type: 'error',
          title: 'Face Recognition Loading',
          message: 'Face recognition is still loading. Please wait a moment.'
        });
        return;
      }
      if (faceAPIError) {
        setNotification({
          type: 'error',
          title: 'Face Recognition Error',
          message: 'Face recognition failed to load. Please refresh the page.'
        });
        return;
      }

      setNotification(null);
      setStep(2);
    }
  };

  const handleQualityImageCapture = async (imageData: string, quality: number) => {
    console.log(`Image captured for registration: quality=${(quality * 100).toFixed(1)}%`);
    setCapturedImages(prev => [...prev, imageData]);
    setNotification(null);
    
    // Auto-proceed with registration after a brief delay
    setTimeout(() => {
      handleRegister(imageData);
    }, 500);
  };

  const handleRegister = async (imageData?: string) => {
    const imageToUse = imageData || capturedImages[0];
    
    setIsRegistering(true);
    setNotification(null);
    
    try {
      console.log('Starting enhanced registration process with duplicate detection...');

      // Analyze face quality
      let faceAnalysis;
      try {
        faceAnalysis = await analyzeFaceQuality(imageToUse);
      } catch (analysisError) {
        console.error('Face analysis failed:', analysisError);
        setNotification({
          type: 'error',
          title: 'Face Analysis Failed',
          message: 'Unable to analyze your face. Please try capturing again.'
        });
        setStep(2);
        setIsRegistering(false);
        return;
      }

      if (!faceAnalysis) {
        setNotification({
          type: 'error',
          title: 'No Face Detected',
          message: 'No face was detected in the captured image. Please try again.'
        });
        setStep(2);
        setIsRegistering(false);
        return;
      }

      // Check quality threshold for registration
      if (faceAnalysis.qualityScore < 0.3) {
        setNotification({
          type: 'error',
          title: 'Face Quality Too Low',
          message: 'Face quality is too low for registration. Please ensure good lighting and face the camera directly.'
        });
        setStep(2);
        setIsRegistering(false);
        return;
      }

      console.log(`Face quality score: ${faceAnalysis.qualityScore.toFixed(3)}`);

      // Server-side registration: handles duplicate face check, email check,
      // profile creation, template storage, and scan record in one call.
      console.log('Registering via server API...');

      const embeddingArray = Array.from(faceAnalysis.descriptor);

      // Prepare image data URL if available
      let imageDataUrl: string | undefined;
      try {
        const imageBlob = base64ToBlob(imageToUse);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        imageDataUrl = await new Promise<string>((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          };
          img.onerror = reject;
          img.src = URL.createObjectURL(imageBlob);
        });
      } catch {
        // Image prep is non-critical
      }

      const res = await api.register({
        email,
        embedding: embeddingArray,
        qualityScore: faceAnalysis.qualityScore,
        imageData: imageDataUrl,
      });

      if (!res.ok) {
        const errData = res.data as { error?: string; matchedEmail?: string };

        // Server returns 409 with matchedEmail for duplicate face
        if (res.status === 409 && errData.matchedEmail) {
          setNotification({
            type: 'duplicate',
            title: 'Welcome Back!',
            message: 'This face is already registered. Would you like to continue to your dashboard?',
            userEmail: errData.matchedEmail,
          });
          setIsRegistering(false);
          setStep(3);
          return;
        }

        // 409 for duplicate email
        if (res.status === 409) {
          setNotification({
            type: 'error',
            title: 'Email Already Registered',
            message: `Email ${email} is already registered. Please use a different email.`,
          });
          setStep(1);
          setIsRegistering(false);
          return;
        }

        setNotification({
          type: 'error',
          title: 'Registration Failed',
          message: errData.error || 'Failed to create FaceSmash profile. Please try again.',
        });
        setIsRegistering(false);
        return;
      }

      console.log('Registration successful:', res.data);
      setStep(4);
      setNotification({
        type: 'success',
        title: 'Registration Successful!',
        message: 'Your FaceSmash profile has been created successfully. You can now sign in using facial recognition.'
      });
    } catch (error) {
      console.error('Enhanced registration error:', error);
      setNotification({
        type: 'error',
        title: 'Registration Error',
        message: 'An error occurred during registration. Please try again.'
      });
    }
    setIsRegistering(false);
  };

  const handleContinueToDashboard = async () => {
    if (notification?.userEmail) {
      // Set the user as logged in and redirect to dashboard
      localStorage.setItem('currentUserName', notification.userEmail);
      navigate('/dashboard');
    }
  };

  const handleRetryCapture = () => {
    setNotification(null);
    setStep(2);
    setCapturedImages([]);
  };

  /* map internal steps (1-4) to visual steps (0-2) */
  const visualStep = step <= 1 ? 0 : step <= 2 ? 1 : 2;

  return (
    <div className="min-h-screen bg-[#07080A] text-white flex flex-col">
      {seoHead}
      {/* film-grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />

      <AppNav showBack backTo="/" backLabel="Home" />

      {/* ambient light */}
      <div className="fixed top-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[15%] w-[400px] h-[400px] rounded-full bg-teal-400/[0.03] blur-[120px] pointer-events-none" />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-lg relative z-10">

          {/* Step indicator — thin line, not circles */}
          <div className="flex items-center gap-3 mb-12 max-w-xs mx-auto">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full h-[2px] rounded-full overflow-hidden bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      i < visualStep ? "bg-emerald-400 w-full" :
                      i === visualStep ? "bg-emerald-400/60 w-1/2" :
                      "w-0"
                    }`}
                    style={{ width: i < visualStep ? "100%" : i === visualStep ? "50%" : "0%" }}
                  />
                </div>
                <span className={`text-[10px] uppercase tracking-wider ${
                  i <= visualStep ? "text-white/50" : "text-white/15"
                }`}>{label}</span>
              </div>
            ))}
          </div>

          {/* Notifications */}
          {notification && (
            <div className="mb-6">
              <InlineNotification
                type={notification.type}
                title={notification.title}
                message={notification.message}
                userEmail={notification.userEmail}
                onContinueToDashboard={notification.type === 'duplicate' ? handleContinueToDashboard : undefined}
                onRetry={notification.type === 'error' && step === 2 ? handleRetryCapture : undefined}
              />
            </div>
          )}

          {/* Face API Error State */}
          {faceAPIError && (
            <div className="flex items-center gap-3 text-red-400 text-sm mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <AlertCircle className="size-4 shrink-0" />
              <p>Face recognition failed to load. Please refresh the page.</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Name and Email Input */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center size-16 rounded-2xl mb-6">
                    <img src="/facesmash-logo.png" alt="FaceSmash" className="size-16 rounded-2xl shadow-lg shadow-emerald-500/20" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                    Create your FaceSmash
                  </h1>
                  <p className="text-white/35 text-lg">
                    Your face becomes your password — everywhere
                  </p>
                </div>

                <form onSubmit={handleNameSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/50 text-sm">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-emerald-500/40 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/50 text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-emerald-500/40 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-full group mt-2"
                    disabled={!name || !email || !isLoaded}
                  >
                    {!isLoaded ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Loading face recognition...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-center text-white/20 text-sm mt-6">
                  Already have a profile?{" "}
                  <Link to="/login" className="text-emerald-400/60 hover:text-emerald-400 transition-colors">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Face Capture */}
            {step === 2 && notification?.type !== 'duplicate' && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                    {isRegistering ? "Processing..." : "Scan your face"}
                  </h2>
                  <p className="text-white/35">
                    {isRegistering
                      ? "Verifying uniqueness and creating your profile"
                      : "Look at the camera — we'll capture automatically"
                    }
                  </p>
                </div>

                {isRegistering ? (
                  <div className="text-center py-16">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className="absolute size-20 rounded-full bg-emerald-500/10 blur-xl" />
                      <div className="size-20 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
                        <Loader2 className="size-8 text-emerald-400 animate-spin" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <ContinuousQualityCapture 
                      onImageCapture={handleQualityImageCapture}
                      qualityThreshold={0.35}
                      maxAttempts={15}
                      autoStart={true}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Duplicate Detection Result */}
            {step === 3 && notification?.type === 'duplicate' && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8"
              >
                {/* notification already rendered above */}
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="absolute size-24 rounded-full bg-emerald-500/10 blur-2xl" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                    className="size-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
                  >
                    <Check className="size-10 text-black" strokeWidth={3} />
                  </motion.div>
                </div>

                <h2 className="text-3xl font-bold tracking-tight mb-3">You're all set</h2>
                <p className="text-white/40 text-lg mb-2">
                  Your FaceSmash profile is ready
                </p>
                <p className="text-white/20 text-sm max-w-sm mx-auto mb-10">
                  You can now sign in to any FaceSmash-enabled site with just a glance. Your face recognition improves with every login.
                </p>

                <Link to="/login">
                  <Button className="h-12 px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-full group">
                    Sign in now
                    <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Register;
