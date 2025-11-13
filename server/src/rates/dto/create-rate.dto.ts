import { IsString, IsNumber, IsNotEmpty, Length, Min } from 'class-validator';

export class CreateRateDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  fromCurrency: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  toCurrency: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  buyRate: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  sellRate: number;
}

