import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07080A] text-white">
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />
      <div className="text-center relative z-10">
        <p className="text-white/10 text-[120px] md:text-[180px] font-bold leading-none select-none">404</p>
        <h1 className="text-2xl font-bold tracking-tight -mt-6 mb-3">Page not found</h1>
        <p className="text-white/30 text-sm mb-8 max-w-xs mx-auto">
          The page <span className="text-white/50 font-mono text-xs">{location.pathname}</span> doesn't exist.
        </p>
        <Link to="/">
          <Button className="h-10 px-6 bg-white hover:bg-white/90 text-black text-sm font-medium rounded-full">
            <ArrowLeft className="mr-2 size-3.5" />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
