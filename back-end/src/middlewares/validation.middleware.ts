import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../types';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      const customError = new ValidationError(
        'Validation failed',
        validationErrors[0]?.field
      );

      // Add detailed errors to the error object
      (customError as any).details = validationErrors;

      next(customError);
      return;
    }

    next();
  };
};

