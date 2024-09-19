import { SetMetadata } from '@nestjs/common';

export const ALLOWED_TYPES_KEY = 'allowedTypes';
export const AllowedTypes = (...types: string[]) => SetMetadata(ALLOWED_TYPES_KEY, types);
