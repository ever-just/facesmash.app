import { Link } from "react-router-dom";
import { Scan, ArrowLeft } from "lucide-react";
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
          <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
            <Scan className="size-4 text-white" strokeWidth={2.5} />
          </div>
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
