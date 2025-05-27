
import { useState, useEffect } from "react";
import { Square, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { checkIsAdmin } from "@/services/adminService";

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { handleSignOut } = useCurrentUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (userName) {
        const adminStatus = await checkIsAdmin(userName);
        setIsAdmin(adminStatus);
      }
    };
    checkAdminStatus();
  }, [userName]);

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <header className="border-b border-gray-800 bg-black">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Square className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">FACECARD</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminClick}
                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
