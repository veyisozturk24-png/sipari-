import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  companyId: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerNote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  internalNote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  shippingName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingDistrict?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shippingAddress?: string;
}
