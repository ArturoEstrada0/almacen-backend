import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('supabase.jwtSecret'),
    });
  }

  async validate(payload: any) {
    // El payload contiene la información decodificada del JWT.
    // En Supabase, payload.role suele ser "authenticated"; el rol de negocio
    // normalmente vive en app_metadata o user_metadata.
    const metadataRole = payload?.app_metadata?.role || payload?.user_metadata?.role

    return {
      userId: payload.sub,
      email: payload.email,
      role: metadataRole || payload.role,
      app_metadata: payload.app_metadata,
      user_metadata: payload.user_metadata,
      jwt_role: payload.role,
    };
  }
}
