import { z } from 'zod';

const isDev = process.env.NODE_ENV === 'development';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: isDev
    ? z.string().min(1, 'Password is required in development')
    : z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});
