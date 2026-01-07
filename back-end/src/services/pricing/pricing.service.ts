import prisma from '../../prisma/client';
import { NotFoundError } from '../../types';
import { Prisma } from '@prisma/client';

export interface CreatePricingConfigData {
    basePrice: number;
    currency?: string;
}

export interface CreatePricingRuleData {
    type: 'season' | 'weekend' | 'long_stay' | 'custom';
    name: string;
    priority?: number;
    enabled?: boolean;
    // Season rule fields
    season?: 'high' | 'low';
    startMonth?: number;
    endMonth?: number;
    priceMultiplier?: number;
    // Weekend rule fields
    weekendMultiplier?: number;
    weekMultiplier?: number;
    // Long stay rule fields
    minimumNights?: number;
    discountPercentage?: number;
    maximumDiscountPercentage?: number;
    // Custom period rule fields
    startDate?: Date;
    endDate?: Date;
}

export interface UpdatePricingRuleData {
    name?: string;
    priority?: number;
    enabled?: boolean;
    season?: 'high' | 'low';
    startMonth?: number;
    endMonth?: number;
    priceMultiplier?: number;
    weekendMultiplier?: number;
    weekMultiplier?: number;
    minimumNights?: number;
    discountPercentage?: number;
    maximumDiscountPercentage?: number;
    startDate?: Date;
    endDate?: Date;
}

export class PricingService {
    /**
     * Create or update pricing configuration for an accommodation
     */
    static async createOrUpdatePricingConfig(
        accommodationId: string,
        configData: CreatePricingConfigData
    ): Promise<any> {
        // Check if accommodation exists
        const accommodation = await prisma.logement.findUnique({
            where: { id: accommodationId },
        });

        if (!accommodation) {
            throw new NotFoundError('Accommodation not found');
        }

        // Check if configuration already exists
        const existingConfig = await prisma.pricingConfiguration.findUnique({
            where: { accommodationId },
        });

        if (existingConfig) {
            // Update existing configuration
            return await prisma.pricingConfiguration.update({
                where: { id: existingConfig.id },
                data: {
                    basePrice: new Prisma.Decimal(configData.basePrice),
                    currency: configData.currency || 'EUR',
                },
                include: {
                    rules: {
                        orderBy: { priority: 'desc' },
                    },
                },
            });
        } else {
            // Create new configuration
            return await prisma.pricingConfiguration.create({
                data: {
                    accommodationId,
                    basePrice: new Prisma.Decimal(configData.basePrice),
                    currency: configData.currency || 'EUR',
                },
                include: {
                    rules: {
                        orderBy: { priority: 'desc' },
                    },
                },
            });
        }
    }

    /**
     * Get pricing configuration for an accommodation
     */
    static async getPricingConfig(accommodationId: string): Promise<any | null> {
        const config = await prisma.pricingConfiguration.findUnique({
            where: { accommodationId },
            include: {
                rules: {
                    orderBy: { priority: 'desc' },
                },
            },
        });

        return config;
    }

