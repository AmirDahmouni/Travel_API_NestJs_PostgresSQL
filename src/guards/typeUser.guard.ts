import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ALLOWED_TYPES_KEY } from 'src/decorators/allowed-types.decorator';

@Injectable()
export class AdminTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    // Get the allowed types from metadata
    const allowedTypes = this.reflector.getAllAndOverride<string[]>(ALLOWED_TYPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowedTypes) {
      return true;
    }

    // Check if user is admin and their type matches the allowed types
    if (user.isAdmin === true && !allowedTypes.includes(user.type) ||
      user.isAdmin === false && !allowedTypes.includes(user.type)) {
      throw new ForbiddenException({ error: 'Access denied' });
    }

    return true; // Allow access if user type matches
  }
}
