import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { getSignInLogsByUser, SignInLog } from "@/services/signInLogService";
interface SignInHistoryProps {
  userEmail: string;
}
const SignInHistory = ({
  userEmail
}: SignInHistoryProps) => {
  const [signInLogs, setSignInLogs] = useState<SignInLog[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSignInLogs = async () => {
      console.log('Fetching sign-in logs for user:', userEmail);
      const logs = await getSignInLogsByUser(userEmail);
      setSignInLogs(logs);
      setLoading(false);
    };
    if (userEmail) {
      fetchSignInLogs();
    }
  }, [userEmail]);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };
  if (loading) {
    return <Card className="bg-gray-900 border-gray-800">
        <CardContent className="text-center py-8">
          <Clock className="h-8 w-8 text-white mx-auto mb-4 animate-spin" />
          <p className="text-white">Loading sign-in history...</p>
        </CardContent>
      </Card>;
  }
  return <Card className="bg-gray-900 border-gray-800">
      
      
    </Card>;
};
export default SignInHistory;