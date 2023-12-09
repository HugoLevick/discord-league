import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class UploadStatsDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => StatsDto)
  stats: StatsDto[];
}

class StatsDto {
  @IsNumber()
  damage: number;

  @IsNumber()
  downs: number;

  @IsNumber()
  revives: number;

  @IsNumber()
  @IsOptional()
  bombs?: number;

  @IsNumber()
  @IsOptional()
  hillTime?: number;

  @IsBoolean()
  won: boolean;
}
