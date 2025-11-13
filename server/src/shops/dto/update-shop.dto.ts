import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateShopDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  name?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  hours?: string;
}

