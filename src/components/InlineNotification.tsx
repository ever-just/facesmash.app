import { Check, AlertCircle, User, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InlineNotificationProps {
  type: 'success' | 'error' | 'duplicate';
  title: string;
  message: string;
  userEmail?: string;
  onContinueToDashboard?: () => void;
  onRetry?: () => void;
}

const InlineNotification = ({ 
  type, 
  title, 
  message, 
  userEmail, 
  onContinueToDashboard, 
  onRetry 
}: InlineNotificationProps) => {
  const config = {
    success: { icon: <Check className="size-4 text-emerald-400" />, border: "border-emerald-500/20", bg: "bg-emerald-500/5", accent: "text-emerald-400" },
    duplicate: { icon: <User className="size-4 text-sky-400" />, border: "border-sky-500/20", bg: "bg-sky-500/5", accent: "text-sky-400" },
    error: { icon: <AlertCircle className="size-4 text-red-400" />, border: "border-red-500/20", bg: "bg-red-500/5", accent: "text-red-400" },
  }[type];

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${config.accent}`}>{title}</h3>
          <p className="text-white/40 text-sm mt-1">{message}</p>
          {userEmail && (
            <p className="text-white/25 text-xs mt-2 font-mono">{userEmail}</p>
          )}
          
          {type === 'duplicate' && onContinueToDashboard && (
            <Button 
              onClick={onContinueToDashboard}
              className="mt-4 h-9 bg-sky-500 hover:bg-sky-400 text-black text-sm font-medium rounded-full w-full"
            >
              <ArrowRight className="mr-2 size-3.5" />
              Continue to dashboard
            </Button>
          )}
          
          {onRetry && (
            <Button 
              onClick={onRetry}
              variant="ghost"
              className="mt-3 h-8 text-white/30 hover:text-white/60 hover:bg-white/5 text-sm rounded-full"
            >
              <RotateCcw className="mr-2 size-3" />
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InlineNotification;
