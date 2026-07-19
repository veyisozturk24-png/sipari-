import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.productsService.findAll(companyId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return this.productsService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, companyId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return this.productsService.remove(id, companyId);
  }
}
