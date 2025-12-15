import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray } from 'class-validator';

export class SendQuotationEmailDto {
  @ApiProperty({ 
    example: ['supplier-uuid-1', 'supplier-uuid-2'],
    description: 'IDs de proveedores a los que enviar el correo'
  })
  @IsArray()
  @IsUUID('4', { each: true })
  supplierIds: string[];
}
