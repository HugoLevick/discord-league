import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { UnauthorizedException } from '@nestjs/common';
import { Mod } from '../entities/mod.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    const req = context.switchToHttp().getRequest();

    const mod: Mod = req.user;
    if (!mod) throw new UnauthorizedException();

    if (validRoles.length === 0) return true;

    if (!validRoles.includes(mod.role))
      throw new ForbiddenException('Needs role');

    return true;
  }
}
