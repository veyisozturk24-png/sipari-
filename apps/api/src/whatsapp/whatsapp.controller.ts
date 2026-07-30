import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyAccessGuard } from '../auth/company-access.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigureWhatsAppDto } from './dto/configure-whatsapp.dto';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Get('channels')
  findChannels(@Query('companyId') companyId: string) {
    return this.whatsAppService.findChannels(companyId);
  }

  @Post('channels')
  configureChannel(@Body() dto: ConfigureWhatsAppDto) {
    return this.whatsAppService.configureChannel(dto);
  }
}
