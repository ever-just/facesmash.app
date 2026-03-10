import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, MessageSquare, LogOut } from "lucide-react";
import { useSignOut } from "@/hooks/useSignOut";
import FeedbackModal from "./FeedbackModal";

interface ProfileDropdownProps {
  userName: string;
}

const ProfileDropdown = ({ userName }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const { handleSignOut } = useSignOut();
  const [showFeedback, setShowFeedback] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const userInitials = userName
    .split('@')[0]
    .split('.')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleFeedbackClick = () => {
    setIsOpen(false);
    setShowFeedback(true);
  };

  const handleSignOutClick = () => {
    setIsOpen(false);
    handleSignOut();
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="relative size-9 rounded-full p-0 hover:bg-white/5">
            <div className="size-9 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
              <span className="text-xs font-semibold text-white/60">{userInitials}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0 bg-[#0E1014] border-white/[0.06] rounded-xl shadow-2xl" align="end">
          <div className="p-4 border-b border-white/[0.04]">
            <p className="text-sm font-medium text-white/70 truncate">
              {userName.split('@')[0]}
            </p>
            <p className="text-xs text-white/25 truncate mt-0.5">{userName}</p>
          </div>
          <div className="py-1">
            <button
              onClick={handleSettingsClick}
              className="flex w-full items-center px-4 py-2.5 text-sm text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
            >
              <Settings className="mr-3 size-3.5" />
              Settings
            </button>
            <button
              onClick={handleFeedbackClick}
              className="flex w-full items-center px-4 py-2.5 text-sm text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
            >
              <MessageSquare className="mr-3 size-3.5" />
              Feedback
            </button>
            <button
              onClick={handleSignOutClick}
              className="flex w-full items-center px-4 py-2.5 text-sm text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
            >
              <LogOut className="mr-3 size-3.5" />
              Sign out
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)}
        userEmail={userName}
      />
    </>
  );
};

export default ProfileDropdown;
