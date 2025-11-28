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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const user_permissions_dto_1 = require("./dto/user-permissions.dto");
let UsersService = class UsersService {
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
    async findAll() {
        const { data, error } = await this.supabase.auth.admin.listUsers();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data.users.map((user) => ({
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || user.email,
            role: user.user_metadata?.role || 'viewer',
            permissions: user.user_metadata?.permissions || user_permissions_dto_1.DEFAULT_PERMISSIONS[user.user_metadata?.role || 'viewer'],
            isActive: !user.banned_until,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        }));
    }
    async findOne(id) {
        const { data, error } = await this.supabase.auth.admin.getUserById(id);
        if (error || !data.user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        const user = data.user;
        return {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || user.email,
            role: user.user_metadata?.role || 'viewer',
            permissions: user.user_metadata?.permissions || user_permissions_dto_1.DEFAULT_PERMISSIONS[user.user_metadata?.role || 'viewer'],
            isActive: !user.banned_until,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        };
    }
    async create(createUserDto) {
        const permissions = createUserDto.permissions || user_permissions_dto_1.DEFAULT_PERMISSIONS[createUserDto.role];
        const { data, error } = await this.supabase.auth.admin.createUser({
            email: createUserDto.email,
            password: createUserDto.password,
            email_confirm: true,
            user_metadata: {
                full_name: createUserDto.fullName,
                role: createUserDto.role,
                permissions: permissions,
            },
        });
        if (error) {
            if (error.message.includes('already registered')) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
            throw new common_1.BadRequestException(error.message);
        }
        const user = data.user;
        return {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name,
            role: user.user_metadata?.role,
            permissions: user.user_metadata?.permissions,
            isActive: !user.banned_until,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        };
    }
    async update(id, updateUserDto) {
        const updateData = {};
        if (updateUserDto.email) {
            updateData.email = updateUserDto.email;
        }
        if (updateUserDto.password) {
            updateData.password = updateUserDto.password;
        }
        if (updateUserDto.fullName || updateUserDto.role || updateUserDto.permissions) {
            updateData.user_metadata = {};
            if (updateUserDto.fullName) {
                updateData.user_metadata.full_name = updateUserDto.fullName;
            }
            if (updateUserDto.role) {
                updateData.user_metadata.role = updateUserDto.role;
                if (!updateUserDto.permissions) {
                    updateData.user_metadata.permissions = user_permissions_dto_1.DEFAULT_PERMISSIONS[updateUserDto.role];
                }
            }
            if (updateUserDto.permissions) {
                updateData.user_metadata.permissions = updateUserDto.permissions;
            }
        }
        const { data, error } = await this.supabase.auth.admin.updateUserById(id, updateData);
        if (error) {
            if (error.message.includes('not found')) {
                throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
            }
            if (error.message.includes('already registered')) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
            throw new common_1.BadRequestException(error.message);
        }
        const user = data.user;
        return {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name,
            role: user.user_metadata?.role,
            permissions: user.user_metadata?.permissions,
            isActive: !user.banned_until,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        };
    }
    async remove(id) {
        const { error } = await this.supabase.auth.admin.deleteUser(id);
        if (error) {
            if (error.message.includes('not found')) {
                throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
            }
            throw new common_1.BadRequestException(error.message);
        }
        return { message: 'Usuario eliminado exitosamente' };
    }
    async toggleActive(id) {
        const user = await this.findOne(id);
        const { data, error } = await this.supabase.auth.admin.updateUserById(id, {
            ban_duration: user.isActive ? '876000h' : 'none',
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        const updatedUser = data.user;
        return {
            id: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.user_metadata?.full_name,
            role: updatedUser.user_metadata?.role,
            permissions: updatedUser.user_metadata?.permissions,
            isActive: !updatedUser.banned_until,
            createdAt: updatedUser.created_at,
            updatedAt: updatedUser.updated_at,
        };
    }
    async updatePassword(id, currentPassword, newPassword) {
        const { data, error } = await this.supabase.auth.admin.updateUserById(id, {
            password: newPassword,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return { message: 'Contraseña actualizada exitosamente' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map