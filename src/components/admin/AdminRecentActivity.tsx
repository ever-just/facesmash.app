
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, XCircle } from "lucide-react";
import { SignInLog } from "@/types";

interface AdminRecentActivityProps {
  activity: SignInLog[];
}

const AdminRecentActivity = ({ activity }: AdminRecentActivityProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-gray-400">
          Latest login attempts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity.length > 0 ? (
            activity.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {log.success_status ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{log.user_email}</p>
                    <p className="text-gray-400 text-xs">{formatTime(log.created_at)}</p>
                  </div>
                </div>
                <Badge 
                  variant={log.success_status ? "default" : "destructive"}
                  className={log.success_status ? "bg-green-600 text-white" : "bg-red-600 text-white"}
                >
                  {log.success_status ? "Success" : "Failed"}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRecentActivity;
