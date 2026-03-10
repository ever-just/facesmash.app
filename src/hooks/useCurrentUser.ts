
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/integrations/api/client";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  useEffect(() => {
    // Verify session via httpOnly cookie first, fall back to localStorage
    const checkSession = async () => {
      let networkError = false;
      try {
        const res = await api.verify();
        if (res.ok && res.data.user) {
          setCurrentUser(res.data.user.email);
          setShowLoginOptions(true);
          localStorage.setItem('currentUserName', res.data.user.email);
          return;
        }
        // Session is invalid/expired — clear stale localStorage
        localStorage.removeItem('currentUserName');
      } catch {
        // Network error — fall through to localStorage as offline fallback
        networkError = true;
      }

      // Only use localStorage as fallback for network errors,
      // not for expired/invalid sessions
      if (networkError) {
        const existingUser = localStorage.getItem('currentUserName');
        if (existingUser) {
          setCurrentUser(existingUser);
          setShowLoginOptions(true);
        }
      }
    };

    checkSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await api.logout();
    } catch {
      // Continue with local cleanup even if server call fails
    }
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
