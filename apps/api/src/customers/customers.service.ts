import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        companyId: dto.companyId,
        name: dto.name.trim(),
        phone: dto.phone?.trim() || null,
        email: dto.email?.trim().toLocaleLowerCase('tr-TR') || null,
        notes: dto.notes?.trim() || null,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: {
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, companyId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!customer) {
      throw new NotFoundException('Müşteri bulunamadı.');
    }

    return customer;
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateCustomerDto,
  ) {
    await this.findOne(id, companyId);

    return this.prisma.customer.update({
      where: {
        id,
      },
      data: {
        name: dto.name?.trim(),
        phone:
          dto.phone === undefined
            ? undefined
            : dto.phone.trim() || null,
        email:
          dto.email === undefined
            ? undefined
            : dto.email.trim().toLocaleLowerCase('tr-TR') || null,
        notes:
          dto.notes === undefined
            ? undefined
            : dto.notes.trim() || null,
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    await this.prisma.customer.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Müşteri silindi.',
    };
  }
}
