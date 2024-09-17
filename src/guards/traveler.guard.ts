import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminTravelerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user']

    // Check if user is admin and type is not "TRAVELER"
    if (user.isAdmin === true && user.type !== 'TRAVELER') {
      throw new ForbiddenException({ error: 'Access denied' });
    }

    return true; // If conditions are not met, allow access
  }
}
