import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../../services/search/search.service';

export class SearchController {
    /**
     * Get autocomplete suggestions
     */
    static async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { type, q, limit } = req.query;
            const query = (q as string) || '';
            const limitNum = limit ? parseInt(limit as string) : 10;

            if (!type || typeof type !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Type parameter is required (city, country, or tag)',
                });
                return;
            }

            let suggestions: string[] | Array<{ id: string; label: string; category: string }> = [];

            switch (type) {
                case 'city':
                    suggestions = await SearchService.getCitySuggestions(query, limitNum);
                    break;
                case 'country':
                    suggestions = await SearchService.getCountrySuggestions(query, limitNum);
                    break;
                case 'tag':
                    suggestions = await SearchService.getTagSuggestions(query, limitNum);
                    break;
                default:
                    res.status(400).json({
                        success: false,
                        message: 'Invalid type. Must be city, country, or tag',
                    });
                    return;
            }

            res.json({
                success: true,
                data: {
                    type,
                    query,
                    suggestions,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all tags and categories
     */
    static async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tags = await SearchService.getAllTags();

            res.json({
                success: true,
                data: tags,
            });
        } catch (error) {
            next(error);
        }
    }
}

