import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ModulePermissions {
  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  create?: boolean = false;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  read?: boolean = false;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  update?: boolean = false;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  delete?: boolean = false;
}

export class UserPermissionsDto {
  @ApiProperty({ type: ModulePermissions, required: false })
  @ValidateNested()
  @Type(() => ModulePermissions)
  @IsOptional()
  products?: ModulePermissions;

  @ApiProperty({ type: ModulePermissions, required: false })
  @ValidateNested()
  @Type(() => ModulePermissions)
  @IsOptional()
  inventory?: ModulePermissions;

  @ApiProperty({ type: ModulePermissions, required: false })
  @ValidateNested()
  @Type(() => ModulePermissions)
  @IsOptional()
  movements?: ModulePermissions;

  @ApiProperty({ type: ModulePermissions, required: false })
  @ValidateNested()
  @Type(() => ModulePermissions)
  @IsOptional()
  suppliers?: ModulePermissions;

  @ApiProperty({ type: ModulePermissions, required: false })
  @ValidateNested()
  @Type(() => ModulePermissions)
  @IsOptional()
  purchaseOrders?: ModulePermissions;

  @ApiProperty({ type: ModulePermissions, required: false })
  @ValidateNested()
  @Type(() => ModulePermissions)
  @IsOptional()
  warehouses?: ModulePermissions;

  @ApiProperty({ type: ModulePermissions, required: false })
  @ValidateNested()
  @Type(() => ModulePermissions)
  @IsOptional()
  producers?: ModulePermissions;

  @ApiProperty({ type: ModulePermissions, required: false })
  @ValidateNested()
  @Type(() => ModulePermissions)
  @IsOptional()
  reports?: ModulePermissions;

  @ApiProperty({ type: ModulePermissions, required: false })
  @ValidateNested()
  @Type(() => ModulePermissions)
  @IsOptional()
  users?: ModulePermissions;
}

// Permisos por defecto según el rol
export const DEFAULT_PERMISSIONS: Record<string, UserPermissionsDto> = {
  admin: {
    products: { create: true, read: true, update: true, delete: true },
    inventory: { create: true, read: true, update: true, delete: true },
    movements: { create: true, read: true, update: true, delete: true },
    suppliers: { create: true, read: true, update: true, delete: true },
    purchaseOrders: { create: true, read: true, update: true, delete: true },
    warehouses: { create: true, read: true, update: true, delete: true },
    producers: { create: true, read: true, update: true, delete: true },
    reports: { create: true, read: true, update: true, delete: true },
    users: { create: true, read: true, update: true, delete: true },
  },
  manager: {
    products: { create: true, read: true, update: true, delete: false },
    inventory: { create: true, read: true, update: true, delete: false },
    movements: { create: true, read: true, update: true, delete: false },
    suppliers: { create: true, read: true, update: true, delete: false },
    purchaseOrders: { create: true, read: true, update: true, delete: false },
    warehouses: { create: false, read: true, update: false, delete: false },
    producers: { create: true, read: true, update: true, delete: false },
    reports: { create: true, read: true, update: false, delete: false },
    users: { create: false, read: true, update: false, delete: false },
  },
  operator: {
    products: { create: false, read: true, update: true, delete: false },
    inventory: { create: false, read: true, update: true, delete: false },
    movements: { create: true, read: true, update: false, delete: false },
    suppliers: { create: false, read: true, update: false, delete: false },
    purchaseOrders: { create: false, read: true, update: true, delete: false },
    warehouses: { create: false, read: true, update: false, delete: false },
    producers: { create: false, read: true, update: true, delete: false },
    reports: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
  },
  viewer: {
    products: { create: false, read: true, update: false, delete: false },
    inventory: { create: false, read: true, update: false, delete: false },
    movements: { create: false, read: true, update: false, delete: false },
    suppliers: { create: false, read: true, update: false, delete: false },
    purchaseOrders: { create: false, read: true, update: false, delete: false },
    warehouses: { create: false, read: true, update: false, delete: false },
    producers: { create: false, read: true, update: false, delete: false },
    reports: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
  },
};
