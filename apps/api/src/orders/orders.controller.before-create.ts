import {
  Controller,
  Get,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query('companyId', ParseUUIDPipe) companyId: string,
  ) {
    return this.ordersService.findAll(companyId);
  }
}
