import { Request, Response } from 'express';
import reportingService, { ReportType, ReportFormat } from '../../services/admin/reporting.service';

/**
 * @swagger
 * tags:
 *   name: Admin - Reporting
 *   description: Génération de rapports
 */

export class ReportingAdminController {
    /**
     * @swagger
     * /admin/reports/export:
     *   get:
     *     summary: Exporter un rapport
     *     tags: [Admin - Reporting]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: query
     *         name: type
     *         required: true
     *         schema:
     *           type: string
     *           enum: [users, reservations, revenue, listings]
     *       - in: query
     *         name: format
     *         schema:
     *           type: string
     *           enum: [json, csv]
     *           default: json
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
     *         description: Rapport généré
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *           text/csv:
     *             schema:
     *               type: string
     */
    async exportReport(req: Request, res: Response): Promise<void> {
        try {
            const { type, format = 'json', startDate, endDate } = req.query;

            if (!type) {
                res.status(400).json({
                    success: false,
                    message: 'Le type de rapport est requis',
                });
                return;
            }

            const report = await reportingService.generateReport(
                type as ReportType,
                format as ReportFormat,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );

            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${new Date().toISOString()}.csv"`);
                res.send(report);
            } else {
                res.json({
                    success: true,
                    data: report,
                });
            }
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /admin/reports/custom:
     *   post:
     *     summary: Générer un rapport personnalisé
     *     tags: [Admin - Reporting]
     *     security:
     *       - AdminAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - type
     *             properties:
     *               type:
     *                 type: string
     *                 enum: [users, reservations, revenue, listings]
     *               format:
     *                 type: string
     *                 enum: [json, csv]
     *               startDate:
     *                 type: string
     *                 format: date
     *               endDate:
     *                 type: string
     *                 format: date
     *     responses:
     *       200:
     *         description: Rapport personnalisé généré
     */
    async generateCustomReport(req: Request, res: Response): Promise<void> {
        try {
            const { type, format = 'json', startDate, endDate } = req.body;

            if (!type) {
                res.status(400).json({
                    success: false,
                    message: 'Le type de rapport est requis',
                });
                return;
            }

            const report = await reportingService.generateReport(
                type as ReportType,
                format as ReportFormat,
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined
            );

            res.json({
                success: true,
                message: 'Rapport généré avec succès',
                data: report,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new ReportingAdminController();
