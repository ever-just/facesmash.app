import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, LogOut } from "lucide-react";
interface CurrentUserCardProps {
  currentUser: string;
  onSignOut: () => void;
  onGoToDashboard: () => void;
}
const CurrentUserCard = ({
  currentUser,
  onSignOut,
  onGoToDashboard
}: CurrentUserCardProps) => {
  return <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="text-center">
        <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
        <CardTitle className="text-3xl text-white">Signed In</CardTitle>
        
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <p className="text-white font-semibold">Current Session Active</p>
          <p className="text-gray-300 mt-2">Welcome back, {currentUser}!</p>
          
        </div>
        
        <div className="space-y-4">
          <Button onClick={onGoToDashboard} className="w-full bg-white text-black hover:bg-gray-200">
            Continue to Dashboard
          </Button>
          <Button onClick={onSignOut} variant="outline" className="w-full border-white bg-slate-600 hover:bg-slate-500 text-slate-50">
            <LogOut className="mr-2 h-4 w-4" />
            Sign-Out
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default CurrentUserCard;