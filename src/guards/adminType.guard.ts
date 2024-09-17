import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminTypeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if (user.isAdmin === false && user.type !== '') {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }

    return true; // If conditions pass, allow access
  }
}
