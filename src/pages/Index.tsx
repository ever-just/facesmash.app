
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded border-2 border-white flex items-center justify-center">
            <div className="w-4 h-4 border border-black rounded-full relative">
              <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border-t border-black rounded-t"></div>
            </div>
          </div>
          <span className="text-2xl font-bold">Face Card</span>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:text-gray-300 hover:bg-gray-900">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-white text-black hover:bg-gray-200">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white rounded-lg border-4 border-white flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 border-2 border-black rounded-full relative">
                <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-2 border-t-2 border-black rounded-t"></div>
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-6">
              Sign in with your face
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Secure, passwordless authentication using advanced facial recognition technology. 
              No passwords to remember, no codes to enter.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            <Link to="/register">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4">
                Create Face Card
              </Button>
            </Link>
            <div className="text-gray-500 text-sm">
              Already have an account? <Link to="/login" className="text-white hover:underline">Sign in</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-white mx-auto mb-4" />
                <CardTitle className="text-white">Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-center">
                  Advanced facial recognition with 128-dimensional embedding for maximum security
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-white mx-auto mb-4" />
                <CardTitle className="text-white">Instant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-center">
                  Automatic face detection and instant authentication in under 2 seconds
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <Square className="h-12 w-12 text-white mx-auto mb-4" />
                <CardTitle className="text-white">Simple</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-center">
                  No passwords, no codes, no hassle. Just look at the camera and you're in
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>&copy; 2024 Face Card. Secure facial recognition authentication.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
