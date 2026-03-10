import { useFaceAPI } from "@/contexts/FaceAPIContext";
import SEOHead from "@/components/SEOHead";
import LoginHeader from "@/components/LoginHeader";
import LoginSuccess from "@/components/LoginSuccess";
import LoginFailed from "@/components/LoginFailed";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorBoundary from "@/components/ErrorBoundary";
import FaceAPIError from "@/components/login/FaceAPIError";
import FaceScanCard from "@/components/login/FaceScanCard";
import CurrentUserCard from "@/components/login/CurrentUserCard";
import LoginFooter from "@/components/login/LoginFooter";
import { useLoginLogic } from "@/hooks/useLoginLogic";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Login = () => {
  const { isLoaded, isLoading, error: faceAPIError } = useFaceAPI();
  const { currentUser, showLoginOptions, handleSignOut } = useCurrentUser();
  const {
    isScanning,
    scanComplete,
    loginResult,
    matchedUser,
    handleImagesCapture,
    handleReadyDescriptorCapture,
    resetLogin,
    goToDashboard
  } = useLoginLogic();

  const seoHead = (
    <SEOHead
      title="Sign In"
      description="Sign in to FaceSmash using facial recognition. No passwords needed — just look at your camera and you're in. Works on any device."
      path="/login"
    />
  );

  // Show loading state only when Face API is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080A] text-white">
        <LoginHeader />
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-xl">
            <LoadingSkeleton variant="webcam" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080A] text-white flex flex-col">
      {seoHead}
      {/* film-grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />

      <LoginHeader />

      {/* ambient light */}
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[15%] w-[400px] h-[400px] rounded-full bg-teal-400/[0.03] blur-[120px] pointer-events-none" />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-xl relative z-10">
          <ErrorBoundary>
            {/* Title area — only shown when scanning */}
            {!showLoginOptions && !scanComplete && isLoaded && !faceAPIError && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center size-16 rounded-2xl mb-6">
                  <img src="/facesmash-logo.png" alt="FaceSmash" className="size-16 rounded-2xl shadow-lg shadow-emerald-500/20" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                  Sign in with your face
                </h1>
                <p className="text-white/35 text-lg">
                  Look at the camera — we'll recognize you instantly
                </p>
              </div>
            )}

            {showLoginOptions && currentUser && (
              <CurrentUserCard 
                currentUser={currentUser}
                onSignOut={handleSignOut}
                onGoToDashboard={goToDashboard}
              />
            )}

            {/* Face API Error State */}
            {!showLoginOptions && (
              <FaceAPIError error={faceAPIError} />
            )}

            {!showLoginOptions && !scanComplete && isLoaded && !faceAPIError && (
              <FaceScanCard 
                isScanning={isScanning}
                onImagesCapture={handleImagesCapture}
                onReadyDescriptorCapture={handleReadyDescriptorCapture}
              />
            )}

            {!showLoginOptions && scanComplete && loginResult === 'success' && (
              <LoginSuccess 
                matchedUser={matchedUser}
                onContinue={goToDashboard}
                onSignInAgain={resetLogin}
              />
            )}

            {!showLoginOptions && scanComplete && loginResult === 'failed' && (
              <LoginFailed onTryAgain={resetLogin} />
            )}

            {!showLoginOptions && (
              <LoginFooter />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Login;
