
import ProfileDropdown from "./ProfileDropdown";

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  return (
    <nav className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white rounded border-2 border-white flex items-center justify-center">
          <div className="w-4 h-4 border border-black rounded-full relative">
            <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border-t border-black rounded-t"></div>
          </div>
        </div>
        <span className="text-xl sm:text-2xl font-bold">FaceCard Dashboard</span>
      </div>
      <div className="flex items-center">
        <ProfileDropdown userName={userName} />
      </div>
    </nav>
  );
};

export default DashboardHeader;
