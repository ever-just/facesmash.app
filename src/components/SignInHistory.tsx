
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
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
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Sign-In History
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your recent login activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {signInLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Date & Time</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signInLogs.map((log) => (
                  <TableRow key={log.id} className="border-gray-700">
                    <TableCell className="text-white">
                      {formatDate(log.sign_in_time)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="default"
                        className="bg-green-600 text-white flex items-center gap-1 w-fit"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {log.ip_address || 'Unknown'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No sign-in history available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignInHistory;
