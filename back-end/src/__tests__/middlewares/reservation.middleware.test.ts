import { verifyReservationAccess, verifyPropertyOwnerForReservation, verifyReservationTenant } from '../../middlewares/reservation.middleware';
import { prismaMock } from '../setup';
import { Request, Response, NextFunction } from 'express';
import { AuthorizationError, NotFoundError } from '../../types';

describe('Reservation Middleware', () => {
    let mockRequest: any;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            params: { id: 'res-1' },
            user: { id: 'user-1', userType: 'locataire' }
        };
        mockResponse = {};
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    describe('verifyReservationAccess', () => {
        it('should call next() if user is admin', async () => {
            mockRequest.user.userType = 'admin';
            await verifyReservationAccess(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should call next() if user is the tenant', async () => {
            prismaMock.reservation.findUnique.mockResolvedValue({
                id: 'res-1',
                tenantId: 'user-1',
                accommodation: { ownerId: 'user-owner' }
            } as any);

            await verifyReservationAccess(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should call next() if user is the property owner', async () => {
            mockRequest.user.id = 'user-owner';
            mockRequest.user.userType = 'proprietaire';
            prismaMock.reservation.findUnique.mockResolvedValue({
                id: 'res-1',
                tenantId: 'user-tenant',
                accommodation: { ownerId: 'user-owner' }
            } as any);

            await verifyReservationAccess(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should throw AuthorizationError if user is neither tenant nor owner', async () => {
            prismaMock.reservation.findUnique.mockResolvedValue({
                id: 'res-1',
                tenantId: 'user-2',
                accommodation: { ownerId: 'user-3' }
            } as any);

            await verifyReservationAccess(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthorizationError));
        });
    });

    describe('verifyPropertyOwnerForReservation', () => {
        it('should call next() if user is the owner', async () => {
            mockRequest.user.id = 'user-owner';
            prismaMock.reservation.findUnique.mockResolvedValue({
                id: 'res-1',
                accommodation: { ownerId: 'user-owner' }
            } as any);

            await verifyPropertyOwnerForReservation(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should throw AuthorizationError if user is not the owner', async () => {
            prismaMock.reservation.findUnique.mockResolvedValue({
                id: 'res-1',
                accommodation: { ownerId: 'user-other' }
            } as any);

            await verifyPropertyOwnerForReservation(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthorizationError));
        });
    });

    describe('verifyReservationTenant', () => {
        it('should call next() if user is the tenant', async () => {
            prismaMock.reservation.findUnique.mockResolvedValue({
                id: 'res-1',
                tenantId: 'user-1'
            } as any);

            await verifyReservationTenant(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith();
        });

        it('should throw AuthorizationError if user is not the tenant', async () => {
            prismaMock.reservation.findUnique.mockResolvedValue({
                id: 'res-1',
                tenantId: 'user-other'
            } as any);

            await verifyReservationTenant(mockRequest, mockResponse as Response, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthorizationError));
        });
    });
});
