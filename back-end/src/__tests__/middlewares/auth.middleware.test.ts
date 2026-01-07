import { authenticateToken, authorize } from '../../middlewares/auth.middleware';
import { JWTService } from '../../services/auth';
import { PermissionLevel } from '../../types';
import { Request, Response, NextFunction } from 'express';

describe('Auth Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            headers: {},
            cookies: {},
        };
        mockResponse = {};
        nextFunction = jest.fn();
        jest.clearAllMocks();
        jest.restoreAllMocks(); // Ensure previous spies don't leak
    });

    describe('authenticateToken', () => {
        it('should call next if valid token is provided in header', async () => {
            mockRequest.headers = { authorization: 'Bearer valid-token' };
            const mockUser = { id: '1', email: 't@t.com' };
            jest.spyOn(JWTService, 'verifyAccessToken').mockReturnValue(mockUser as any);
            jest.spyOn(JWTService, 'extractTokenFromHeader').mockReturnValue('valid-token');

            await authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith();
            expect((mockRequest as any).user).toEqual(mockUser);
        });

        it('should call next with error if token is missing', async () => {
            await authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
            expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Access token is required'
            }));
        });
    });

    describe('authorize', () => {
        it('should call next if user has required permission', () => {
            (mockRequest as any).user = { userType: 'admin' };
            const middleware = authorize(PermissionLevel.ADMIN);

            middleware(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should call next with error if user has insufficient permission', () => {
            (mockRequest as any).user = { userType: 'locataire' };
            const middleware = authorize(PermissionLevel.OWNER);

            middleware(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
            expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Insufficient permissions'
            }));
        });
    });
});
