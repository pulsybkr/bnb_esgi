import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ReportType = 'users' | 'reservations' | 'revenue' | 'listings';
export type ReportFormat = 'json' | 'csv';

export class ReportingService {
    /**
     * Générer un rapport
     */
    async generateReport(
        type: ReportType,
        format: ReportFormat = 'json',
        startDate?: Date,
        endDate?: Date
    ) {
        let data: any;

        switch (type) {
            case 'users':
                data = await this.generateUsersReport(startDate, endDate);
                break;
            case 'reservations':
                data = await this.generateReservationsReport(startDate, endDate);
                break;
            case 'revenue':
                data = await this.generateRevenueReport(startDate, endDate);
                break;
            case 'listings':
                data = await this.generateListingsReport(startDate, endDate);
                break;
            default:
                throw new Error('Type de rapport non supporté');
        }

        if (format === 'csv') {
            return this.convertToCSV(data);
        }

        return data;
    }

    /**
     * Rapport utilisateurs
     */
    private async generateUsersReport(startDate?: Date, endDate?: Date) {
        const where: any = {};
        if (startDate || endDate) {
            where.registrationDate = {};
            if (startDate) where.registrationDate.gte = startDate;
            if (endDate) where.registrationDate.lte = endDate;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                userType: true,
                status: true,
                isVerified: true,
                registrationDate: true,
                lastLogin: true,
                _count: {
                    select: {
                        logements: true,
                        reservations: true,
                    },
                },
            },
        });

        return {
            reportType: 'users',
            generatedAt: new Date(),
            period: { startDate, endDate },
            totalRecords: users.length,
            data: users,
        };
    }

    /**
     * Rapport réservations
     */
    private async generateReservationsReport(startDate?: Date, endDate?: Date) {
        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const reservations = await prisma.reservation.findMany({
            where,
            include: {
                accommodation: {
                    select: {
                        title: true,
                        city: true,
                        type: true,
                    },
                },
                tenant: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return {
            reportType: 'reservations',
            generatedAt: new Date(),
            period: { startDate, endDate },
            totalRecords: reservations.length,
            data: reservations,
        };
    }

    /**
     * Rapport revenus
     */
    private async generateRevenueReport(startDate?: Date, endDate?: Date) {
        const where: any = { status: 'reussi' };
        if (startDate || endDate) {
            where.transactionDate = {};
            if (startDate) where.transactionDate.gte = startDate;
            if (endDate) where.transactionDate.lte = endDate;
        }

        const payments = await prisma.paiement.findMany({
            where,
            include: {
                reservation: {
                    select: {
                        accommodationId: true,
                        startDate: true,
                        endDate: true,
                    },
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        return {
            reportType: 'revenue',
            generatedAt: new Date(),
            period: { startDate, endDate },
            totalRecords: payments.length,
            totalRevenue,
            data: payments,
        };
    }

    /**
     * Rapport annonces
     */
    private async generateListingsReport(startDate?: Date, endDate?: Date) {
        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const listings = await prisma.logement.findMany({
            where,
            include: {
                owner: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        reservations: true,
                        favorites: true,
                    },
                },
            },
        });

        return {
            reportType: 'listings',
            generatedAt: new Date(),
            period: { startDate, endDate },
            totalRecords: listings.length,
            data: listings,
        };
    }

    /**
     * Convertir en CSV
     */
    private convertToCSV(report: any): string {
        if (!report.data || report.data.length === 0) {
            return '';
        }

        const headers = Object.keys(this.flattenObject(report.data[0]));
        const rows = report.data.map((item: any) => {
            const flattened = this.flattenObject(item);
            return headers.map(header => {
                const value = flattened[header];
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * Aplatir un objet pour CSV
     */
    private flattenObject(obj: any, prefix = ''): any {
        return Object.keys(obj).reduce((acc: any, key: string) => {
            const pre = prefix.length ? `${prefix}.` : '';
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
                Object.assign(acc, this.flattenObject(obj[key], pre + key));
            } else {
                acc[pre + key] = obj[key];
            }
            return acc;
        }, {});
    }
}

export default new ReportingService();
