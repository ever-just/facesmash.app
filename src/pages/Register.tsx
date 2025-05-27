
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Square, ArrowLeft, CheckCircle, User, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ContinuousQualityCapture from "@/components/ContinuousQualityCapture";
import InlineNotification from "@/components/InlineNotification";
import { useFaceAPI } from "@/contexts/FaceAPIContext";
import { analyzeFaceQuality, base64ToBlob } from "@/utils/enhancedFaceRecognition";
import { createUserProfile, getUserProfileByName } from "@/services/userProfileService";
import { uploadFaceImage, createFaceScan } from "@/services/faceScanService";
import { manageFaceTemplates, checkDuplicateUsers } from "@/services/faceTemplateService";
import { createSignInLog } from "@/services/signInLogService";

const Register = () => {
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

      // Check if email is already registered
      console.log('Checking if email already exists:', email);
      const existingProfile = await getUserProfileByName(email);
      if (existingProfile) {
        setNotification({
          type: 'error',
          title: 'Email Already Registered',
          message: `An account with email ${email} already exists. Please use a different email or try logging in.`
        });
        return;
      }

      setNotification(null);
      setStep(2);
    }
  };

  const handleQualityImageCapture = async (imageData: string, quality: number) => {
    console.log('Image captured for registration:', quality);
    setCapturedImages([imageData]);
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

      // Enhanced duplicate detection
      console.log('Performing enhanced duplicate detection...');
      try {
        const duplicates = await checkDuplicateUsers(faceAnalysis.descriptor, 0.65);
        
        if (duplicates && duplicates.length > 0) {
          console.log('Duplicate face detected:', duplicates);
          const duplicateEmail = duplicates[0]?.existing_email || 'unknown user';
          
          setNotification({
            type: 'duplicate',
            title: 'Welcome Back!',
            message: 'This face is already registered. Would you like to continue to your dashboard?',
            userEmail: duplicateEmail
          });
          
          setIsRegistering(false);
          return;
        }
      } catch (duplicateError) {
        console.error('Duplicate check failed:', duplicateError);
        setNotification({
          type: 'error',
          title: 'Verification Error',
          message: 'Unable to verify face uniqueness. Please try again later.'
        });
        setIsRegistering(false);
        return;
      }

      console.log('No duplicate face found, proceeding with registration...');

      // Double-check email availability
      const existingProfile = await getUserProfileByName(email);
      if (existingProfile) {
        setNotification({
          type: 'error',
          title: 'Email Already Registered',
          message: `Email ${email} is already registered. Please use a different email.`
        });
        setStep(1);
        setIsRegistering(false);
        return;
      }

      console.log('Creating user profile with enhanced face data...');

      // Create user profile using email
      const profile = await createUserProfile(email, faceAnalysis.descriptor);
      if (!profile) {
        setNotification({
          type: 'error',
          title: 'Registration Failed',
          message: 'Failed to create Face Card. Please try again.'
        });
        setIsRegistering(false);
        return;
      }

      // Upload and store the registration image
      try {
        const imageBlob = base64ToBlob(imageToUse);
        const imageUrl = await uploadFaceImage(imageBlob, email, 'registration');
        if (imageUrl) {
          await createFaceScan(email, imageUrl, faceAnalysis.descriptor, 'registration', faceAnalysis.confidence, faceAnalysis.qualityScore);
          console.log('Registration scan stored successfully');

          // Store initial face template
          await manageFaceTemplates(
            email,
            faceAnalysis.descriptor,
            faceAnalysis.qualityScore,
            faceAnalysis.confidence,
            faceAnalysis.environmentalConditions || {}
          );
        }
      } catch (storageError) {
        console.error('Error storing registration image:', storageError);
      }

      console.log('Enhanced user profile created successfully:', profile.id);
      setStep(4);
      setNotification({
        type: 'success',
        title: 'Registration Successful!',
        message: 'Your Enhanced Face Card has been created successfully. You can now sign in using facial recognition.'
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
      await createSignInLog(notification.userEmail);
      navigate('/dashboard');
    }
  };

  const handleRetryCapture = () => {
    setNotification(null);
    setStep(2);
    setCapturedImages([]);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded border-2 border-white flex items-center justify-center">
            <div className="w-4 h-4 border border-black rounded-full relative">
              <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border-t border-black rounded-t"></div>
            </div>
          </div>
          <span className="text-2xl font-bold">Face Card</span>
        </Link>
        <Link to="/">
          <Button variant="ghost" className="text-white hover:text-gray-300 hover:bg-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    stepNumber <= step
                      ? 'bg-white border-white text-black'
                      : 'border-gray-600 text-gray-400'
                  }`}
                >
                  {stepNumber < step ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-0.5 ${stepNumber < step ? 'bg-white' : 'bg-gray-600'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Notifications */}
          {notification && (
            <InlineNotification
              type={notification.type}
              title={notification.title}
              message={notification.message}
              userEmail={notification.userEmail}
              onContinueToDashboard={notification.type === 'duplicate' ? handleContinueToDashboard : undefined}
              onRetry={notification.type === 'error' && step === 2 ? handleRetryCapture : undefined}
            />
          )}

          {/* Face API Error State */}
          {faceAPIError && (
            <Card className="bg-red-900/20 border-red-800 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <p>Face recognition failed to load. Please refresh the page to try again.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Name and Email Input */}
          {step === 1 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white flex items-center justify-center">
                  <User className="mr-2 h-6 w-6 text-white" />
                  Create Your Enhanced Face Card
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your name and email to get started with advanced face recognition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Your Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Your Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-gray-200"
                    disabled={!name || !email || !isLoaded}
                  >
                    {!isLoaded ? 'Loading Face Recognition...' : 'Continue to Face Capture'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Face Capture */}
          {step === 2 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white flex items-center justify-center">
                  <Square className="mr-2 h-6 w-6 text-white" />
                  Capture Your Face
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Look at the camera and we'll automatically capture your face
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isRegistering ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-16 w-16 text-white mx-auto mb-6 animate-spin" />
                    <h3 className="text-xl font-semibold text-white mb-2">Processing Registration...</h3>
                    <p className="text-gray-400">Verifying uniqueness and creating your Face Card</p>
                  </div>
                ) : (
                  <ContinuousQualityCapture 
                    onImageCapture={handleQualityImageCapture}
                    qualityThreshold={0.5}
                    maxAttempts={8}
                    autoStart={true}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Enhanced Face Card Created!</CardTitle>
                <CardDescription className="text-gray-400">
                  Your advanced face profile has been created with learning capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-300">
                  You can now sign in using facial recognition. Your face recognition will improve automatically with each login!
                </p>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-green-400 font-semibold text-sm">✨ Enhanced Features Active</p>
                  <p className="text-gray-400 text-sm mt-1">
                    • Unique face verification<br />
                    • Adaptive recognition threshold<br />
                    • Continuous learning from logins<br />
                    • Secure image storage
                  </p>
                </div>
                <Link to="/login">
                  <Button className="w-full bg-white text-black hover:bg-gray-200">
                    <Square className="mr-2 h-4 w-4" />
                    Sign In with Enhanced Face Recognition
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
