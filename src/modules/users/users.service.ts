import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DEFAULT_PERMISSIONS } from './dto/user-permissions.dto';

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: any;
  created_at: string;
  updated_at?: string;
  banned_until?: string;
  [key: string]: any;
}

@Injectable()
export class UsersService {
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

  async findAll() {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data.users.map((user: SupabaseUser) => ({
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.email,
      role: user.user_metadata?.role || 'viewer',
      permissions: user.user_metadata?.permissions || DEFAULT_PERMISSIONS[user.user_metadata?.role || 'viewer'],
      isActive: !user.banned_until,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(id);

    if (error || !data.user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const user = data.user as SupabaseUser;

    return {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.email,
      role: user.user_metadata?.role || 'viewer',
      permissions: user.user_metadata?.permissions || DEFAULT_PERMISSIONS[user.user_metadata?.role || 'viewer'],
      isActive: !user.banned_until,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async create(createUserDto: CreateUserDto) {
    // Si no se proporcionan permisos personalizados, usar los permisos por defecto del rol
    const permissions = createUserDto.permissions || DEFAULT_PERMISSIONS[createUserDto.role];

    const { data, error } = await this.supabase.auth.admin.createUser({
      email: createUserDto.email,
      password: createUserDto.password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: createUserDto.fullName,
        role: createUserDto.role,
        permissions: permissions,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new ConflictException('El email ya está registrado');
      }
      throw new BadRequestException(error.message);
    }

    const user = data.user as SupabaseUser;

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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updateData: any = {};

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
        // Si se cambia el rol pero no se proporcionan permisos personalizados, usar los del nuevo rol
        if (!updateUserDto.permissions) {
          updateData.user_metadata.permissions = DEFAULT_PERMISSIONS[updateUserDto.role];
        }
      }
      
      if (updateUserDto.permissions) {
        updateData.user_metadata.permissions = updateUserDto.permissions;
      }
    }

    const { data, error } = await this.supabase.auth.admin.updateUserById(id, updateData);

    if (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      if (error.message.includes('already registered')) {
        throw new ConflictException('El email ya está registrado');
      }
      throw new BadRequestException(error.message);
    }

    const user = data.user as SupabaseUser;

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

  async remove(id: string) {
    const { error } = await this.supabase.auth.admin.deleteUser(id);

    if (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      throw new BadRequestException(error.message);
    }

    return { message: 'Usuario eliminado exitosamente' };
  }

  async toggleActive(id: string) {
    // Primero obtener el usuario para saber su estado actual
    const user = await this.findOne(id);

    const { data, error } = await this.supabase.auth.admin.updateUserById(id, {
      ban_duration: user.isActive ? '876000h' : 'none', // Si está activo, banear por 100 años, sino desbanear
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const updatedUser = data.user as SupabaseUser;

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

  async updatePassword(id: string, currentPassword: string, newPassword: string) {
    // Con Supabase Admin API no necesitamos la contraseña actual
    // Solo actualizamos directamente
    const { data, error } = await this.supabase.auth.admin.updateUserById(id, {
      password: newPassword,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: 'Contraseña actualizada exitosamente' };
  }
}
