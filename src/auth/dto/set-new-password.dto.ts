import { IsString } from 'class-validator';

export class SetNewPasswordDto {
  @IsString()
  username: string;

  @IsString()
  newPassword: string;
}
