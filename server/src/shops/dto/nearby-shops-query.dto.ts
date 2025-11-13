import { IsNumber, IsString, IsOptional, Min, Max, Length, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyShopsQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(20)
  radius?: number; // in kilometers, default 5, max 20

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  fromCurrency: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  toCurrency: string;
}

