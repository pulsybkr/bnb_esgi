import { Request, Response } from 'express';
import { analyticsService } from '../../services/admin';

/**
 * @swagger
 * tags:
 *   name: Admin - Analytics
 *   description: Statistiques et analytics
 */

export class AnalyticsAdminController {
    /**
     * @swagger
     * /admin/analytics/overview:
     *   get:
     *     summary: Vue d'ensemble des statistiques
     *     tags: [Admin - Analytics]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *     responses:
     *       200:
     *         description: Statistiques globales
     */
    async getOverview(req: Request, res: Response): Promise<void> {
        try {
            const { startDate, endDate } = req.query;

            const stats = await analyticsService.getOverview(
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );

            res.json({
                success: true,
                data: stats,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /admin/analytics/users:
     *   get:
     *     summary: Statistiques utilisateurs
     *     tags: [Admin - Analytics]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: groupBy
     *         schema:
     *           type: string
     *           enum: [day, week, month]
     *     responses:
     *       200:
     *         description: Statistiques utilisateurs
     */
    async getUserStats(req: Request, res: Response): Promise<void> {
        try {
            const { startDate, endDate, groupBy = 'day' } = req.query;

            const stats = await analyticsService.getUserStats(
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
                groupBy as 'day' | 'week' | 'month'
            );

            res.json({
                success: true,
                data: stats,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /admin/analytics/reservations:
     *   get:
     *     summary: Statistiques réservations
     *     tags: [Admin - Analytics]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: groupBy
     *         schema:
     *           type: string
     *           enum: [day, week, month]
     *     responses:
     *       200:
     *         description: Statistiques réservations
     */
    async getReservationStats(req: Request, res: Response): Promise<void> {
        try {
            const { startDate, endDate, groupBy = 'day' } = req.query;

            const stats = await analyticsService.getReservationStats(
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
                groupBy as 'day' | 'week' | 'month'
            );

            res.json({
                success: true,
                data: stats,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /admin/analytics/revenue:
     *   get:
     *     summary: Statistiques de revenus
     *     tags: [Admin - Analytics]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: groupBy
     *         schema:
     *           type: string
     *           enum: [day, week, month]
     *     responses:
     *       200:
     *         description: Statistiques revenus
     */
    async getRevenueStats(req: Request, res: Response): Promise<void> {
        try {
            const { startDate, endDate, groupBy = 'day' } = req.query;

            const stats = await analyticsService.getRevenueStats(
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
                groupBy as 'day' | 'week' | 'month'
            );

            res.json({
                success: true,
                data: stats,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /admin/analytics/listings:
     *   get:
     *     summary: Statistiques des annonces
     *     tags: [Admin - Analytics]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: query
     *         name: city
     *         schema:
     *           type: string
     *       - in: query
     *         name: type
     *         schema:
     *           type: string
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *     responses:
     *       200:
     *         description: Statistiques annonces
     */
    async getListingStats(req: Request, res: Response): Promise<void> {
        try {
            const { city, type, startDate, endDate } = req.query;

            const stats = await analyticsService.getListingStats({
                city: city as string,
                type: type as string,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
            });

            res.json({
                success: true,
                data: stats,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new AnalyticsAdminController();
