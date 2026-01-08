import { Request, Response } from 'express';
import { verificationService } from '../../services/verification';
import { StatutVerification } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Admin - Verifications
 *   description: Gestion admin des vérifications d'identité
 */

export class VerificationAdminController {
    /**
     * @swagger
     * /admin/verifications:
     *   get:
     *     summary: Liste des demandes de vérification
     *     tags: [Admin - Verifications]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [en_attente, approuve, rejete, expire]
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Liste des vérifications
     */
    async getAllVerifications(req: Request, res: Response): Promise<void> {
        try {
            const { status, page, limit } = req.query;

            const result = await verificationService.getAllVerifications({
                status: status as StatutVerification,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });

            res.json({
                success: true,
                data: result.verifications,
                pagination: result.pagination,
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
     * /admin/verifications/{id}:
     *   get:
     *     summary: Détails d'une vérification
     *     tags: [Admin - Verifications]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Détails de la vérification
     */
    async getVerificationById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const verification = await verificationService.getVerificationById(id);

            res.json({
                success: true,
                data: verification,
            });
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /admin/verifications/{id}/approve:
     *   patch:
     *     summary: Approuver une vérification
     *     tags: [Admin - Verifications]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Vérification approuvée
     */
    async approveVerification(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const reviewerId = req.user.id;

            const verification = await verificationService.approveVerification({
                verificationId: id,
                reviewerId,
                approved: true,
            });

            res.json({
                success: true,
                message: 'Vérification approuvée avec succès',
                data: verification,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /admin/verifications/{id}/reject:
     *   patch:
     *     summary: Rejeter une vérification
     *     tags: [Admin - Verifications]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - reason
     *             properties:
     *               reason:
     *                 type: string
     *     responses:
     *       200:
     *         description: Vérification rejetée
     */
    async rejectVerification(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const reviewerId = req.user.id;
            const { reason } = req.body;

            const verification = await verificationService.rejectVerification({
                verificationId: id,
                reviewerId,
                approved: false,
                rejectionReason: reason,
            });

            res.json({
                success: true,
                message: 'Vérification rejetée',
                data: verification,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * @swagger
     * /admin/verifications/stats:
     *   get:
     *     summary: Statistiques de vérification
     *     tags: [Admin - Verifications]
     *     security:
     *       - AdminAuth: []
     *     responses:
     *       200:
     *         description: Statistiques
     */
    async getStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await verificationService.getVerificationStats();

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

export default new VerificationAdminController();
