
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/integrations/api/client";

export const useSignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await api.logout(); // Clear httpOnly cookie server-side
    } catch {
      // Continue with local cleanup even if server call fails
    }
    localStorage.removeItem('currentUserName');
    toast.success("Successfully signed out!");
    navigate('/');
  };

  return { handleSignOut };
};
