import { DisponibiliteService } from '../../../services/disponibilite/disponibilite.service';
import { prismaMock } from '../../setup';

describe('DisponibiliteService', () => {
    describe('checkConflicts', () => {
        it('should return true if there is a conflict', async () => {
            prismaMock.disponibilite.count.mockResolvedValue(1);

            const hasConflict = await DisponibiliteService.checkConflicts(
                'prop-1',
                new Date('2024-01-01'),
                new Date('2024-01-05')
            );

            expect(hasConflict).toBe(true);
        });

        it('should return false if there is no conflict', async () => {
            prismaMock.disponibilite.count.mockResolvedValue(0);
            prismaMock.reservation.count.mockResolvedValue(0);

            const hasConflict = await DisponibiliteService.checkConflicts(
                'prop-1',
                new Date('2024-01-01'),
                new Date('2024-01-05')
            );

            expect(hasConflict).toBe(false);
        });
    });

    describe('createAvailability', () => {
        it('should create an availability if no conflicts', async () => {
            const data: any = {
                startDate: new Date('2024-05-01'),
                endDate: new Date('2024-05-10'),
            };

            prismaMock.logement.findUnique.mockResolvedValue({ id: 'prop-1' } as any);
            prismaMock.disponibilite.count.mockResolvedValue(0);
            prismaMock.reservation.count.mockResolvedValue(0);
            prismaMock.disponibilite.create.mockResolvedValue({ id: 'disp-1', ...data } as any);

            const result = await DisponibiliteService.createAvailability('prop-1', data);

            expect(result.id).toBe('disp-1');
            expect(prismaMock.disponibilite.create).toHaveBeenCalled();
        });
    });
});
