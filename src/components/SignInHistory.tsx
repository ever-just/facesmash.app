
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
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
          <Clock className="mr-3 h-6 w-6 text-white" />
          Recent Sign-Ins
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your recent Face Card authentication history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {signInLogs.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400">No previous sign-ins recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {signInLogs.map((log) => (
              <div
                key={log.id}
                className="flex justify-between items-center bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div>
                  <p className="text-white font-medium">Successful Face Recognition</p>
                  <p className="text-gray-400 text-sm">{formatDate(log.sign_in_time)}</p>
                </div>
                <div className="text-green-400 text-sm">✓ Verified</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignInHistory;
