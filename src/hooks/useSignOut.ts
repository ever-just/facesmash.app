
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useSignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('currentUserName');
    toast.success("Successfully signed out!");
    navigate('/');
  };

  return { handleSignOut };
};
