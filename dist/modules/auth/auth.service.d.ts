import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto, RequestPasswordResetDto, ResetPasswordDto } from './dto';
export declare class AuthService {
    private configService;
    private supabase;
    constructor(configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        user: import("@supabase/supabase-js").AuthUser;
        session: import("@supabase/supabase-js").AuthSession;
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: import("@supabase/supabase-js").AuthUser;
        session: import("@supabase/supabase-js").AuthSession;
        access_token: string;
        refresh_token: string;
    }>;
    logout(accessToken: string): Promise<{
        message: string;
    }>;
    requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto): Promise<{
        message: string;
    }>;
    resetPassword(accessToken: string, resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getCurrentUser(accessToken: string): Promise<import("@supabase/supabase-js").AuthUser>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: import("@supabase/supabase-js").AuthUser;
    }>;
    verifyToken(token: string): Promise<import("@supabase/supabase-js").AuthUser>;
}
