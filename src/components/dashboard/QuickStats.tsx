import { useState, useEffect } from "react";
import { Loader2, Shield, Scan, TrendingUp, Zap } from "lucide-react";
import { api } from "@/integrations/api/client";

interface QuickStatsProps {
  userName: string;
}

interface StatsData {
  securityScore: number;
  totalScans: number;
  successRate: number;
  avgConfidence: number;
}

const QuickStats = ({ userName }: QuickStatsProps) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.getProfile(),
          api.getProfileStats(),
        ]);

        const profile = profileRes.ok ? profileRes.data : null;
        const statsData = statsRes.ok ? statsRes.data : null;

        const totalLogins = profile?.loginCount || 0;
        const successfulLogins = profile?.successfulLogins || 0;
        const successRate = totalLogins > 0
          ? (successfulLogins / totalLogins) * 100
          : 0;

        const scansCount = statsData?.scanCount || 0;
        const templatesCount = statsData?.templateCount || 0;
        const avgConfidence = profile?.avgQualityScore || 0;

        const securityScore = Math.min(100, Math.round(
          (successRate * 0.4) +
          (avgConfidence * 100 * 0.3) +
          (Math.min(templatesCount, 5) * 20 * 0.2) +
          (scansCount > 10 ? 10 : scansCount) * 0.1
        ));

        setStats({
          securityScore,
          totalScans: scansCount,
          successRate: Math.round(successRate),
          avgConfidence: Math.round(avgConfidence * 100),
        });
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userName) {
      fetchStats();
    }
  }, [userName]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex items-center justify-center min-h-[120px]">
            <Loader2 className="size-4 text-white/10 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-400/10 border-emerald-400/20';
    if (score >= 60) return 'bg-amber-400/10 border-amber-400/20';
    return 'bg-red-400/10 border-red-400/20';
  };

  const cards = [
    {
      icon: Shield,
      label: "Security Score",
      value: `${stats.securityScore}`,
      suffix: "/100",
      color: getScoreColor(stats.securityScore),
      bgAccent: getScoreBg(stats.securityScore),
    },
    {
      icon: Scan,
      label: "Total Scans",
      value: String(stats.totalScans),
      suffix: "",
      color: "text-white",
      bgAccent: "bg-white/[0.04] border-white/[0.08]",
    },
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: `${stats.successRate}`,
      suffix: "%",
      color: getScoreColor(stats.successRate),
      bgAccent: getScoreBg(stats.successRate),
    },
    {
      icon: Zap,
      label: "Avg. Confidence",
      value: `${stats.avgConfidence}`,
      suffix: "%",
      color: getScoreColor(stats.avgConfidence),
      bgAccent: getScoreBg(stats.avgConfidence),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors relative overflow-hidden"
        >
          {/* Subtle glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-emerald-500/[0.04] blur-2xl" />
          </div>

          <div className="relative">
            <div className={`inline-flex items-center justify-center size-9 rounded-xl border ${card.bgAccent} mb-4`}>
              <card.icon className={`size-4 ${card.color}`} />
            </div>

            <div className="flex items-baseline gap-0.5">
              <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${card.color}`}>
                {card.value}
              </span>
              {card.suffix && (
                <span className="text-sm text-white/20 font-medium">{card.suffix}</span>
              )}
            </div>

            <p className="text-[10px] text-white/25 uppercase tracking-wider mt-1.5">
              {card.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
