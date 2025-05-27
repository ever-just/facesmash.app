
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, TrendingUp, Clock, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  checkIsAdmin,
  getAllUsers,
  getAdminStats,
  getRecentActivity,
  deleteUser,
  AdminStats,
  AdminUserData
} from "@/services/adminService";
import { SignInLog } from "@/types";
import AdminUserTable from "@/components/admin/AdminUserTable";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import AdminRecentActivity from "@/components/admin/AdminRecentActivity";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalLogins: 0,
    successRate: 0,
    recentActivity: 0
  });
  const [recentActivity, setRecentActivity] = useState<SignInLog[]>([]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const currentUserName = localStorage.getItem('currentUserName');
      if (!currentUserName) {
        navigate('/login');
        return;
      }

      const isAdmin = await checkIsAdmin(currentUserName);
      if (!isAdmin) {
        toast.error("Access denied. Admin privileges required.");
        navigate('/dashboard');
        return;
      }

      await loadAdminData();
      setLoading(false);
    };

    checkAdminAccess();
  }, [navigate]);

  const loadAdminData = async () => {
    try {
      const [usersData, statsData, activityData] = await Promise.all([
        getAllUsers(),
        getAdminStats(),
        getRecentActivity(10)
      ]);

      setUsers(usersData);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error("Failed to load admin data");
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    const success = await deleteUser(userId);
    if (success) {
      toast.success("User deleted successfully");
      await loadAdminData(); // Reload data
    } else {
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-white mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">System overview and user management</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Stats Cards */}
        <AdminStatsCards stats={stats} />

        {/* User Management */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <AdminUserTable users={users} onDeleteUser={handleDeleteUser} />
          </div>
          
          {/* Recent Activity */}
          <div>
            <AdminRecentActivity activity={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
