
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const existingUser = localStorage.getItem('currentUserName');
    if (existingUser) {
      setCurrentUser(existingUser);
      setShowLoginOptions(true);
    }
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('currentUserName');
    setCurrentUser(null);
    setShowLoginOptions(false);
    toast.success("Signed out successfully!");
  };

  return {
    currentUser,
    showLoginOptions,
    handleSignOut
  };
};
