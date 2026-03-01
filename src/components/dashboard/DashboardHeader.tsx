import AppNav from "@/components/AppNav";
import ProfileDropdown from "./ProfileDropdown";

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  return (
    <AppNav
      showBack={false}
      rightContent={<ProfileDropdown userName={userName} />}
    />
  );
};

export default DashboardHeader;
