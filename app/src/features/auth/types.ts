import { z } from 'zod';
import { signUpSchema, signInSchema } from './schemas/auth-schema';

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  expiresAt: number;
}

export interface AuthError {
  message: string;
  status?: number;
}

