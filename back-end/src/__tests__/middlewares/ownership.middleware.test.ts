import { verifyPropertyOwnership, requireOwnerRole } from '../../middlewares/ownership.middleware';
import { prismaMock } from '../setup';
import { Request, Response, NextFunction } from 'express';
import { AuthorizationError, NotFoundError } from '../../types';

describe('Ownership Middleware', () => {
    let mockRequest: any;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            params: { id: 'prop-1' },
            user: { id: 'user-1', userType: 'proprietaire' }
        };
        mockResponse = {};
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    describe('verifyPropertyOwnership', () => {
        it('should call next() if user is admin', async () => {
            mockRequest.user.userType = 'admin';

            await verifyPropertyOwnership(mockRequest, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should call next() if user is the owner', async () => {
            prismaMock.logement.findUnique.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1' } as any);

            await verifyPropertyOwnership(mockRequest, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should throw AuthorizationError if user is not the owner', async () => {
            prismaMock.logement.findUnique.mockResolvedValue({ id: 'prop-1', ownerId: 'user-2' } as any);

            await verifyPropertyOwnership(mockRequest, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthorizationError));
        });

        it('should throw NotFoundError if property does not exist', async () => {
            prismaMock.logement.findUnique.mockResolvedValue(null);

            await verifyPropertyOwnership(mockRequest, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });

    describe('requireOwnerRole', () => {
        it('should call next() if user is proprietaire', () => {
            requireOwnerRole(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should call next() if user is admin', () => {
            mockRequest.user.userType = 'admin';
            requireOwnerRole(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should throw AuthorizationError if user is locataire', () => {
            mockRequest.user.userType = 'locataire';
            requireOwnerRole(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthorizationError));
        });
    });
});
