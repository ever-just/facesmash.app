import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppNavProps {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  rightContent?: React.ReactNode;
}

const AppNav = ({ showBack = true, backTo = "/", backLabel = "Home", rightContent }: AppNavProps) => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#07080A]/70 border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/facesmash-logo.png" alt="FaceSmash" className="size-8 rounded-lg shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow" />
          <span className="text-[17px] font-semibold tracking-tight text-white">FaceSmash</span>
        </Link>
        <div className="flex items-center gap-3">
          {rightContent}
          {showBack && (
            <Link to={backTo}>
              <Button variant="ghost" className="text-white/40 hover:text-white text-sm h-9 px-4 hover:bg-white/5">
                <ArrowLeft className="mr-1.5 size-3.5" />
                {backLabel}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AppNav;
