import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CompanyAccessGuard } from './company-access.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, CompanyAccessGuard],
  exports: [JwtModule, JwtAuthGuard, CompanyAccessGuard],
})
export class AuthModule {}
