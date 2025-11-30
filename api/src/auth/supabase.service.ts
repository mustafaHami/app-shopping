import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase URL and Service Role Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Verify JWT token from Supabase
   * @param token - The JWT token to verify
   * @returns The user object if valid, null otherwise
   */
  async verifyToken(token: string): Promise<{ id: string; email: string } | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Upload an image to Supabase Storage
   * @param bucket - The storage bucket name
   * @param path - The file path in the bucket
   * @param file - The file buffer to upload
   * @param contentType - The content type of the file
   * @returns The public URL of the uploaded file
   */
  async uploadImage(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(data.path);

    return publicUrl;
  }

  /**
   * Delete an image from Supabase Storage
   * @param bucket - The storage bucket name
   * @param path - The file path in the bucket
   */
  async deleteImage(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Get public URL for a file in Supabase Storage
   * @param bucket - The storage bucket name
   * @param path - The file path in the bucket
   * @returns The public URL
   */
  getPublicUrl(bucket: string, path: string): string {
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  }
}
