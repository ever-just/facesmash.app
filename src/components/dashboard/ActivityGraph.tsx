import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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

  const getActivityStats = () => {
    if (signInLogs.length === 0) return { totalLogins: 0, streak: 0, avgPerWeek: 0, lastLogin: null };

    const now = new Date();
    const totalLogins = signInLogs.length;
    
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
      time: new Date(log.sign_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(log.sign_in_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="size-5 text-white/20 animate-spin" />
      </div>
    );
  }

  const stats = getActivityStats();
  const recentSessions = getRecentSessions();

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] mb-6">Activity</p>

      {/* stat strip */}
      <div className="flex flex-wrap gap-8 mb-8 pb-6 border-b border-white/[0.04]">
        {[
          { val: String(stats.totalLogins), label: "Total logins" },
          { val: String(stats.streak), label: "Streak" },
          { val: `${stats.avgPerWeek}/wk`, label: "Frequency" },
          { val: stats.lastLogin ? formatTimeAgo(stats.lastLogin) : "—", label: "Last login" },
        ].map((s, i) => (
          <div key={i}>
            <div className="text-xl font-bold tracking-tight text-white">{s.val}</div>
            <div className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* recent sessions */}
      {recentSessions.length > 0 ? (
        <div className="space-y-0">
          {recentSessions.map((session, index) => (
            <div
              key={session.id}
              className="flex items-center gap-4 py-3 border-b border-white/[0.03] last:border-0"
            >
              {/* timeline dot + line */}
              <div className="flex flex-col items-center">
                <div className={`size-2 rounded-full ${index === 0 ? 'bg-emerald-400' : 'bg-white/15'}`} />
              </div>
              {/* info */}
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Signed in</p>
                  <p className="text-white/20 text-xs">{session.date} · {session.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/25 text-xs">{session.timeAgo}</span>
                  {index === 0 && (
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400/70 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      Latest
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {signInLogs.length > 5 && (
            <p className="text-white/15 text-xs text-center pt-4">
              {signInLogs.length - 5} more sessions
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-white/25 text-sm">No sign-in activity yet</p>
        </div>
      )}
    </div>
  );
};

export default ActivityGraph;
