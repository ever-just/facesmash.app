import { Check, ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface LoginSuccessProps {
  matchedUser: string | null;
  onContinue: () => void;
  onSignInAgain: () => void;
}

const LoginSuccess = ({ matchedUser, onContinue, onSignInAgain }: LoginSuccessProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-md mx-auto"
    >
      {/* success icon */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <div className="absolute size-24 rounded-full bg-emerald-500/10 blur-2xl" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
          className="size-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
        >
          <Check className="size-10 text-black" strokeWidth={3} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-3xl font-bold tracking-tight mb-2">You're in</h2>
        <p className="text-white/40 text-lg mb-2">
          Welcome back, <span className="text-white/70">{matchedUser?.split('@')[0]}</span>
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mt-2">
          <div className="size-1.5 rounded-full bg-emerald-400" />
          Face verified
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="mt-10 space-y-3"
      >
        <Button
          onClick={onContinue}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-full group"
        >
          Continue to dashboard
          <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
        <Button
          variant="ghost"
          onClick={onSignInAgain}
          className="w-full h-10 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-full text-sm"
        >
          <LogOut className="mr-2 size-3.5" />
          Sign out
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default LoginSuccess;