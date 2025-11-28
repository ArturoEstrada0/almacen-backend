import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
}
