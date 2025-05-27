
import { useFaceAPI } from "@/contexts/FaceAPIContext";
import LoginHeader from "@/components/LoginHeader";
import ErrorBoundary from "@/components/ErrorBoundary";
import FaceAPIError from "@/components/login/FaceAPIError";
import EnhancedFaceScanCard from "@/components/login/EnhancedFaceScanCard";
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

            {!showLoginOptions && (
              <>
                <EnhancedFaceScanCard 
                  isScanning={isScanning}
                  scanComplete={scanComplete}
                  loginResult={loginResult}
                  matchedUser={matchedUser}
                  onImagesCapture={handleImagesCapture}
                  onTryAgain={resetLogin}
                  onContinue={goToDashboard}
                />
                <LoginFooter />
              </>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Login;
