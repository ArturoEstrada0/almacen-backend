import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoginDto, RegisterDto, RequestPasswordResetDto, ResetPasswordDto } from './dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.serviceRoleKey');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Registrar un nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const { email, password, fullName } = registerDto;

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          role: 'viewer', // Rol por defecto para usuarios registrados
        },
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      user: data.user,
      session: data.session,
      message: 'Usuario registrado exitosamente. Revisa tu correo para confirmar tu cuenta.',
    };
  }

  /**
   * Iniciar sesión
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      user: data.user,
      session: data.session,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }

  /**
   * Cerrar sesión
   */
  async logout(accessToken: string) {
    const { error } = await this.supabase.auth.admin.signOut(accessToken);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: 'Sesión cerrada exitosamente' };
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;

    const redirectUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}/auth/reset-password`,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña',
    };
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(accessToken: string, resetPasswordDto: ResetPasswordDto) {
    const { password } = resetPasswordDto;

    // Verificar el token y actualizar la contraseña
    const { error } = await this.supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(accessToken: string) {
    const { data, error } = await this.supabase.auth.getUser(accessToken);

    if (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    return data.user;
  }

  /**
   * Refrescar token
   */
  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }

  /**
   * Verificar token JWT
   */
  async verifyToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error) {
      return null;
    }

    return data.user;
  }
}
