import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private configService;
    private supabase;
    constructor(configService: ConfigService);
    findAll(): Promise<{
        id: string;
        email: string;
        fullName: any;
        role: any;
        permissions: any;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        fullName: any;
        role: any;
        permissions: any;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        fullName: any;
        role: any;
        permissions: any;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        fullName: any;
        role: any;
        permissions: any;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<{
        id: string;
        email: string;
        fullName: any;
        role: any;
        permissions: any;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    updatePassword(id: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
