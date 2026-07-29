import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsString()
  @MaxLength(150)
  @Matches(/.*\S.*/, { message: 'İşletme adı boş olamaz.' })
  companyName: string;
}
