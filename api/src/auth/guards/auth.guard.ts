import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    const user = await this.supabaseService.verifyToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user to request for use in controllers
    request.user = user;

    return true;
  }
}
