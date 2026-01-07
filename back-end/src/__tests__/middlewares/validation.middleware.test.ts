import { validateRequest } from '../../middlewares/validation.middleware';
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../types';

describe('Validation Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            body: {}
        };
        mockResponse = {};
        nextFunction = jest.fn();
    });

    const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().min(18)
    });

    it('should call next() if validation passes', () => {
        mockRequest.body = { name: 'John', age: 25 };
        const middleware = validateRequest(schema);

        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call next(error) if validation fails', () => {
        mockRequest.body = { name: 'John', age: 10 };
        const middleware = validateRequest(schema);

        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = (nextFunction as jest.Mock).mock.calls[0][0];
        expect(error.message).toBe('Validation failed');
        expect(error.details).toBeDefined();
        expect(error.details[0].field).toBe('age');
    });

    it('should include all validation errors in details', () => {
        mockRequest.body = { age: 10 }; // Missing name, age too low
        const middleware = validateRequest(schema);

        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        const error = (nextFunction as jest.Mock).mock.calls[0][0];
        expect(error.details).toHaveLength(2);
    });
});
