import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UserCreateDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsUrl()
  picture?: string;
}
