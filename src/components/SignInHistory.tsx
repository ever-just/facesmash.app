
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import { getSignInLogsByUser, SignInLog } from "@/services/signInLogService";

interface SignInHistoryProps {
  userEmail: string;
}

const SignInHistory = ({ userEmail }: SignInHistoryProps) => {
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
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="text-center py-8">
          <Clock className="h-8 w-8 text-white mx-auto mb-4 animate-spin" />
          <p className="text-white">Loading sign-in history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Recent Sign-ins
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your recent login activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {signInLogs.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No sign-in history found</p>
        ) : (
          <div className="space-y-3">
            {signInLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-white text-sm">Successful login</span>
                </div>
                <span className="text-gray-400 text-sm">{formatDate(log.created)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignInHistory;
