import React, { createContext, useEffect, useState } from 'react';
import { initializeAnonymousUser, getCurrentUserId } from '../supabase';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupUser = async () => {
      try {
        const id = await initializeAnonymousUser();
        setUserId(id);
      } catch (error) {
        console.error('Error setting up user:', error);
      } finally {
        setLoading(false);
      }
    };

    setupUser();
  }, []);

  const value = {
    userId,
    loading,
    refetchUserId: async () => {
      const id = await getCurrentUserId();
      setUserId(id);
      return id;
    }
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for easy access
export function useUserId() {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUserId must be used within UserProvider');
  }
  return context;
}
