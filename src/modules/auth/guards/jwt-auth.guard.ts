import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // Log non-sensitive auth failure reason to help debugging (e.g. expired token)
      try {
        console.warn('[JwtAuthGuard] auth failure:', {
          error: err?.message || null,
          info: info && info.message ? info.message : info,
        })
      } catch (e) {
        // ignore logging errors
      }

      throw err || new UnauthorizedException(info?.message || 'Token inválido o expirado');
    }
    return user;
  }
}
