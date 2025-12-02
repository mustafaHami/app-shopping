import { supabase } from '@/src/lib/supabase';
import { SignUpData, SignInData, AuthSession, AuthUser } from '../types';

export const authApi = {
  /**
   * Sign up a new user with pseudonym and password
   */
  signUp: async (data: SignUpData): Promise<AuthSession> => {
    // Generate a temporary email based on pseudonym for Supabase
    const tempEmail = `${data.pseudonym.toLowerCase()}@temp.local`;

    const { data: authData, error } = await supabase.auth.signUp({
      email: tempEmail,
      password: data.password,
      options: {
        data: {
          pseudonym: data.pseudonym,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.session || !authData.user) {
      throw new Error('Sign up failed: No session or user returned');
    }

    return {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user: {
        id: authData.user.id,
        pseudonym: authData.user.user_metadata?.pseudonym || data.pseudonym,
        email: authData.user.email,
        createdAt: authData.user.created_at,
      },
      expiresAt: authData.session.expires_at || 0,
    };
  },

  /**
   * Sign in an existing user with pseudonym and password
   */
  signIn: async (data: SignInData): Promise<AuthSession> => {
    // Generate email from pseudonym
    const tempEmail = `${data.pseudonym.toLowerCase()}@temp.local`;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: tempEmail,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.session || !authData.user) {
      throw new Error('Sign in failed: No session or user returned');
    }

    return {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user: {
        id: authData.user.id,
        pseudonym: authData.user.user_metadata?.pseudonym || data.pseudonym,
        email: authData.user.email,
        createdAt: authData.user.created_at,
      },
      expiresAt: authData.session.expires_at || 0,
    };
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get the current session
   */
  getSession: async (): Promise<AuthSession | null> => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!session) {
      return null;
    }

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: {
        id: session.user.id,
        pseudonym: session.user.user_metadata?.pseudonym || '',
        email: session.user.email,
        createdAt: session.user.created_at,
      },
      expiresAt: session.expires_at || 0,
    };
  },

  /**
   * Get the current user
   */
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      pseudonym: user.user_metadata?.pseudonym || '',
      email: user.email,
      createdAt: user.created_at,
    };
  },

  /**
   * Request password reset email
   */
  resetPassword: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new Error(error.message);
    }
  },
};
