import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    // Override userId with authenticated user
    createNotificationDto.userId = req.user.id;
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll(@Request() req, @Query() query: QueryNotificationDto) {
    return this.notificationsService.findAll(req.user.id, query);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.notificationsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Request() req,
  ) {
    return this.notificationsService.update(id, req.user.id, updateNotificationDto);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch(':id/unread')
  @HttpCode(HttpStatus.OK)
  markAsUnread(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsUnread(id, req.user.id);
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.notificationsService.remove(id, req.user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  removeAll(@Request() req) {
    return this.notificationsService.removeAll(req.user.id);
  }

  @Delete('read/all')
  @HttpCode(HttpStatus.OK)
  removeReadNotifications(@Request() req) {
    return this.notificationsService.removeReadNotifications(req.user.id);
  }
}
