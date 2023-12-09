import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { AuthJwtPayload } from '../interfaces/jwt-payload.interface';
import { Mod } from '../entities/mod.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Mod)
    private readonly modRepository: Repository<Mod>,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: AuthJwtPayload): Promise<Mod> {
    const { modId } = payload;

    if (!modId) throw new UnauthorizedException('Token not valid');

    const mod = await this.modRepository.findOne({ where: { id: modId } });

    if (!mod) throw new UnauthorizedException('Token not valid');

    return mod;
  }
}
