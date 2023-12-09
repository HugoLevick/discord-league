import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Delete,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Auth } from './decorators/auth.decorator';
import { RolesEnum } from './enums/roles.enum';
import { SetNewPasswordDto } from './dto/set-new-password.dto';
import { GetUser } from './decorators/get-user.decorator';
import { Mod } from './entities/mod.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Auth(RolesEnum.OWNER)
  @Get()
  getAllMods() {
    return this.authService.findAll();
  }

  @Auth(RolesEnum.OWNER)
  @HttpCode(201)
  @Post()
  register(@Body() createAuthDto: CreateUserDto) {
    return this.authService.register(createAuthDto);
  }

  @HttpCode(200)
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @HttpCode(200)
  @Post('setPassword')
  setPassword(@Body() setNewPasswordDto: SetNewPasswordDto) {
    return this.authService.setModPassword(setNewPasswordDto);
  }

  @Auth(RolesEnum.OWNER)
  @HttpCode(200)
  @Delete(':id')
  deleteMod(@Param('id', ParseIntPipe) id: number) {
    return this.authService.deleteOne(id);
  }

  @Auth()
  @Get('validate')
  validate(@GetUser() mod: Mod) {
    return mod;
  }
}
