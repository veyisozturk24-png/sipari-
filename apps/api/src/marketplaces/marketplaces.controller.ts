import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CompanyAccessGuard } from '../auth/company-access.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigureTrendyolDto } from './dto/configure-trendyol.dto';
import { MarketplacesService } from './marketplaces.service';

@Controller('marketplaces')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class MarketplacesController {
  constructor(private readonly marketplaces: MarketplacesService) {}

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.marketplaces.findAll(companyId);
  }

  @Post('trendyol')
  configureTrendyol(@Body() dto: ConfigureTrendyolDto) {
    return this.marketplaces.configureTrendyol(dto);
  }
}
