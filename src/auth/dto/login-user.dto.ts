import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  username: string;

  @IsString()
  @MaxLength(256)
  password?: string;
}
