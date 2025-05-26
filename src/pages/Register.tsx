
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Square, ArrowLeft, CheckCircle, User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import WebcamCapture from "@/components/WebcamCapture";
import { toast } from "sonner";
import { initializeFaceAPI } from "@/utils/faceRecognition";
import { analyzeFaceQuality, base64ToBlob } from "@/utils/enhancedFaceRecognition";
import { createUserProfile } from "@/services/userProfileService";
import { uploadFaceImage, createFaceScan } from "@/services/faceScanService";

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      // Initialize face API when moving to step 2
      console.log('Initializing face recognition models...');
      const loaded = await initializeFaceAPI();
      if (!loaded) {
        toast.error("Failed to load face recognition models. Please try again.");
        return;
      }
      setStep(2);
    }
  };

  const handleImagesCapture = (images: string[]) => {
    console.log('Images captured for registration:', images.length);
    setCapturedImages(images);
    setStep(3);
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      console.log('Starting enhanced registration process...');

      // Analyze face quality
      const faceAnalysis = await analyzeFaceQuality(capturedImages[0]);
      if (!faceAnalysis) {
        toast.error("No face detected in the captured image. Please try again.");
        setStep(2);
        setIsRegistering(false);
        return;
      }

      // Check quality threshold for registration
      if (faceAnalysis.qualityScore < 0.5) {
        toast.error("Face quality is too low for registration. Please ensure good lighting and face the camera directly.");
        setStep(2);
        setIsRegistering(false);
        return;
      }

      console.log(`Face quality score: ${faceAnalysis.qualityScore.toFixed(3)}`);
      console.log('Creating user profile with enhanced face data...');

      // Create user profile using email
      const profile = await createUserProfile(email, faceAnalysis.descriptor);
      if (!profile) {
        toast.error("Failed to create Face Card. Please try again.");
        setIsRegistering(false);
        return;
      }

      // Upload and store the registration image
      try {
        const imageBlob = base64ToBlob(capturedImages[0]);
        const imageUrl = await uploadFaceImage(imageBlob, email, 'registration');
        if (imageUrl) {
          await createFaceScan(email, imageUrl, faceAnalysis.descriptor, 'registration', faceAnalysis.confidence, faceAnalysis.qualityScore);
          console.log('Registration scan stored successfully');
        }
      } catch (storageError) {
        console.error('Error storing registration image:', storageError);
        // Don't fail registration if storage fails
        toast.warning("Face Card created, but image storage had issues. Recognition will still work.");
      }

      console.log('Enhanced user profile created successfully:', profile.id);
      setStep(4);
      toast.success("Enhanced Face Card created successfully with high-quality face data!");
    } catch (error) {
      console.error('Enhanced registration error:', error);
      toast.error("An error occurred during registration. Please try again.");
    }
    setIsRegistering(false);
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

          {/* Step 1: Name and Email Input */}
          {step === 1 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white flex items-center justify-center">
                  <User className="mr-2 h-6 w-6 text-white" />
                  Create Your Enhanced Face Card
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your name and email to get started with advanced face recognition that learns over time
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
                    disabled={!name || !email}
                  >
                    Continue to Enhanced Face Capture
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
                  Capture Your High-Quality Face
                </CardTitle>
                <CardDescription className="text-gray-400">
                  We'll automatically take your photo when we detect a high-quality face. Good lighting is important!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebcamCapture onImagesCapture={handleImagesCapture} autoStart={true} />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review and Confirm */}
          {step === 3 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Review Your Enhanced Face Card</CardTitle>
                <CardDescription className="text-gray-400">
                  Confirm your details and complete registration with advanced face recognition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-48 h-48 rounded-lg overflow-hidden border border-gray-600">
                    <img
                      src={capturedImages[0]}
                      alt="Captured face"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <p className="text-gray-300">
                    <strong>Name:</strong> {name}
                  </p>
                  <p className="text-gray-300">
                    <strong>Email:</strong> {email}
                  </p>
                  <p className="text-gray-300">
                    <strong>Face Data:</strong> High-quality face profile ready for enhanced recognition
                  </p>
                  <p className="text-gray-400 text-sm">
                    Your face data will improve automatically with each login for better recognition over time.
                  </p>
                  
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      disabled={isRegistering}
                      className="flex-1 border-white hover:bg-white text-gray-900"
                    >
                      Retake Photo
                    </Button>
                    <Button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className="flex-1 bg-white text-black hover:bg-gray-200"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing Enhanced Face...
                        </>
                      ) : (
                        "Complete Enhanced Registration"
                      )}
                    </Button>
                  </div>
                </div>
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
                    • Adaptive recognition threshold<br />
                    • Face quality scoring<br />
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
