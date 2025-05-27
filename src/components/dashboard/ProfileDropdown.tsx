
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, MessageSquare, LogOut } from "lucide-react";
import { useSignOut } from "@/hooks/useSignOut";
import FeedbackModal from "./FeedbackModal";

interface ProfileDropdownProps {
  userName: string;
}

const ProfileDropdown = ({ userName }: ProfileDropdownProps) => {
  const { handleSignOut } = useSignOut();
  const [showFeedback, setShowFeedback] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const userInitials = userName
    .split('@')[0]
    .split('.')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

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
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarFallback className="bg-gray-700 text-white text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0 bg-gray-900 border-gray-700" align="end">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gray-700 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userName.split('@')[0]}
                </p>
                <p className="text-xs text-gray-400 truncate">{userName}</p>
              </div>
            </div>
          </div>
          <div className="py-2">
            <button
              onClick={handleFeedbackClick}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <MessageSquare className="mr-3 h-4 w-4" />
              Feedback
            </button>
            <button
              onClick={handleSignOutClick}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
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
