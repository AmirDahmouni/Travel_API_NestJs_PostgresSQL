import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminTravGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    // Check if user is admin and type is not "ADMIN_TRAV"
    if (user.isAdmin === true && user.type !== "ADMIN_TRAV") {
      throw new ForbiddenException({ error: 'Access denied' });
    }

    return true; // If conditions pass, allow access
  }
}
