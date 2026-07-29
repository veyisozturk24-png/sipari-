import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyAccessGuard } from '../auth/company-access.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { ShipmentsService } from './shipments.service';

@Controller('shipments')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get()
  findAll(@Query('companyId', ParseUUIDPipe) companyId: string) {
    return this.shipmentsService.findAll(companyId);
  }

  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shipmentsService.updateStatus(id, companyId, dto.status);
  }
}
