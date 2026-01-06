import prisma from '../../prisma/client';
import { availableTags, tagsByCategory } from '../../data/tags';

export class SearchService {
    /**
     * Get autocomplete suggestions for cities
     */
    static async getCitySuggestions(query: string, limit: number = 10): Promise<string[]> {
        if (!query || query.length < 2) {
            return [];
        }

        const cities = await prisma.logement.findMany({
            where: {
                city: {
                    contains: query,
                    mode: 'insensitive',
                },
                status: 'actif',
            },
            select: {
                city: true,
            },
            distinct: ['city'],
            take: limit,
            orderBy: {
                city: 'asc',
            },
        });

        return cities.map(c => c.city);
    }

    /**
     * Get autocomplete suggestions for countries
     */
    static async getCountrySuggestions(query: string, limit: number = 10): Promise<string[]> {
        if (!query || query.length < 2) {
            return [];
        }

        const countries = await prisma.logement.findMany({
            where: {
                country: {
                    contains: query,
                    mode: 'insensitive',
                },
                status: 'actif',
            },
            select: {
                country: true,
            },
            distinct: ['country'],
            take: limit,
            orderBy: {
                country: 'asc',
            },
        });

        return countries.map(c => c.country);
    }

    /**
     * Get autocomplete suggestions for tags
     */
    static async getTagSuggestions(query: string, limit: number = 10): Promise<Array<{ id: string; label: string; category: string }>> {
        if (!query || query.length < 1) {
            return availableTags.slice(0, limit);
        }

        const lowerQuery = query.toLowerCase();
        
        return availableTags
            .filter(tag => 
                tag.label.toLowerCase().includes(lowerQuery) ||
                tag.id.toLowerCase().includes(lowerQuery)
            )
            .slice(0, limit)
            .map(tag => ({
                id: tag.id,
                label: tag.label,
                category: tag.category,
            }));
    }

    /**
     * Get all available tags grouped by category
     */
    static async getAllTags(): Promise<{
        categories: Record<string, Array<{ id: string; label: string; category: string }>>;
        allTags: Array<{ id: string; label: string; category: string }>;
    }> {
        return {
            categories: {
                style: tagsByCategory.style.map(t => ({ id: t.id, label: t.label, category: t.category })),
                location: tagsByCategory.location.map(t => ({ id: t.id, label: t.label, category: t.category })),
                feature: tagsByCategory.feature.map(t => ({ id: t.id, label: t.label, category: t.category })),
                audience: tagsByCategory.audience.map(t => ({ id: t.id, label: t.label, category: t.category })),
                special: tagsByCategory.special.map(t => ({ id: t.id, label: t.label, category: t.category })),
            },
            allTags: availableTags.map(t => ({ id: t.id, label: t.label, category: t.category })),
        };
    }
}

