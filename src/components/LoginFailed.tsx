import { X, RotateCcw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface LoginFailedProps {
  onTryAgain: () => void;
}

const LoginFailed = ({ onTryAgain }: LoginFailedProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-md mx-auto"
    >
      <div className="relative inline-flex items-center justify-center mb-8">
        <div className="absolute size-24 rounded-full bg-red-500/10 blur-2xl" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
          className="size-20 rounded-full border-2 border-red-500/40 bg-red-500/10 flex items-center justify-center"
        >
          <X className="size-10 text-red-400" strokeWidth={2} />
        </motion.div>
      </div>

      <h2 className="text-3xl font-bold tracking-tight mb-2">Not recognized</h2>
      <p className="text-white/35 text-lg mb-1">We couldn't match your face</p>
      <p className="text-white/20 text-sm">Try better lighting, or create a new profile if you haven't registered yet.</p>

      <div className="mt-10 space-y-3">
        <Button
          onClick={onTryAgain}
          className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium rounded-full"
        >
          <RotateCcw className="mr-2 size-4" />
          Try again
        </Button>
        <Link to="/register">
          <Button
            variant="ghost"
            className="w-full h-10 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-full text-sm mt-2"
          >
            <UserPlus className="mr-2 size-3.5" />
            Create new profile
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default LoginFailed;