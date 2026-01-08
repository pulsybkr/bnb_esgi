import { createReservationSchema, updateReservationStatusSchema, cancelReservationSchema } from '../../utils/validation/reservation.validation';

describe('Reservation Validation', () => {
    describe('createReservationSchema', () => {
        const validReservation = {
            accommodationId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
            startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            endDate: new Date(Date.now() + 86400000 * 2).toISOString(), // Day after tomorrow
            guestCount: 2,
            tenantMessage: 'Looking forward to our stay!'
        };

        it('should validate a correct reservation object', () => {
            const { error } = createReservationSchema.validate(validReservation);
            expect(error).toBeUndefined();
        });

        it('should fail if accommodationId is not a UUID', () => {
            const { error } = createReservationSchema.validate({ ...validReservation, accommodationId: 'invalid-id' });
            expect(error).toBeDefined();
        });

        it('should fail if startDate is in the past', () => {
            const pastDate = new Date(Date.now() - 86400000).toISOString();
            const { error } = createReservationSchema.validate({ ...validReservation, startDate: pastDate });
            expect(error).toBeDefined();
        });

        it('should fail if endDate is before startDate', () => {
            const { error } = createReservationSchema.validate({
                ...validReservation,
                startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                endDate: new Date(Date.now() + 86400000).toISOString()
            });
            expect(error).toBeDefined();
        });
    });

    describe('updateReservationStatusSchema', () => {
        it('should validate valid status', () => {
            const { error } = updateReservationStatusSchema.validate({ status: 'confirmee' });
            expect(error).toBeUndefined();
        });

        it('should fail for invalid status', () => {
            const { error } = updateReservationStatusSchema.validate({ status: 'unknown' });
            expect(error).toBeDefined();
        });
    });

    describe('cancelReservationSchema', () => {
        it('should validate valid cancellation reason', () => {
            const { error } = cancelReservationSchema.validate({ cancellationReason: 'Personal reasons for cancellation' });
            expect(error).toBeUndefined();
        });

        it('should fail if reason is too short', () => {
            const { error } = cancelReservationSchema.validate({ cancellationReason: 'Too short' });
            expect(error).toBeDefined();
        });
    });
});
