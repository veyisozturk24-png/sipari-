import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class ConfigureInstagramDto {
  @IsUUID()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  instagramAccountId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  displayName: string;
}
