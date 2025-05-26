
import { ArrowLeft, Square } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LoginHeader = () => {
  return (
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
  );
};

export default LoginHeader;
