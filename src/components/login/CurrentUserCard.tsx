import { Button } from "@/components/ui/button";
import { ArrowRight, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface CurrentUserCardProps {
  currentUser: string;
  onSignOut: () => void;
  onGoToDashboard: () => void;
}

const CurrentUserCard = ({ currentUser, onSignOut, onGoToDashboard }: CurrentUserCardProps) => {
  const initials = currentUser
    .split('@')[0]
    .split('.')
    .map(p => p.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto"
    >
      {/* avatar */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <div className="absolute size-24 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="size-20 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
          <span className="text-2xl font-bold text-white/60">{initials}</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
      <p className="text-white/40 text-lg mb-1">{currentUser.split('@')[0]}</p>
      <p className="text-white/20 text-sm">{currentUser}</p>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mt-4">
        <div className="size-1.5 rounded-full bg-emerald-400" />
        Session active
      </div>

      <div className="mt-10 space-y-3">
        <Button
          onClick={onGoToDashboard}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-full group"
        >
          Continue to dashboard
          <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
        <Button
          variant="ghost"
          onClick={onSignOut}
          className="w-full h-10 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-full text-sm"
        >
          <LogOut className="mr-2 size-3.5" />
          Sign out
        </Button>
      </div>
    </motion.div>
  );
};

export default CurrentUserCard;