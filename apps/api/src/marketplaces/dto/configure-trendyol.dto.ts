import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class ConfigureTrendyolDto {
  @IsUUID()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  merchantId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  apiSecret: string;
}
