import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminSosGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user']

    // Check if the user is admin and type is not "SOS"
    if (user.isAdmin === true && user.type !== 'SOS') {
      throw new ForbiddenException({ error: 'Access denied' });
    }

    return true; // Allow access if conditions are not met
  }
}
