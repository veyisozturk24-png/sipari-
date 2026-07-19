import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        companyId_sku: {
          companyId: dto.companyId,
          sku: dto.sku,
        },
      },
    });

    if (existingProduct) {
      throw new ConflictException('Bu SKU ile kayıtlı bir ürün zaten var.');
    }

    return this.prisma.product.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        price: dto.price,
        stock: dto.stock ?? 0,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.product.findMany({
      where: {
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, companyId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı.');
    }

    return product;
  }

  async update(id: string, companyId: string, dto: UpdateProductDto) {
    await this.findOne(id, companyId);

    if (dto.sku) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          companyId,
          sku: dto.sku,
          NOT: {
            id,
          },
        },
      });

      if (existingProduct) {
        throw new ConflictException('Bu SKU başka bir üründe kullanılıyor.');
      }
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        category: dto.category,
        criticalStock: dto.criticalStock,
        emoji: dto.emoji,
        price: dto.price,
        stock: dto.stock,
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    await this.prisma.product.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Ürün silindi.',
    };
  }
}
