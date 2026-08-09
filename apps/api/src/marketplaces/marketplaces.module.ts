import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MarketplacesController } from './marketplaces.controller';
import { MarketplacesService } from './marketplaces.service';

@Module({
  imports: [AuthModule],
  controllers: [MarketplacesController],
  providers: [MarketplacesService],
})
export class MarketplacesModule {}
