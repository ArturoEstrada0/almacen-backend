import { UserPermissionsDto } from './user-permissions.dto';
export declare class CreateUserDto {
    email: string;
    password: string;
    fullName: string;
    role: string;
    isActive?: boolean;
    permissions?: UserPermissionsDto;
}
