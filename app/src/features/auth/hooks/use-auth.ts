import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/auth-api';
import { SignUpData, SignInData, AuthSession, AuthUser } from '../types';
import { supabase } from '@/src/lib/supabase';
import { useEffect, useState } from 'react';

/**
 * Hook to get the current session
 */
export const useSession = () => {
  return useQuery<AuthSession | null>({
    queryKey: ['auth', 'session'],
    queryFn: authApi.getSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

/**
 * Hook to get the current user
 */
export const useCurrentUser = () => {
  return useQuery<AuthUser | null>({
    queryKey: ['auth', 'user'],
    queryFn: authApi.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

/**
 * Hook to sign up a new user
 */
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthSession, Error, SignUpData>({
    mutationFn: authApi.signUp,
    onSuccess: (session) => {
      queryClient.setQueryData(['auth', 'session'], session);
      queryClient.setQueryData(['auth', 'user'], session.user);
    },
  });
};

/**
 * Hook to sign in a user
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthSession, Error, SignInData>({
    mutationFn: authApi.signIn,
    onSuccess: (session) => {
      queryClient.setQueryData(['auth', 'session'], session);
      queryClient.setQueryData(['auth', 'user'], session.user);
    },
  });
};

/**
 * Hook to sign out a user
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'session'], null);
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
    },
  });
};

/**
 * Hook to request password reset
 */
export const useResetPassword = () => {
  return useMutation<void, Error, string>({
    mutationFn: authApi.resetPassword,
  });
};

/**
 * Hook to listen for auth state changes
 */
export const useAuthStateChange = () => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const authSession: AuthSession = {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          user: {
            id: session.user.id,
            email: session.user.email!,
            createdAt: session.user.created_at,
          },
          expiresAt: session.expires_at || 0,
        };
        queryClient.setQueryData(['auth', 'session'], authSession);
        queryClient.setQueryData(['auth', 'user'], authSession.user);
      }
      setIsInitialized(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const authSession: AuthSession = {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          user: {
            id: session.user.id,
            email: session.user.email!,
            createdAt: session.user.created_at,
          },
          expiresAt: session.expires_at || 0,
        };
        queryClient.setQueryData(['auth', 'session'], authSession);
        queryClient.setQueryData(['auth', 'user'], authSession.user);
      } else {
        queryClient.setQueryData(['auth', 'session'], null);
        queryClient.setQueryData(['auth', 'user'], null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return { isInitialized };
};

