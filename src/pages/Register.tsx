
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Square, ArrowLeft, CheckCircle, User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import WebcamCapture from "@/components/WebcamCapture";
import { toast } from "sonner";
import { initializeFaceAPI, processMultipleImages } from "@/utils/faceRecognition";
import { createUserProfile } from "@/services/userProfileService";

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [faceAPILoaded, setFaceAPILoaded] = useState(false);

  useEffect(() => {
    const loadFaceAPI = async () => {
      console.log('Initializing face recognition models...');
      const loaded = await initializeFaceAPI();
      setFaceAPILoaded(loaded);
      if (!loaded) {
        toast.error("Failed to load face recognition models. Please refresh the page.");
      }
    };
    loadFaceAPI();
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && faceAPILoaded) {
      setStep(2);
    } else if (!faceAPILoaded) {
      toast.error("Face recognition is still loading. Please wait.");
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
      console.log('Starting registration process...');
      const faceEmbedding = await processMultipleImages(capturedImages);
      
      if (!faceEmbedding) {
        toast.error("No face detected in the captured image. Please try again.");
        setStep(2);
        setIsRegistering(false);
        return;
      }

      console.log('Face embedding extracted, creating user profile...');
      const profile = await createUserProfile(name, faceEmbedding);
      
      if (profile) {
        console.log('User profile created successfully:', profile.id);
        setStep(4);
        toast.success("Face Card created successfully!");
      } else {
        toast.error("Failed to create Face Card. Please try again.");
      }
    } catch (error) {
      console.error('Registration error:', error);
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  stepNumber <= step 
                    ? 'bg-white border-white text-black' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {stepNumber < step ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-0.5 ${
                    stepNumber < step ? 'bg-white' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Loading State for Face API */}
          {!faceAPILoaded && (
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardContent className="text-center py-8">
                <Loader2 className="h-8 w-8 text-white mx-auto mb-4 animate-spin" />
                <p className="text-white">Loading face recognition models...</p>
                <p className="text-gray-400 text-sm mt-2">This may take a moment on first load</p>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Name Input */}
          {step === 1 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white flex items-center justify-center">
                  <User className="mr-2 h-6 w-6 text-white" />
                  Create Your Face Card
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your name to get started with face recognition
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
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-black hover:bg-gray-200"
                    disabled={!name || !faceAPILoaded}
                  >
                    {faceAPILoaded ? "Continue to Face Capture" : "Loading..."}
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
                  We'll automatically take your photo when we detect your face
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebcamCapture onImagesCapture={handleImagesCapture} />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review and Confirm */}
          {step === 3 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Review Your Face Card</CardTitle>
                <CardDescription className="text-gray-400">
                  Confirm your details and complete registration
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
                    <strong>Face Photo:</strong> Ready for processing
                  </p>
                  
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 border-white text-white hover:bg-white hover:text-black"
                      disabled={isRegistering}
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
                          Processing Face...
                        </>
                      ) : (
                        "Complete Registration"
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
                <CardTitle className="text-2xl text-white">Face Card Created!</CardTitle>
                <CardDescription className="text-gray-400">
                  Your face profile has been created successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-300">
                  You can now sign in using facial recognition. No password required!
                </p>
                <Link to="/login">
                  <Button className="w-full bg-white text-black hover:bg-gray-200">
                    <Square className="mr-2 h-4 w-4" />
                    Sign In with Face
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
