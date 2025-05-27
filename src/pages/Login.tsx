
import { useFaceAPI } from "@/contexts/FaceAPIContext";
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
    resetLogin,
    goToDashboard
  } = useLoginLogic();

  // Show loading state only when Face API is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <LoginHeader />
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <LoadingSkeleton variant="webcam" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <LoginHeader />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <ErrorBoundary>
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
