
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface ProfileCardProps {
  userName: string;
  userProfile: any;
}

const ProfileCard = ({ userName, userProfile }: ProfileCardProps) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <User className="mr-3 h-6 w-6 text-white" />
          Profile Information
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your Face Card details and recognition data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Name:</span>
          <span className="text-white">{userName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Face Profile:</span>
          <span className="text-white">✓ Registered</span>
        </div>
        {userProfile && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Card Created:</span>
              <span className="text-white">
                {new Date(userProfile.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Last Updated:</span>
              <span className="text-white">
                {new Date(userProfile.updated_at).toLocaleDateString()}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
