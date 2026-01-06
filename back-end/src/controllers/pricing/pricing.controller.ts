import { Request, Response, NextFunction } from 'express';
import {
    PricingService,
    CreatePricingConfigData,
    CreatePricingRuleData,
    UpdatePricingRuleData,
} from '../../services/pricing';
import { AuthenticatedRequest } from '../../types';

export class PricingController {
    /**
     * Create or update pricing configuration
     */
    static async createOrUpdateConfig(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const configData: CreatePricingConfigData = req.body;

            const config = await PricingService.createOrUpdatePricingConfig(id, configData);

            res.json({
                success: true,
                message: 'Pricing configuration updated successfully',
                data: { config },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pricing configuration
     */
    static async getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const config = await PricingService.getPricingConfig(id);

            res.json({
                success: true,
                data: { config },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add a pricing rule
     */
    static async addRule(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const ruleData: CreatePricingRuleData = req.body;

            const rule = await PricingService.addPricingRule(id, ruleData);

            res.status(201).json({
                success: true,
                message: 'Pricing rule added successfully',
                data: { rule },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all pricing rules
     */
    static async getRules(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const rules = await PricingService.getPricingRules(id);

            res.json({
                success: true,
                data: { rules },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a pricing rule
     */
    static async updateRule(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { ruleId } = req.params;
            const updateData: UpdatePricingRuleData = req.body;

            const rule = await PricingService.updatePricingRule(ruleId, updateData);

            res.json({
                success: true,
                message: 'Pricing rule updated successfully',
                data: { rule },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a pricing rule
     */
    static async deleteRule(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { ruleId } = req.params;
            await PricingService.deletePricingRule(ruleId);

            res.json({
                success: true,
                message: 'Pricing rule deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}


