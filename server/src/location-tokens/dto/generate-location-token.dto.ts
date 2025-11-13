import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class GenerateLocationTokenDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  expirationDays?: number;
}

