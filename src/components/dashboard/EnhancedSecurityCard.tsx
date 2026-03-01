import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { pb } from "@/integrations/supabase/client";

interface SecurityStats {
  totalTemplates: number;
  lastLogin: string | null;
  successRate: number;
  avgConfidence: number;
  totalScans: number;
  securityScore: number;
}

interface EnhancedSecurityCardProps {
  userName: string;
}

const EnhancedSecurityCard = ({ userName }: EnhancedSecurityCardProps) => {
  const [stats, setStats] = useState<SecurityStats>({
    totalTemplates: 0,
    lastLogin: null,
    successRate: 0,
    avgConfidence: 0,
    totalScans: 0,
    securityScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityStats = async () => {
      try {
        // Get user profile data
        const profiles = await pb.collection('user_profiles').getList(1, 1, {
          filter: `email="${userName}"`,
        });
        const userProfile = profiles.items.length > 0 ? profiles.items[0] : null;

        // Get face templates count
        const templates = await pb.collection('face_templates').getList(1, 1, {
          filter: `user_email="${userName}"`,
        });
        const templatesCount = templates.totalItems;

        // Get face scans count and average confidence
        const scans = await pb.collection('face_scans').getFullList({
          filter: `user_email="${userName}"`,
        });
        const scansCount = scans.length;

        // Get last successful login
        const loginLogs = await pb.collection('sign_in_logs').getList(1, 1, {
          filter: `user_email="${userName}" && success=true`,
          sort: '-created',
        });
        const lastLoginData = loginLogs.items.length > 0 ? loginLogs.items[0] : null;

        // Calculate statistics
        const totalLogins = userProfile?.login_count || 0;
        const successfulLogins = userProfile?.successful_logins || 0;
        const successRate = totalLogins > 0 
          ? (successfulLogins / totalLogins) * 100 
          : 0;

        const avgConfidence = scans.length > 0
          ? scans.reduce((sum: number, scan: any) => sum + (scan.confidence || 0), 0) / scans.length
          : 0;

        // Calculate security score (0-100)
        const securityScore = Math.min(100, Math.round(
          (successRate * 0.4) + 
          (avgConfidence * 100 * 0.3) + 
          (Math.min(templatesCount || 0, 5) * 20 * 0.2) + 
          ((scansCount || 0) > 10 ? 10 : (scansCount || 0)) * 0.1
        ));

        setStats({
          totalTemplates: templatesCount || 0,
          lastLogin: lastLoginData?.created || null,
          successRate: Math.round(successRate),
          avgConfidence: Math.round(avgConfidence * 100),
          totalScans: scansCount || 0,
          securityScore
        });
      } catch (error) {
        console.error('Error fetching security stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userName) {
      fetchSecurityStats();
    }
  }, [userName]);

  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="size-5 text-white/20 animate-spin" />
      </div>
    );
  }

  const rows = [
    { label: "Security score", value: `${stats.securityScore}/100`, color: getScoreColor(stats.securityScore) },
    { label: "Auth method", value: "Face Recognition" },
    { label: "Success rate", value: `${stats.successRate}%` },
    { label: "Last login", value: formatLastLogin(stats.lastLogin) },
    { label: "Face templates", value: String(stats.totalTemplates) },
    { label: "Total scans", value: String(stats.totalScans) },
    { label: "Avg. confidence", value: `${stats.avgConfidence}%` },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] mb-5">Security</p>
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-white/30 text-sm">{row.label}</span>
            <span className={`text-sm font-medium ${row.color || 'text-white/70'}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedSecurityCard;
