import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useSignOut } from "@/hooks/useSignOut";
interface DashboardHeaderProps {
  userName: string;
}
const DashboardHeader = ({
  userName
}: DashboardHeaderProps) => {
  const {
    handleSignOut
  } = useSignOut();
  return <nav className="flex items-center justify-between p-6 border-b border-gray-800">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white rounded border-2 border-white flex items-center justify-center">
          <div className="w-4 h-4 border border-black rounded-full relative">
            <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border-t border-black rounded-t"></div>
          </div>
        </div>
        <span className="text-2xl font-bold">FaceCard Dashboard</span>
      </div>
      <div className="flex items-center space-x-4">
        
        <Button onClick={handleSignOut} variant="outline" className="border-white hover:bg-white text-gray-900 mx-0">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </nav>;
};
export default DashboardHeader;