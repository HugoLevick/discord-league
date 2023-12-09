import { IsString } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  discordId: string;

  @IsString()
  name: string;
}
