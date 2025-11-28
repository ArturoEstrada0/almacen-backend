"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let AuthService = class AuthService {
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('supabase.url');
        const supabaseKey = this.configService.get('supabase.serviceRoleKey');
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration is missing');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    async register(registerDto) {
        const { email, password, fullName } = registerDto;
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName || email.split('@')[0],
                    role: 'viewer',
                },
            },
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return {
            user: data.user,
            session: data.session,
            message: 'Usuario registrado exitosamente. Revisa tu correo para confirmar tu cuenta.',
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        return {
            user: data.user,
            session: data.session,
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
        };
    }
    async logout(accessToken) {
        const { error } = await this.supabase.auth.admin.signOut(accessToken);
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return { message: 'Sesión cerrada exitosamente' };
    }
    async requestPasswordReset(requestPasswordResetDto) {
        const { email } = requestPasswordResetDto;
        const redirectUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${redirectUrl}/auth/reset-password`,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return {
            message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña',
        };
    }
    async resetPassword(accessToken, resetPasswordDto) {
        const { password } = resetPasswordDto;
        const { error } = await this.supabase.auth.updateUser({
            password,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return {
            message: 'Contraseña actualizada exitosamente',
        };
    }
    async getCurrentUser(accessToken) {
        const { data, error } = await this.supabase.auth.getUser(accessToken);
        if (error) {
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
        return data.user;
    }
    async refreshToken(refreshToken) {
        const { data, error } = await this.supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });
        if (error) {
            throw new common_1.UnauthorizedException('Token de refresco inválido');
        }
        return {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
        };
    }
    async verifyToken(token) {
        const { data, error } = await this.supabase.auth.getUser(token);
        if (error) {
            return null;
        }
        return data.user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map