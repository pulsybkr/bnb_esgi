import { Request, Response, NextFunction } from 'express';
import aiService from '../services/ai.service';

export class AiController {
    async generateDescription(req: Request, res: Response, next: NextFunction) {
        try {
            const { description } = req.body;

            const generatedDescription = await aiService.generateDescription({
                description: description || ''
            });

            res.status(200).json({
                success: true,
                data: generatedDescription
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AiController();
