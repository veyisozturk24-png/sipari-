import { Controller, Get, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { CompanyAccessGuard } from '../auth/company-access.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@Query('companyId', ParseUUIDPipe) companyId: string) {
    return this.dashboardService.getDashboard(companyId);
  }
}
