import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserPermissionsDto } from './user-permissions.dto';

export class UpdateUserDto {
  @ApiProperty({ example: 'usuario@ejemplo.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiProperty({ example: 'Password123!', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @ApiProperty({ example: 'Juan Pérez', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ 
    example: 'admin',
    enum: ['admin', 'manager', 'operator', 'viewer'],
    description: 'Rol del usuario en el sistema',
    required: false
  })
  @IsOptional()
  @IsEnum(['admin', 'manager', 'operator', 'viewer'], {
    message: 'El rol debe ser admin, manager, operator o viewer'
  })
  role?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ 
    type: UserPermissionsDto,
    required: false,
    description: 'Actualizar permisos personalizados del usuario'
  })
  @ValidateNested()
  @Type(() => UserPermissionsDto)
  @IsOptional()
  permissions?: UserPermissionsDto;
}
