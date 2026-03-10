import { useState, useEffect } from "react";
import { Loader2, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { api } from "@/integrations/api/client";

interface SecurityGaugeProps {
  userName: string;
}

interface SecurityData {
  securityScore: number;
  successRate: number;
  avgConfidence: number;
  totalTemplates: number;
  totalScans: number;
  lastLogin: string | null;
}

const SecurityGauge = ({ userName }: SecurityGaugeProps) => {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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

        const templatesCount = statsData?.templateCount || 0;
        const scansCount = statsData?.scanCount || 0;
        const avgConfidence = profile?.avgQualityScore || 0;

        const securityScore = Math.min(100, Math.round(
          (successRate * 0.4) +
          (avgConfidence * 100 * 0.3) +
          (Math.min(templatesCount, 5) * 20 * 0.2) +
          (scansCount > 10 ? 10 : scansCount) * 0.1
        ));

        setData({
          securityScore,
          successRate: Math.round(successRate),
          avgConfidence: Math.round(avgConfidence * 100),
          totalTemplates: templatesCount,
          totalScans: scansCount,
          lastLogin: profile?.lastLogin || null,
        });
      } catch (error) {
        console.error('Error fetching security data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userName) {
      fetchData();
    }
  }, [userName]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex items-center justify-center min-h-[280px]">
        <Loader2 className="size-5 text-white/20 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#34d399'; // emerald-400
    if (score >= 60) return '#fbbf24'; // amber-400
    return '#f87171'; // red-400
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Moderate';
    return 'Needs attention';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const scoreColor = getScoreColor(data.securityScore);

  // SVG arc for gauge
  const radius = 60;
  const circumference = Math.PI * radius; // half circle
  const progress = (data.securityScore / 100) * circumference;

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

  const checks = [
    {
      label: "Face recognition active",
      passed: true,
    },
    {
      label: "Face templates registered",
      passed: data.totalTemplates > 0,
    },
    {
      label: "High success rate (>70%)",
      passed: data.successRate > 70,
    },
    {
      label: "Good confidence score (>70%)",
      passed: data.avgConfidence > 70,
    },
  ];

  const passedChecks = checks.filter(c => c.passed).length;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex items-center justify-center size-8 rounded-lg bg-white/[0.04] border border-white/[0.08]">
          <Shield className="size-3.5 text-white/40" />
        </div>
        <div>
          <p className="text-white/20 uppercase tracking-[0.2em] text-[10px]">Security Posture</p>
          <p className="text-white/10 text-[10px] mt-0.5">{passedChecks}/{checks.length} checks passed</p>
        </div>
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg width="160" height="90" viewBox="0 0 160 90">
            {/* Background arc */}
            <path
              d="M 10 80 A 60 60 0 0 1 150 80"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d="M 10 80 A 60 60 0 0 1 150 80"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className={`text-3xl font-bold tracking-tight ${getScoreTextColor(data.securityScore)}`}>
              {data.securityScore}
            </span>
            <span className="text-[9px] text-white/20 uppercase tracking-wider">
              {getScoreLabel(data.securityScore)}
            </span>
          </div>
        </div>
      </div>

      {/* Security checks */}
      <div className="space-y-2.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2.5">
            {check.passed ? (
              <CheckCircle className="size-3.5 text-emerald-400/60 shrink-0" />
            ) : (
              <AlertTriangle className="size-3.5 text-amber-400/60 shrink-0" />
            )}
            <span className={`text-xs ${check.passed ? 'text-white/40' : 'text-white/25'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {/* Last login */}
      <div className="mt-5 pt-4 border-t border-white/[0.04]">
        <div className="flex items-center justify-between">
          <span className="text-white/20 text-[10px] uppercase tracking-wider">Last login</span>
          <span className="text-white/40 text-xs">{formatLastLogin(data.lastLogin)}</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityGauge;
