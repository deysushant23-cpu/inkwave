import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { requestEmailOtpAction, verifyEmailOtpAction } from '@/app/actions/auth';

export function useAuth() {
  const supabase = createClient();
  const { setUser, setProfile, setAuthModalOpen, setNeedsPhoneCapture } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }
    
    setProfile(data as any); 
    
    setNeedsPhoneCapture(false);
  };

  const signInWithOtp = async (phoneOrEmail: string, type: 'phone' | 'email') => {
    setIsLoading(true);
    
    if (type === 'email') {
      const res = await requestEmailOtpAction(phoneOrEmail);
      setIsLoading(false);
      if (!res.success) {
        toast.error(res.error || 'Failed to send verification code.');
        return false;
      }
      toast.success('Verification code sent successfully!');
      return true;
    }

    // Phone Flow
    const result = await supabase.auth.signInWithOtp({
      phone: phoneOrEmail,
    });
    
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error.message);
      return false;
    }
    
    toast.success('OTP sent successfully!');
    return true;
  };

  const verifyOtp = async (phoneOrEmail: string, token: string, type: 'phone' | 'email') => {
    setIsLoading(true);
    
    if (type === 'email') {
      const res = await verifyEmailOtpAction(phoneOrEmail, token);
      if (!res.success || !res.session) {
        setIsLoading(false);
        toast.error(res.error || 'Failed to verify code.');
        return false;
      }

      // Establish client session
      const sessionResult = await supabase.auth.setSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token
      });

      setIsLoading(false);
      if (sessionResult.error) {
        toast.error(sessionResult.error.message);
        return false;
      }

      toast.success('Successfully logged in!');
      setAuthModalOpen(false);
      return true;
    }

    // Phone Flow
    const result = await supabase.auth.verifyOtp({
      phone: phoneOrEmail,
      token,
      type: 'sms',
    });
    
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error.message);
      return false;
    }
    
    toast.success('Successfully logged in!');
    setAuthModalOpen(false);
    return true;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    if (error) toast.error(error.message);
  };

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out successfully');
    }
  };

  return {
    isLoading,
    signInWithOtp,
    verifyOtp,
    signInWithGoogle,
    signOut,
  };
}
