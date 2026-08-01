import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CompanyAccessGuard } from '../auth/company-access.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigureInstagramDto } from './dto/configure-instagram.dto';
import { SendInstagramMessageDto } from './dto/send-instagram-message.dto';
import { InstagramService } from './instagram.service';

@Controller('instagram')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class InstagramController {
  constructor(private readonly instagram: InstagramService) {}

  @Get('channels')
  findChannels(@Query('companyId') companyId: string) {
    return this.instagram.findChannels(companyId);
  }

  @Get('conversations')
  findConversations(@Query('companyId') companyId: string) {
    return this.instagram.findConversations(companyId);
  }

  @Post('channels')
  configureChannel(@Body() dto: ConfigureInstagramDto) {
    return this.instagram.configureChannel(dto);
  }

  @Post('messages')
  sendMessage(@Body() dto: SendInstagramMessageDto) {
    return this.instagram.sendMessage(dto);
  }
}
