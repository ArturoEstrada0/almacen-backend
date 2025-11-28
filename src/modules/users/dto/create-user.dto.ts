import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserPermissionsDto } from './user-permissions.dto';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  fullName: string;

  @ApiProperty({ 
    example: 'admin',
    enum: ['admin', 'manager', 'operator', 'viewer'],
    description: 'Rol del usuario en el sistema'
  })
  @IsEnum(['admin', 'manager', 'operator', 'viewer'], {
    message: 'El rol debe ser admin, manager, operator o viewer'
  })
  role: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    type: UserPermissionsDto,
    required: false,
    description: 'Permisos personalizados del usuario. Si no se especifica, se usan los permisos por defecto del rol.'
  })
  @ValidateNested()
  @Type(() => UserPermissionsDto)
  @IsOptional()
  permissions?: UserPermissionsDto;
}
