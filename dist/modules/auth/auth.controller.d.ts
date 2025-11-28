import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RequestPasswordResetDto, ResetPasswordDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
        access_token: string;
        refresh_token: string;
    }>;
    logout(authorization: string): Promise<{
        message: string;
    }>;
    requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto): Promise<{
        message: string;
    }>;
    resetPassword(authorization: string, resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getCurrentUser(authorization: string): Promise<import("@supabase/auth-js").User>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: import("@supabase/auth-js").User;
    }>;
}
