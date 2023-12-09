import * as bcrypt from 'bcrypt';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Mod } from './entities/mod.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SetNewPasswordDto } from './dto/set-new-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Mod)
    private readonly modRepository: Repository<Mod>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const username = createUserDto.username.trim();

    const mod = this.modRepository.create({ username });

    try {
      await this.modRepository.insert(mod);
      return mod;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  async setModPassword(setNewPasswordDto: SetNewPasswordDto) {
    const { username, newPassword } = setNewPasswordDto;
    if (newPassword.length < 4)
      throw new BadRequestException(
        'Password must be at least 4 characters long',
      );

    const mod = await this.modRepository.findOne({
      select: ['id', 'password', 'username'],
      where: { username },
    });

    if (!mod)
      throw new NotFoundException(`Mod with username '${username}' not found`);

    if (mod.password)
      throw new ForbiddenException(
        `Mod with username '${username}' already has a password`,
      );

    mod.password = bcrypt.hashSync(newPassword, 10);
    try {
      await this.modRepository.save(mod);
      return this.login({ username, password: newPassword });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const username = loginUserDto.username.trim();
    const mod = await this.modRepository.findOne({
      select: ['id', 'password', 'username'],
      where: { username },
    });

    if (!mod) throw new BadRequestException(`Invalid Credentials`);

    if (!mod.password)
      throw new BadRequestException({
        hasToSetPassword: true,
        message: `Mod with username '${username}' does not have a password`,
      });

    if (!bcrypt.compareSync(loginUserDto.password, mod.password)) {
      throw new BadRequestException(`Invalid Credentials`);
    }

    delete mod.password;
    const token = this.jwtService.sign({ modId: mod.id });
    return {
      message: 'Logged in successfully',
      statusCode: 200,
      token,
    };
  }

  async findAll() {
    return { data: await this.modRepository.find(), statusCode: 200 };
  }

  async deleteOne(id: number) {
    const mod = await this.modRepository.findOne({ where: { id } });
    if (!mod) throw new NotFoundException(`Mod with id '${id}' not found`);
    await this.modRepository.delete(mod);
    return { message: 'Mod deleted successfully', statusCode: 200 };
  }
}
