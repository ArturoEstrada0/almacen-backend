import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsBoolean, IsEnum, Min, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class SupplierResponseItemDto {
  @ApiProperty({ example: 'quotation-item-uuid' })
  @IsUUID()
  quotationItemId: string;

  @ApiProperty({ example: 150.50 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'MXN', enum: ['MXN', 'USD'] })
  @IsEnum(['MXN', 'USD'])
  @IsOptional()
  currency?: 'MXN' | 'USD';

  @ApiProperty({ example: 7, description: 'Días de entrega estimados' })
  @IsNumber()
  @IsOptional()
  leadTimeDays?: number;

  @ApiProperty({ example: 'Precio especial por volumen' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: true, description: 'Si el producto está disponible' })
  @IsBoolean()
  @IsOptional()
  available?: boolean;
}

export class SubmitSupplierResponseDto {
  @ApiProperty({ type: [SupplierResponseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierResponseItemDto)
  items: SupplierResponseItemDto[];

  @ApiProperty({ example: 'Cotización válida por 30 días' })
  @IsString()
  @IsOptional()
  generalNotes?: string;
}
