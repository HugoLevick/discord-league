import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GetStatsDto {
  @IsString()
  discordId: string;

  @IsBoolean()
  @IsOptional()
  all?: boolean;
}
