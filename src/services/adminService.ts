
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, SignInLog, FaceScan } from "@/types";

export interface AdminStats {
  totalUsers: number;
  totalLogins: number;
  successRate: number;
  recentActivity: number;
}

export interface AdminUserData extends UserProfile {
  total_scans: number;
  last_login: string | null;
}

export const checkIsAdmin = async (userEmail: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('email', userEmail)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin || false;
  } catch (error) {
    console.error('Unexpected error checking admin status:', error);
    return false;
  }
};

export const getAllUsers = async (): Promise<AdminUserData[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');

    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }

    // Get scan count and last login for each user
    const usersWithData = await Promise.all(
      (data || []).map(async (user) => {
        // Get scan count
        const { count: scanCount } = await supabase
          .from('face_scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_email', user.email);

        // Get last login
        const { data: lastLogin } = await supabase
          .from('sign_in_logs')
          .select('sign_in_time')
          .eq('user_email', user.email)
          .eq('success_status', true)
          .order('sign_in_time', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...user,
          total_scans: scanCount || 0,
          last_login: lastLogin?.sign_in_time || null
        };
      })
    );

    return usersWithData;
  } catch (error) {
    console.error('Unexpected error fetching all users:', error);
    return [];
  }
};

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get total logins
    const { count: totalLogins } = await supabase
      .from('sign_in_logs')
      .select('*', { count: 'exact', head: true });

    // Get successful logins
    const { count: successfulLogins } = await supabase
      .from('sign_in_logs')
      .select('*', { count: 'exact', head: true })
      .eq('success_status', true);

    // Get recent activity (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { count: recentActivity } = await supabase
      .from('sign_in_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo.toISOString());

    const successRate = totalLogins ? (successfulLogins || 0) / totalLogins * 100 : 0;

    return {
      totalUsers: totalUsers || 0,
      totalLogins: totalLogins || 0,
      successRate: Math.round(successRate * 100) / 100,
      recentActivity: recentActivity || 0
    };
  } catch (error) {
    console.error('Unexpected error fetching admin stats:', error);
    return {
      totalUsers: 0,
      totalLogins: 0,
      successRate: 0,
      recentActivity: 0
    };
  }
};

export const getRecentActivity = async (limit: number = 10): Promise<SignInLog[]> => {
  try {
    const { data, error } = await supabase
      .from('sign_in_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching recent activity:', error);
    return [];
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting user:', error);
    return false;
  }
};
