import { ValidationPipe as NestValidationPipe, ValidationPipeOptions } from '@nestjs/common';

export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};

export class AppValidationPipe extends NestValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      ...validationPipeOptions,
      ...options,
    });
  }
}

