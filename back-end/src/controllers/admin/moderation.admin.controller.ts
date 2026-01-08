import { Request, Response } from 'express';
import { moderationService } from '../../services/admin';
import { StatutLogement, StatutUtilisateur } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Admin - Moderation
 *   description: Modération des annonces et utilisateurs
 */

export class ModerationAdminController {
    /**
     * @swagger
     * /admin/moderation/announcements:
     *   get:
     *     summary: Liste des annonces à modérer
     *     tags: [Admin - Moderation]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
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
     *         description: Liste des annonces
     */
    async getAnnouncements(req: Request, res: Response): Promise<void> {
        try {
            const { status, page, limit } = req.query;

            const result = await moderationService.getAnnouncementsToModerate({
                status: status as StatutLogement,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });

            res.json({
                success: true,
                data: result.logements,
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
     * /admin/moderation/announcements/{id}/approve:
     *   patch:
     *     summary: Approuver une annonce
     *     tags: [Admin - Moderation]
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
     *         description: Annonce approuvée
     */
    async approveAnnouncement(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const logement = await moderationService.approveAnnouncement(id);

            res.json({
                success: true,
                message: 'Annonce approuvée',
                data: logement,
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
     * /admin/moderation/announcements/{id}/suspend:
     *   patch:
     *     summary: Suspendre une annonce
     *     tags: [Admin - Moderation]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               reason:
     *                 type: string
     *     responses:
     *       200:
     *         description: Annonce suspendue
     */
    async suspendAnnouncement(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const logement = await moderationService.suspendAnnouncement(id, reason);

            res.json({
                success: true,
                message: 'Annonce suspendue',
                data: logement,
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
     * /admin/moderation/reports:
     *   get:
     *     summary: Liste des signalements
     *     tags: [Admin - Moderation]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *       - in: query
     *         name: contentType
     *         schema:
     *           type: string
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
     *         description: Liste des signalements
     */
    async getReports(req: Request, res: Response): Promise<void> {
        try {
            const { status, contentType, page, limit } = req.query;

            const result = await moderationService.getReports({
                status: status as string,
                contentType: contentType as string,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });

            res.json({
                success: true,
                data: result.signalements,
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
     * /admin/moderation/reports/{id}/process:
     *   patch:
     *     summary: Traiter un signalement
     *     tags: [Admin - Moderation]
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
     *               - status
     *               - decision
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [traite, rejete]
     *               decision:
     *                 type: string
     *     responses:
     *       200:
     *         description: Signalement traité
     */
    async processReport(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const moderatorId = req.user.id;
            const { status, decision } = req.body;

            const signalement = await moderationService.processReport(id, moderatorId, status, decision);

            res.json({
                success: true,
                message: 'Signalement traité',
                data: signalement,
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
     * /admin/moderation/users:
     *   get:
     *     summary: Liste des utilisateurs à modérer
     *     tags: [Admin - Moderation]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *       - in: query
     *         name: verificationStatus
     *         schema:
     *           type: boolean
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
     *         description: Liste des utilisateurs
     */
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const { status, verificationStatus, page, limit } = req.query;

            const result = await moderationService.getUsersToModerate({
                status: status as StatutUtilisateur,
                verificationStatus: verificationStatus === 'true' ? true : verificationStatus === 'false' ? false : undefined,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });

            res.json({
                success: true,
                data: result.users,
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
     * /admin/moderation/users/{id}/suspend:
     *   patch:
     *     summary: Suspendre un utilisateur
     *     tags: [Admin - Moderation]
     *     security:
     *       - AdminAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               reason:
     *                 type: string
     *     responses:
     *       200:
     *         description: Utilisateur suspendu
     */
    async suspendUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const user = await moderationService.suspendUser(id, reason);

            res.json({
                success: true,
                message: 'Utilisateur suspendu',
                data: user,
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
     * /admin/moderation/users/{id}/activate:
     *   patch:
     *     summary: Activer un utilisateur
     *     tags: [Admin - Moderation]
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
     *         description: Utilisateur activé
     */
    async activateUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = await moderationService.activateUser(id);

            res.json({
                success: true,
                message: 'Utilisateur activé',
                data: user,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new ModerationAdminController();
