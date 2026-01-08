import { Router } from 'express';
import { authenticateToken as authenticate } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/admin.middleware';

// Import admin controllers
import verificationAdminController from '../../controllers/admin/verification.admin.controller';
import moderationAdminController from '../../controllers/admin/moderation.admin.controller';
import analyticsAdminController from '../../controllers/admin/analytics.admin.controller';
import reportingAdminController from '../../controllers/admin/reporting.admin.controller';

const router = Router();

// Appliquer l'authentification et la vérification admin à toutes les routes
router.use(authenticate);
router.use(requireAdmin);

// ============================================
// Routes de vérification d'identité (Admin)
// ============================================
router.get('/verifications', verificationAdminController.getAllVerifications.bind(verificationAdminController));
router.get('/verifications/stats', verificationAdminController.getStats.bind(verificationAdminController));
router.get('/verifications/:id', verificationAdminController.getVerificationById.bind(verificationAdminController));
router.patch('/verifications/:id/approve', verificationAdminController.approveVerification.bind(verificationAdminController));
router.patch('/verifications/:id/reject', verificationAdminController.rejectVerification.bind(verificationAdminController));

// ============================================
// Routes de modération
// ============================================

// Modération des annonces
router.get('/moderation/announcements', moderationAdminController.getAnnouncements.bind(moderationAdminController));
router.patch('/moderation/announcements/:id/approve', moderationAdminController.approveAnnouncement.bind(moderationAdminController));
router.patch('/moderation/announcements/:id/suspend', moderationAdminController.suspendAnnouncement.bind(moderationAdminController));

// Modération des signalements
router.get('/moderation/reports', moderationAdminController.getReports.bind(moderationAdminController));
router.patch('/moderation/reports/:id/process', moderationAdminController.processReport.bind(moderationAdminController));

// Modération des utilisateurs
router.get('/moderation/users', moderationAdminController.getUsers.bind(moderationAdminController));
router.patch('/moderation/users/:id/suspend', moderationAdminController.suspendUser.bind(moderationAdminController));
router.patch('/moderation/users/:id/activate', moderationAdminController.activateUser.bind(moderationAdminController));

// ============================================
// Routes d'analytics
// ============================================
router.get('/analytics/overview', analyticsAdminController.getOverview.bind(analyticsAdminController));
router.get('/analytics/users', analyticsAdminController.getUserStats.bind(analyticsAdminController));
router.get('/analytics/reservations', analyticsAdminController.getReservationStats.bind(analyticsAdminController));
router.get('/analytics/revenue', analyticsAdminController.getRevenueStats.bind(analyticsAdminController));
router.get('/analytics/listings', analyticsAdminController.getListingStats.bind(analyticsAdminController));

// ============================================
// Routes de reporting
// ============================================
router.get('/reports/export', reportingAdminController.exportReport.bind(reportingAdminController));
router.post('/reports/custom', reportingAdminController.generateCustomReport.bind(reportingAdminController));

export default router;
