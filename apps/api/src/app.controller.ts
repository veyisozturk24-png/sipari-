
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getApiInfo() {
    return {
      name: 'Siparİş API',
      status: 'running',
      version: '0.1.0',
    };
  }

  @Get('health')
  async healthCheck() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
