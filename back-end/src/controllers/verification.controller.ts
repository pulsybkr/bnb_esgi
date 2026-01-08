import { Request, Response } from 'express';
import { verificationService } from '../services/verification';
import { TypeDocument } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Verification
 *   description: Gestion de la vérification d'identité
 */

export class VerificationController {
    /**
     * @swagger
     * /verification/submit:
     *   post:
     *     summary: Soumettre un document d'identité
     *     tags: [Verification]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - documentType
     *               - documentFile
     *             properties:
     *               documentType:
     *                 type: string
     *                 enum: [passeport, carte_identite, permis_conduire, titre_sejour]
     *               documentNumber:
     *                 type: string
     *               documentFile:
     *                 type: string
     *                 format: binary
     *               selfieFile:
     *                 type: string
     *                 format: binary
     *     responses:
     *       201:
     *         description: Vérification soumise avec succès
     *       400:
     *         description: Données invalides
     */
    async submitVerification(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const { documentType, documentNumber } = req.body;
            // @ts-ignore
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (!files?.documentFile || files.documentFile.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Le document est requis',
                });
                return;
            }

            const documentUrl = `/uploads/verifications/${files.documentFile[0].filename}`;
            const selfieUrl = files.selfieFile
                ? `/uploads/verifications/${files.selfieFile[0].filename}`
                : undefined;

            const verification = await verificationService.submitVerification({
                userId,
                documentType: documentType as TypeDocument,
                documentNumber,
                documentUrl,
                selfieUrl,
            });

            res.status(201).json({
                success: true,
                message: 'Demande de vérification soumise avec succès',
                data: verification,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Erreur lors de la soumission',
            });
        }
    }

    /**
     * @swagger
     * /verification/status:
     *   get:
     *     summary: Obtenir le statut de vérification
     *     tags: [Verification]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Statut de vérification
     */
    async getStatus(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const verification = await verificationService.getVerificationStatus(userId);

            res.json({
                success: true,
                data: verification,
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
     * /verification/history:
     *   get:
     *     summary: Historique des vérifications
     *     tags: [Verification]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Liste des vérifications
     */
    async getHistory(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const verifications = await verificationService.getVerificationHistory(userId);

            res.json({
                success: true,
                data: verifications,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new VerificationController();
