
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, ArrowLeft, CheckCircle, User } from "lucide-react";
import { Link } from "react-router-dom";
import WebcamCapture from "@/components/WebcamCapture";
import { toast } from "sonner";

const Register = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep(2);
    }
  };

  const handleImagesCapture = (images: string[]) => {
    setCapturedImages(images);
    setStep(3);
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    // Simulate registration process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRegistering(false);
    setStep(4);
    toast.success("Registration completed successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <Link to="/" className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-cyan-400" />
          <span className="text-2xl font-bold">FaceAuth</span>
        </Link>
        <Link to="/">
          <Button variant="ghost" className="text-white hover:text-cyan-400">
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
                    ? 'bg-cyan-500 border-cyan-500 text-white' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {stepNumber < step ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-0.5 ${
                    stepNumber < step ? 'bg-cyan-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Email Input */}
          {step === 1 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white flex items-center justify-center">
                  <User className="mr-2 h-6 w-6 text-cyan-400" />
                  Create Your Account
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your email to get started with face recognition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-cyan-500 hover:bg-cyan-600"
                    disabled={!email}
                  >
                    Continue to Face Capture
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Face Capture */}
          {step === 2 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white flex items-center justify-center">
                  <Camera className="mr-2 h-6 w-6 text-cyan-400" />
                  Capture Your Face
                </CardTitle>
                <CardDescription className="text-gray-400">
                  We'll take multiple photos to create your unique face profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebcamCapture onImagesCapture={handleImagesCapture} />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review and Confirm */}
          {step === 3 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Review Your Profile</CardTitle>
                <CardDescription className="text-gray-400">
                  Confirm your details and complete registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {capturedImages.slice(0, 3).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-cyan-400/20">
                      <img 
                        src={image} 
                        alt={`Captured face ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="text-center space-y-4">
                  <p className="text-gray-300">
                    <strong>Email:</strong> {email}
                  </p>
                  <p className="text-gray-300">
                    <strong>Images Captured:</strong> {capturedImages.length}
                  </p>
                  
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                    >
                      Retake Photos
                    </Button>
                    <Button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                    >
                      {isRegistering ? "Creating Profile..." : "Complete Registration"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Registration Complete!</CardTitle>
                <CardDescription className="text-gray-400">
                  Your face profile has been created successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-300">
                  You can now sign in using facial recognition. No password required!
                </p>
                <Link to="/login">
                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                    <Camera className="mr-2 h-4 w-4" />
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
