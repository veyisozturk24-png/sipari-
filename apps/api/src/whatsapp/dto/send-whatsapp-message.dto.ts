import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendWhatsAppMessageDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  text: string;
}
