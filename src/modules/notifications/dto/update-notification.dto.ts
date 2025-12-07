import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @IsBoolean()
  @IsOptional()
  read?: boolean;
}

export class BulkUpdateNotificationDto {
  @IsBoolean()
  @IsOptional()
  read?: boolean;
}
