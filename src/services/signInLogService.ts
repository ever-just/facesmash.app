
import { supabase } from "@/integrations/supabase/client";

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
    
    const { data, error } = await supabase
      .from('sign_in_logs')
      .insert([
        {
          user_email: userEmail,
          success_status: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating sign-in log:', error);
      return null;
    }

    console.log('Sign-in log created successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error creating sign-in log:', error);
    return null;
  }
};

export const getSignInLogsByUser = async (userEmail: string): Promise<SignInLog[]> => {
  try {
    const { data, error } = await supabase
      .from('sign_in_logs')
      .select('*')
      .eq('user_email', userEmail)
      .eq('success_status', true)
      .order('sign_in_time', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching sign-in logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching sign-in logs:', error);
    return [];
  }
};
