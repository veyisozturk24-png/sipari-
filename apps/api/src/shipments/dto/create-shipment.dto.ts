import { IsEnum, IsString, IsUUID, MaxLength } from 'class-validator';
import { ShippingCarrier } from '../../generated/prisma/enums';

export class CreateShipmentDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  orderId: string;

  @IsEnum(ShippingCarrier)
  carrier: ShippingCarrier;

  @IsString()
  @MaxLength(100)
  trackingNumber: string;
}
