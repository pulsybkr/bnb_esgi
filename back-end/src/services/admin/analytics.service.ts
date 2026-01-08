import { PrismaClient, StatutReservation, StatutUtilisateur } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
    /**
     * Vue d'ensemble des statistiques
     */
    async getOverview(startDate?: Date, endDate?: Date) {
        const dateFilter = this.getDateFilter(startDate, endDate);

        const [
            totalUsers,
            activeUsers,
            totalListings,
            activeListings,
            totalReservations,
            completedReservations,
            totalRevenue,
            verifiedUsers,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: { status: StatutUtilisateur.actif },
            }),
            prisma.logement.count(),
            prisma.logement.count({
                where: { status: 'actif' },
            }),
            prisma.reservation.count({
                where: dateFilter.reservation,
            }),
            prisma.reservation.count({
                where: {
                    ...dateFilter.reservation,
                    status: StatutReservation.terminee,
                },
            }),
            prisma.paiement.aggregate({
                where: {
                    ...dateFilter.payment,
                    status: 'reussi',
                },
                _sum: {
                    amount: true,
                },
            }),
            prisma.user.count({
                where: { isVerified: true },
            }),
        ]);

        return {
            totalUsers,
            activeUsers,
            totalListings,
            activeListings,
            totalReservations,
            completedReservations,
            totalRevenue: totalRevenue._sum.amount || 0,
            verifiedUsers,
            verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0,
        };
    }

    /**
     * Statistiques utilisateurs
     */
    async getUserStats(startDate?: Date, endDate?: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
        const dateFilter = this.getDateFilter(startDate, endDate);

        const users = await prisma.user.findMany({
            where: {
                registrationDate: dateFilter.user?.registrationDate,
            },
            select: {
                registrationDate: true,
                userType: true,
                status: true,
            },
        });

        // Grouper les données par période
        const grouped = this.groupByPeriod(users, 'registrationDate', groupBy);

        return grouped;
    }

    /**
     * Statistiques réservations
     */
    async getReservationStats(startDate?: Date, endDate?: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
        const dateFilter = this.getDateFilter(startDate, endDate);

        const reservations = await prisma.reservation.findMany({
            where: dateFilter.reservation,
            select: {
                createdAt: true,
                status: true,
                totalAmount: true,
                guestCount: true,
            },
        });

        const grouped = this.groupByPeriod(reservations, 'createdAt', groupBy);

        return grouped;
    }

    /**
     * Statistiques de revenus
     */
    async getRevenueStats(startDate?: Date, endDate?: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
        const dateFilter = this.getDateFilter(startDate, endDate);

        const payments = await prisma.paiement.findMany({
            where: {
                ...dateFilter.payment,
                status: 'reussi',
            },
            select: {
                transactionDate: true,
                amount: true,
                paymentMethod: true,
            },
        });

        const grouped = this.groupByPeriod(payments, 'transactionDate', groupBy);

        return grouped;
    }

    /**
     * Statistiques des annonces
     */
    async getListingStats(filters?: {
        city?: string;
        type?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const where: any = {};

        if (filters?.city) {
            where.city = filters.city;
        }
        if (filters?.type) {
            where.type = filters.type;
        }

        const [
            totalListings,
            activeListings,
            averagePrice,
            topCities,
            typeDistribution,
        ] = await Promise.all([
            prisma.logement.count({ where }),
            prisma.logement.count({
                where: { ...where, status: 'actif' },
            }),
            prisma.logement.aggregate({
                where,
                _avg: {
                    pricePerNight: true,
                },
            }),
            prisma.logement.groupBy({
                by: ['city'],
                where,
                _count: true,
                orderBy: {
                    _count: {
                        city: 'desc',
                    },
                },
                take: 10,
            }),
            prisma.logement.groupBy({
                by: ['type'],
                where,
                _count: true,
            }),
        ]);

        return {
            totalListings,
            activeListings,
            averagePrice: averagePrice._avg.pricePerNight || 0,
            topCities,
            typeDistribution,
        };
    }

    /**
     * Filtre de date helper
     */
    private getDateFilter(startDate?: Date, endDate?: Date) {
        const filter: any = {
            user: {},
            reservation: {},
            payment: {},
        };

        if (startDate || endDate) {
            const dateRange: any = {};
            if (startDate) dateRange.gte = startDate;
            if (endDate) dateRange.lte = endDate;

            filter.user.registrationDate = dateRange;
            filter.reservation.createdAt = dateRange;
            filter.payment.transactionDate = dateRange;
        }

        return filter;
    }

    /**
     * Grouper les données par période
     */
    private groupByPeriod(data: any[], dateField: string, groupBy: 'day' | 'week' | 'month') {
        // Implémentation simplifiée - à améliorer avec une vraie logique de groupement
        return data.reduce((acc: any, item: any) => {
            const date = new Date(item[dateField]);
            let key: string;

            if (groupBy === 'day') {
                key = date.toISOString().split('T')[0];
            } else if (groupBy === 'week') {
                const weekNumber = this.getWeekNumber(date);
                key = `${date.getFullYear()}-W${weekNumber}`;
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);

            return acc;
        }, {});
    }

    /**
     * Obtenir le numéro de semaine
     */
    private getWeekNumber(date: Date): number {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }
}

export default new AnalyticsService();
