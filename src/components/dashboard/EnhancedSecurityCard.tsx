
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, Target, Scan, Database, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', userName)
          .single();

        // Get face templates count
        const { count: templatesCount } = await supabase
          .from('face_templates')
          .select('*', { count: 'exact', head: true })
          .eq('user_email', userName);

        // Get face scans count and average confidence
        const { data: scansData, count: scansCount } = await supabase
          .from('face_scans')
          .select('confidence_score', { count: 'exact' })
          .eq('user_email', userName);

        // Get last successful login
        const { data: lastLoginData } = await supabase
          .from('sign_in_logs')
          .select('sign_in_time')
          .eq('user_email', userName)
          .eq('success_status', true)
          .order('sign_in_time', { ascending: false })
          .limit(1)
          .single();

        // Calculate statistics
        const successRate = userProfile?.total_logins > 0 
          ? (userProfile.successful_logins / userProfile.total_logins) * 100 
          : 0;

        const avgConfidence = scansData?.length > 0
          ? scansData.reduce((sum, scan) => sum + (scan.confidence_score || 0), 0) / scansData.length
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
          lastLogin: lastLoginData?.sign_in_time || null,
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

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="text-center py-8">
          <Shield className="h-8 w-8 text-white mx-auto mb-4 animate-spin" />
          <p className="text-white">Loading security data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center text-lg sm:text-xl">
          <Shield className="mr-3 h-6 w-6 text-white" />
          Security Status
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your Face Card security metrics and insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        {/* Security Score */}
        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm sm:text-base">Security Score:</span>
          </div>
          <span className={`font-bold text-lg ${getSecurityScoreColor(stats.securityScore)}`}>
            {stats.securityScore}/100
          </span>
        </div>

        {/* Authentication Method */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm sm:text-base">Authentication:</span>
          <span className="text-white text-sm sm:text-base">Face Recognition</span>
        </div>

        {/* Success Rate */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm sm:text-base">Success Rate:</span>
          </div>
          <span className="text-white text-sm sm:text-base">{stats.successRate}%</span>
        </div>

        {/* Last Login */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm sm:text-base">Last Login:</span>
          </div>
          <span className="text-white text-sm sm:text-base">{formatLastLogin(stats.lastLogin)}</span>
        </div>

        {/* Face Templates */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm sm:text-base">Face Templates:</span>
          </div>
          <span className="text-white text-sm sm:text-base">{stats.totalTemplates}</span>
        </div>

        {/* Total Scans */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Scan className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm sm:text-base">Total Scans:</span>
          </div>
          <span className="text-white text-sm sm:text-base">{stats.totalScans}</span>
        </div>

        {/* Average Confidence */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm sm:text-base">Avg. Confidence:</span>
          <span className="text-white text-sm sm:text-base">{stats.avgConfidence}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSecurityCard;
