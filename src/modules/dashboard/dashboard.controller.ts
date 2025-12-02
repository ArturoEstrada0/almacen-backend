import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Obtener KPIs del dashboard' })
  @ApiResponse({ status: 200, description: 'KPIs obtenidos exitosamente' })
  async getKPIs() {
    return this.dashboardService.getKPIs();
  }

  @Get('profit-report')
  @ApiOperation({ summary: 'Obtener reporte de utilidades reales' })
  @ApiResponse({ status: 200, description: 'Reporte de utilidades generado' })
  async getProfitReport() {
    return this.dashboardService.getProfitReport();
  }
}
