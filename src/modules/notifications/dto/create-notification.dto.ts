import { IsString, IsEnum, IsOptional, IsUUID, IsObject, IsDateString, MaxLength } from 'class-validator';
import { NotificationType, NotificationPriority, NotificationCategory } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsString()
  @MaxLength(500)
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory;

  @IsUUID()
  userId: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  actionUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  actionLabel?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}
