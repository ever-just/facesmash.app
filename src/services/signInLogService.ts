
import { pb } from "@/integrations/supabase/client";

export interface SignInLog {
  id: string;
  user_email: string;
  sign_in_time: string;
  ip_address: string | null;
  success_status: boolean;
  created_at: string;
}

export const createSignInLog = async (userEmail: string): Promise<SignInLog | null> => {
  try {
    console.log('Creating sign-in log for user:', userEmail);
    
    const record = await pb.collection('sign_in_logs').create({
      user_email: userEmail,
      success: true,
    });

    console.log('Sign-in log created successfully:', record);
    return record as unknown as SignInLog;
  } catch (error) {
    console.error('Unexpected error creating sign-in log:', error);
    return null;
  }
};

export const getSignInLogsByUser = async (userEmail: string): Promise<SignInLog[]> => {
  try {
    const records = await pb.collection('sign_in_logs').getList(1, 10, {
      filter: `user_email="${userEmail}" && success=true`,
      sort: '-created',
    });

    return records.items as unknown as SignInLog[];
  } catch (error) {
    console.error('Unexpected error fetching sign-in logs:', error);
    return [];
  }
};
