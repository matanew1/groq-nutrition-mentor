import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }

        // Handle sign in success
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in successfully');
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('GitHub sign in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Email sign in error:', error);
        return { error };
      }

      console.log('Email sign in successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Email sign in exception:', error);
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName?.trim() || '',
          }
        }
      });

      if (error) {
        console.error('Email sign up error:', error);
        return { error };
      }

      console.log('Email sign up successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Email sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};