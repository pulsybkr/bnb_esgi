import { SearchService } from '../../../services/search/search.service';
import { prismaMock } from '../../setup';

describe('SearchService', () => {
    describe('getCitySuggestions', () => {
        it('should return empty array for short query', async () => {
            const result = await SearchService.getCitySuggestions('a');
            expect(result).toEqual([]);
            expect(prismaMock.logement.findMany).not.toHaveBeenCalled();
        });

        it('should return city names for valid query', async () => {
            prismaMock.logement.findMany.mockResolvedValue([
                { city: 'Dakar' },
                { city: 'Dartmouth' }
            ] as any);

            const result = await SearchService.getCitySuggestions('Da');

            expect(result).toEqual(['Dakar', 'Dartmouth']);
            expect(prismaMock.logement.findMany).toHaveBeenCalled();
        });
    });

    describe('getTagSuggestions', () => {
        it('should return tags matching query', async () => {
            const result = await SearchService.getTagSuggestions('Piscine');
            expect(result.some(t => t.label.includes('Piscine') || t.id.includes('piscine'))).toBe(true);
        });
    });
});
