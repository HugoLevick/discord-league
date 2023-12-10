import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  username: string;

  // @IsString()
  // @MinLength(4)
  // @MaxLength(60)
  // lastName: string;

  // @IsString()
  // @MinLength(4)
  // @MaxLength(60)
  // password: string;

  // @IsEmail()
  // email: string;
}
