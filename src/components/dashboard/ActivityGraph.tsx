
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Clock, TrendingUp, Zap, User } from "lucide-react";
import { getSignInLogsByUser, SignInLog } from "@/services/signInLogService";

interface ActivityGraphProps {
  userEmail: string;
  userCreatedAt?: string;
}

const ActivityGraph = ({ userEmail, userCreatedAt }: ActivityGraphProps) => {
  const [signInLogs, setSignInLogs] = useState<SignInLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      const logs = await getSignInLogsByUser(userEmail);
      setSignInLogs(logs);
      setLoading(false);
    };

    if (userEmail) {
      fetchActivityData();
    }
  }, [userEmail]);

  // Calculate activity statistics
  const getActivityStats = () => {
    if (signInLogs.length === 0) return { totalLogins: 0, streak: 0, avgPerWeek: 0, lastLogin: null };

    const now = new Date();
    const totalLogins = signInLogs.length;
    
    // Calculate current streak
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    for (const log of signInLogs) {
      const logDate = new Date(log.sign_in_time).toDateString();
      if (logDate === today || logDate === yesterday) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate average logins per week
    const firstLogin = new Date(signInLogs[signInLogs.length - 1].sign_in_time);
    const daysSinceFirst = Math.max(1, (now.getTime() - firstLogin.getTime()) / (1000 * 60 * 60 * 24));
    const avgPerWeek = Math.round((totalLogins / daysSinceFirst) * 7);

    const lastLogin = signInLogs[0] ? new Date(signInLogs[0].sign_in_time) : null;

    return { totalLogins, streak, avgPerWeek, lastLogin };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getRecentSessions = () => {
    return signInLogs.slice(0, 5).map(log => ({
      ...log,
      timeAgo: formatTimeAgo(new Date(log.sign_in_time)),
      time: new Date(log.sign_in_time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      date: new Date(log.sign_in_time).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="text-center py-8">
          <Activity className="h-8 w-8 text-white mx-auto mb-4 animate-spin" />
          <p className="text-white">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  const stats = getActivityStats();
  const recentSessions = getRecentSessions();

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center text-lg sm:text-xl">
          <Activity className="mr-2 h-5 w-5 text-blue-400" />
          Login Activity
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your authentication history and patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Logins</p>
                <p className="text-white text-2xl font-bold">{stats.totalLogins}</p>
              </div>
              <User className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Current Streak</p>
                <p className="text-white text-2xl font-bold">{stats.streak}</p>
              </div>
              <Zap className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Per Week</p>
                <p className="text-white text-2xl font-bold">{stats.avgPerWeek}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-lg p-4 border border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Last Login</p>
                <p className="text-white text-sm font-bold">
                  {stats.lastLogin ? formatTimeAgo(stats.lastLogin) : 'Never'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Recent Sessions Timeline */}
        {recentSessions.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div 
                  key={session.id} 
                  className="relative flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors group"
                >
                  {/* Timeline dot */}
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-green-500' : 'bg-blue-500'
                    } group-hover:scale-110 transition-transform`}></div>
                    {index < recentSessions.length - 1 && (
                      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-600"></div>
                    )}
                  </div>

                  {/* Session info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">Successful Login</p>
                        <p className="text-gray-400 text-xs">{session.date} at {session.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-300 text-xs">{session.timeAgo}</p>
                        {index === 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                            Latest
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {signInLogs.length > 5 && (
              <div className="text-center mt-4">
                <p className="text-gray-400 text-sm">
                  Showing 5 of {signInLogs.length} total sessions
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {signInLogs.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No login activity yet</p>
            <p className="text-gray-500 text-sm">Your authentication history will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityGraph;
