import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminVisitorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user']

    // Check if user is admin and type is not "VISITOR"
    if (user.isAdmin === true && user.type !== 'VISITOR') {
      throw new ForbiddenException({ error: 'Access denied' });
    }

    return true; // Allow access if the conditions are not met
  }
}
