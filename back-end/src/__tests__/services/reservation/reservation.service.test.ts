import { ReservationService } from '../../../services/reservation/reservation.service';
import { prismaMock } from '../../setup';
import { Prisma } from '@prisma/client';

describe('ReservationService', () => {
    describe('calculateTotalAmount', () => {
        it('should calculate correct amount for 3 nights', async () => {
            prismaMock.logement.findUnique.mockResolvedValue({
                pricePerNight: new Prisma.Decimal(100)
            } as any);

            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-04'); // 3 nights

            const total = await ReservationService.calculateTotalAmount('prop-1', startDate, endDate);

            expect(total).toBe(300);
        });
    });

    describe('createReservation', () => {
        const resData: any = {
            accommodationId: 'prop-1',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-02-05'),
            guestCount: 2,
        };

        it('should create a reservation if dates are available', async () => {
            // Mock availability check
            prismaMock.reservation.count.mockResolvedValue(0);
            prismaMock.disponibilite.count.mockResolvedValue(0); // For checkAvailability

            prismaMock.logement.findUnique.mockResolvedValue({
                id: 'prop-1',
                ownerId: 'owner-1',
                pricePerNight: new Prisma.Decimal(100),
                status: 'actif',
                capacity: 10,
                bookingMode: 'instant'
            } as any);

            prismaMock.reservation.create.mockResolvedValue({
                id: 'res-1',
                status: 'confirmee', // instant booking
                ...resData
            } as any);

            const result = await ReservationService.createReservation('tenant-1', resData);

            expect(result.id).toBe('res-1');
            expect(prismaMock.reservation.create).toHaveBeenCalled();
        });

        it('should throw ValidationError if dates are already booked', async () => {
            // Mock existing reservation to cause conflict
            prismaMock.logement.findUnique.mockResolvedValue({
                id: 'prop-1',
                ownerId: 'owner-1',
                pricePerNight: new Prisma.Decimal(100),
                status: 'actif',
                capacity: 10
            } as any);
            prismaMock.reservation.count.mockResolvedValue(1);

            await expect(ReservationService.createReservation('tenant-1', resData))
                .rejects.toThrow('The selected dates are not available. Please choose different dates.');
        });
    });

    describe('acceptReservation', () => {
        it('should update status to acceptee', async () => {
            const mockRes = {
                id: 'res-1',
                status: 'en_attente',
                accommodationId: 'prop-1',
                startDate: new Date(),
                endDate: new Date(),
                totalAmount: new Prisma.Decimal(100)
            };
            prismaMock.reservation.findUnique.mockResolvedValue(mockRes as any);
            prismaMock.reservation.update.mockResolvedValue({ ...mockRes, status: 'acceptee' } as any);

            // Mock DisponibiliteService
            const { DisponibiliteService } = require('../../../services/disponibilite');
            jest.spyOn(DisponibiliteService, 'autoBlockOnReservation').mockResolvedValue({} as any);

            const result = await ReservationService.acceptReservation('res-1');

            expect(result.status).toBe('acceptee');
            expect(prismaMock.reservation.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { status: 'acceptee' }
            }));
        });
    });
});
