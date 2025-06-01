import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class DenyRolesGuard implements CanActivate {
  constructor(private deniedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (this.deniedRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied for this role');
    }

    return true;
  }
}
