import { FavoriService } from '../../../services/favori/favori.service';
import { prismaMock } from '../../setup';

describe('FavoriService', () => {
    describe('addFavorite', () => {
        it('should add to favorites successfully', async () => {
            prismaMock.logement.findUnique.mockResolvedValue({ id: 'prop-1' } as any);
            prismaMock.favori.upsert.mockResolvedValue({
                userId: 'user-1',
                accommodationId: 'prop-1',
                accommodation: { title: 'Villa' }
            } as any);

            const result = await FavoriService.addFavorite('user-1', 'prop-1');

            expect(result.accommodation.title).toBe('Villa');
            expect(prismaMock.favori.upsert).toHaveBeenCalled();
        });

        it('should throw NotFoundError if accommodation missing', async () => {
            prismaMock.logement.findUnique.mockResolvedValue(null);

            await expect(FavoriService.addFavorite('user-1', 'none')).rejects.toThrow('Accommodation not found');
        });
    });

    describe('getUserFavorites', () => {
        it('should return list of accommodations', async () => {
            prismaMock.favori.findMany.mockResolvedValue([
                { accommodation: { id: 'p1' } },
                { accommodation: { id: 'p2' } }
            ] as any);

            const result = await FavoriService.getUserFavorites('user-1');

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('p1');
        });
    });
});
