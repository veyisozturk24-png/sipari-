import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class ConfigureWhatsAppDto {
  @IsUUID()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  phoneNumberId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  displayName: string;
}
