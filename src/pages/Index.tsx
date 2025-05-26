
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Shield, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-cyan-400" />
          <span className="text-2xl font-bold">FaceAuth</span>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:text-cyan-400">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            The Future of Authentication
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Experience seamless, secure login with advanced facial recognition technology. 
            No passwords, no hassle – just look and you're in.
          </p>
          
          <div className="flex justify-center space-x-4 mb-16">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 text-lg">
                <Camera className="mr-2" />
                Start Face Recognition
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 px-8 py-4 text-lg">
                Sign In with Face
              </Button>
            </Link>
          </div>

          {/* Demo Video Placeholder */}
          <div className="relative mx-auto max-w-2xl">
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-400/20 flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                <p className="text-gray-400">Live Demo Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose FaceAuth?</h2>
          <p className="text-gray-400 text-lg">Advanced biometric security meets user convenience</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <Shield className="h-12 w-12 text-cyan-400 mb-4" />
              <CardTitle className="text-white">Military-Grade Security</CardTitle>
              <CardDescription className="text-gray-400">
                Advanced facial recognition algorithms provide unbreakable security
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <ul className="space-y-2">
                <li>• 128-dimensional face embeddings</li>
                <li>• Encrypted data storage</li>
                <li>• Anti-spoofing protection</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <Zap className="h-12 w-12 text-cyan-400 mb-4" />
              <CardTitle className="text-white">Lightning Fast</CardTitle>
              <CardDescription className="text-gray-400">
                Authenticate in under 2 seconds with real-time processing
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <ul className="space-y-2">
                <li>• Sub-second face detection</li>
                <li>• Real-time verification</li>
                <li>• Optimized algorithms</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <Users className="h-12 w-12 text-cyan-400 mb-4" />
              <CardTitle className="text-white">User Friendly</CardTitle>
              <CardDescription className="text-gray-400">
                Intuitive interface that works for everyone
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <ul className="space-y-2">
                <li>• No passwords to remember</li>
                <li>• Works in any lighting</li>
                <li>• Accessible design</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl p-12 border border-cyan-400/20">
          <h2 className="text-4xl font-bold mb-4">Ready to Experience the Future?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of users who have made the switch to face-based authentication
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-12 py-4 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2024 FaceAuth. Secure authentication for the modern world.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
