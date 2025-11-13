import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class RegisterShopDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  shopName: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  hours?: string;
}