    /**
     * Add a pricing rule to a configuration
     */
    static async addPricingRule(
        accommodationId: string,
        ruleData: CreatePricingRuleData
    ): Promise<any> {
        // Get or create pricing configuration
        let config = await prisma.pricingConfiguration.findUnique({
            where: { accommodationId },
        });

        if (!config) {
            // Get base price from accommodation
            const accommodation = await prisma.logement.findUnique({
                where: { id: accommodationId },
            });

            if (!accommodation) {
                throw new NotFoundError('Accommodation not found');
            }

            config = await prisma.pricingConfiguration.create({
                data: {
                    accommodationId,
                    basePrice: accommodation.pricePerNight,
                    currency: accommodation.currency || 'EUR',
                },
            });
        }

        // Prepare rule data
        const ruleDataToCreate: any = {
            configurationId: config.id,
            type: ruleData.type,
            name: ruleData.name,
            priority: ruleData.priority ?? 0,
            enabled: ruleData.enabled ?? true,
        };

        // Add type-specific fields
        if (ruleData.type === 'season') {
            ruleDataToCreate.season = ruleData.season;
            ruleDataToCreate.startMonth = ruleData.startMonth;
            ruleDataToCreate.endMonth = ruleData.endMonth;
            if (ruleData.priceMultiplier !== undefined) {
                ruleDataToCreate.priceMultiplier = new Prisma.Decimal(ruleData.priceMultiplier);
            }
        } else if (ruleData.type === 'weekend') {
            if (ruleData.weekendMultiplier !== undefined) {
                ruleDataToCreate.weekendMultiplier = new Prisma.Decimal(ruleData.weekendMultiplier);
            }
            if (ruleData.weekMultiplier !== undefined) {
                ruleDataToCreate.weekMultiplier = new Prisma.Decimal(ruleData.weekMultiplier);
            }
        } else if (ruleData.type === 'long_stay') {
            ruleDataToCreate.minimumNights = ruleData.minimumNights;
            if (ruleData.discountPercentage !== undefined) {
                ruleDataToCreate.discountPercentage = new Prisma.Decimal(ruleData.discountPercentage);
            }
            if (ruleData.maximumDiscountPercentage !== undefined) {
                ruleDataToCreate.maximumDiscountPercentage = new Prisma.Decimal(ruleData.maximumDiscountPercentage);
            }
        } else if (ruleData.type === 'custom') {
            ruleDataToCreate.startDate = ruleData.startDate;
            ruleDataToCreate.endDate = ruleData.endDate;
            if (ruleData.priceMultiplier !== undefined) {
                ruleDataToCreate.priceMultiplier = new Prisma.Decimal(ruleData.priceMultiplier);
            }
        }

        const rule = await prisma.pricingRule.create({
            data: ruleDataToCreate,
        });

        return rule;
    }

    /**
     * Update a pricing rule
     */
    static async updatePricingRule(
        ruleId: string,
        updateData: UpdatePricingRuleData
    ): Promise<any> {
        const rule = await prisma.pricingRule.findUnique({
            where: { id: ruleId },
        });

        if (!rule) {
            throw new NotFoundError('Pricing rule not found');
        }

        const dataToUpdate: any = { ...updateData };

        // Convert Decimal fields
        if (updateData.priceMultiplier !== undefined) {
            dataToUpdate.priceMultiplier = new Prisma.Decimal(updateData.priceMultiplier);
        }
        if (updateData.weekendMultiplier !== undefined) {
            dataToUpdate.weekendMultiplier = new Prisma.Decimal(updateData.weekendMultiplier);
        }
        if (updateData.weekMultiplier !== undefined) {
            dataToUpdate.weekMultiplier = new Prisma.Decimal(updateData.weekMultiplier);
        }
        if (updateData.discountPercentage !== undefined) {
            dataToUpdate.discountPercentage = new Prisma.Decimal(updateData.discountPercentage);
        }
        if (updateData.maximumDiscountPercentage !== undefined) {
            dataToUpdate.maximumDiscountPercentage = new Prisma.Decimal(updateData.maximumDiscountPercentage);
        }

        const updatedRule = await prisma.pricingRule.update({
            where: { id: ruleId },
            data: dataToUpdate,
        });

        return updatedRule;
    }

    /**
     * Delete a pricing rule
     */
    static async deletePricingRule(ruleId: string): Promise<void> {
        const rule = await prisma.pricingRule.findUnique({
            where: { id: ruleId },
        });

        if (!rule) {
            throw new NotFoundError('Pricing rule not found');
        }

        await prisma.pricingRule.delete({
            where: { id: ruleId },
        });
    }

    /**
     * Get all pricing rules for a configuration
     */
    static async getPricingRules(accommodationId: string): Promise<any[]> {
        const config = await prisma.pricingConfiguration.findUnique({
            where: { accommodationId },
            include: {
                rules: {
                    orderBy: { priority: 'desc' },
                },
            },
        });

        return config?.rules || [];
    }
}


