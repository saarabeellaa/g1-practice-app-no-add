
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  'https://lrbqntycvzvdwwrudpfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYnFudHljdnp2ZHd3cnVkcGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzQ1NTIsImV4cCI6MjA3NTYxMDU1Mn0.IyVj0H9TqsEuEkcBiJ7tAq6fZVMImPNeSrimQb1LQxg',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Initialize anonymous user on app start
export const initializeAnonymousUser = async () => {
  try {
    // Check if user already has a session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      console.log('Existing user found:', session.user.id);
      return session.user.id;
    }
    
    // No existing session, create anonymous user
    const { data: { user }, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error('Error signing in anonymously:', error);
      return null;
    }
    
    console.log('Anonymous user created:', user.id);
    return user.id;
  } catch (error) {
    console.error('Error initializing anonymous user:', error);
    return null;
  }
};

// Get current user ID (for use in components)
export const getCurrentUserId = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
