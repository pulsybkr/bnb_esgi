import prisma from '../../prisma/client';
import { NotFoundError, ValidationError } from '../../types';
import { Prisma } from '@prisma/client';

export type PaymentMethod = 'carte' | 'mobile_money';
export type PaymentStatus = 'en_attente' | 'reussi' | 'echec' | 'rembourse' | 'annule';

export interface InitiatePaymentData {
    reservationId: string;
    amount: number;
    currency?: string;
    method: PaymentMethod;
    mobileOperator?: string; // For mobile money
    cardDetails?: {
        last4?: string;
        brand?: string;
    };
}

export interface PaymentResult {
    success: boolean;
    paymentId: string;
    transactionRef: string;
    status: PaymentStatus;
    message: string;
    requiresAction?: boolean;
    actionType?: 'otp' | 'redirect';
}

// Mobile Money operators grouped by region
export const MOBILE_MONEY_OPERATORS = {
    'orange_money': { name: 'Orange Money', countries: ['SN', 'CI', 'ML', 'BF', 'GN', 'CM'] },
    'mtn_momo': { name: 'MTN Mobile Money', countries: ['CI', 'CM', 'GH', 'UG', 'RW'] },
    'wave': { name: 'Wave', countries: ['SN', 'CI', 'ML', 'BF'] },
    'moov_money': { name: 'Moov Money', countries: ['CI', 'BJ', 'TG', 'NE'] },
    'm_pesa': { name: 'M-Pesa', countries: ['KE', 'TZ', 'CD', 'MZ'] },
    'free_money': { name: 'Free Money', countries: ['SN'] },
    'airtel_money': { name: 'Airtel Money', countries: ['KE', 'UG', 'TZ', 'RW'] },
};

export class PaymentService {
    /**
     * Generate a unique transaction reference
     */
    private static generateTransactionRef(): string {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 10);
        return `TXN-${timestamp}-${randomPart}`.toUpperCase();
    }

    /**
     * Simulate processing delay (realistic mock)
     */
    private static async simulateProcessingDelay(ms: number = 2000): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Mock Stripe card payment
     */
    static async processCardPayment(
        userId: string,
        data: InitiatePaymentData
    ): Promise<PaymentResult> {
        const { reservationId, amount, currency = 'XOF' } = data;

        // Validate reservation exists and belongs to user
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { accommodation: true },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        if (reservation.tenantId !== userId) {
            throw new ValidationError('You are not authorized to pay for this reservation');
        }

        // Check if reservation can be paid
        if (reservation.status !== 'en_attente' && reservation.status !== 'confirmee' && reservation.status !== 'acceptee') {
            throw new ValidationError(
                `Cannot process payment for reservation with status: ${reservation.status}`
            );
        }

        const transactionRef = this.generateTransactionRef();

        // Create payment record (pending)
        const payment = await prisma.paiement.create({
            data: {
                reservationId,
                userId,
                amount: new Prisma.Decimal(amount),
                currency,
                status: 'en_attente',
                paymentMethod: 'carte',
                transactionRef,
                paymentDetails: {
                    method: 'stripe_mock',
                    cardLast4: data.cardDetails?.last4 || '4242',
                    cardBrand: data.cardDetails?.brand || 'visa',
                },
            },
        });

        // Simulate payment processing (2 seconds)
        await this.simulateProcessingDelay(2000);

        // Mock: 95% success rate for cards
        const isSuccess = Math.random() < 0.95;

        if (isSuccess) {
            // Update payment to success
            await prisma.paiement.update({
                where: { id: payment.id },
                data: {
                    status: 'reussi',
                    externalRef: `STRIPE_${Date.now()}`,
                    transactionDate: new Date(),
                },
            });

            // Update reservation status if it was pending (instant booking after payment)
            if (reservation.status === 'en_attente') {
                await prisma.reservation.update({
                    where: { id: reservationId },
                    data: { status: 'confirmee' },
                });
            }

            return {
                success: true,
                paymentId: payment.id,
                transactionRef,
                status: 'reussi',
                message: 'Paiement effectué avec succès',
            };
        } else {
            // Update payment to failed
            await prisma.paiement.update({
                where: { id: payment.id },
                data: {
                    status: 'echec',
                    errorMessage: 'Card declined (mock)',
                },
            });

            return {
                success: false,
                paymentId: payment.id,
                transactionRef,
                status: 'echec',
                message: 'Paiement refusé. Veuillez vérifier vos informations de carte.',
            };
        }
    }

    /**
     * Mock Mobile Money payment (unified for all operators)
     */
    static async processMobileMoneyPayment(
        userId: string,
        data: InitiatePaymentData
    ): Promise<PaymentResult> {
        const { reservationId, amount, currency = 'XOF', mobileOperator } = data;

        if (!mobileOperator) {
            throw new ValidationError('Mobile operator is required for mobile money payments');
        }

        // Validate operator
        if (!MOBILE_MONEY_OPERATORS[mobileOperator as keyof typeof MOBILE_MONEY_OPERATORS]) {
            throw new ValidationError('Invalid mobile money operator');
        }

        // Validate reservation exists and belongs to user
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { accommodation: true },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        if (reservation.tenantId !== userId) {
            throw new ValidationError('You are not authorized to pay for this reservation');
        }

        // Check if reservation can be paid
        if (reservation.status !== 'en_attente' && reservation.status !== 'confirmee' && reservation.status !== 'acceptee') {
            throw new ValidationError(
                `Cannot process payment for reservation with status: ${reservation.status}`
            );
        }

        const transactionRef = this.generateTransactionRef();
        const operatorInfo = MOBILE_MONEY_OPERATORS[mobileOperator as keyof typeof MOBILE_MONEY_OPERATORS];

        // Create payment record (pending)
        const payment = await prisma.paiement.create({
            data: {
                reservationId,
                userId,
                amount: new Prisma.Decimal(amount),
                currency,
                status: 'en_attente',
                paymentMethod: 'mobile_money',
                mobileOperator,
                transactionRef,
                paymentDetails: {
                    method: 'mobile_money_mock',
                    operator: operatorInfo.name,
                    operatorCode: mobileOperator,
                },
            },
        });

        // For mobile money, return that OTP confirmation is required
        return {
            success: true,
            paymentId: payment.id,
            transactionRef,
            status: 'en_attente',
            message: `Un code de confirmation a été envoyé sur votre numéro ${operatorInfo.name}`,
            requiresAction: true,
            actionType: 'otp',
        };
    }

    /**
     * Confirm Mobile Money payment with OTP (mock)
     */
    static async confirmMobileMoneyPayment(
        userId: string,
        paymentId: string,
        otpCode: string
    ): Promise<PaymentResult> {
        const payment = await prisma.paiement.findUnique({
            where: { id: paymentId },
            include: {
                reservation: true,
            },
        });

        if (!payment) {
            throw new NotFoundError('Payment not found');
        }

        if (payment.userId !== userId) {
            throw new ValidationError('You are not authorized to confirm this payment');
        }

        if (payment.status !== 'en_attente') {
            throw new ValidationError(`Payment already has status: ${payment.status}`);
        }

        // Simulate OTP verification delay
        await this.simulateProcessingDelay(1500);

        // Mock: Accept any 4-6 digit OTP, 90% success rate
        const isValidOtp = /^\d{4,6}$/.test(otpCode);
        const isSuccess = isValidOtp && Math.random() < 0.90;

        if (isSuccess) {
            // Update payment to success
            await prisma.paiement.update({
                where: { id: paymentId },
                data: {
                    status: 'reussi',
                    externalRef: `MOMO_${Date.now()}`,
                    transactionDate: new Date(),
                },
            });

            // Update reservation status
            if (payment.reservation.status === 'en_attente') {
                await prisma.reservation.update({
                    where: { id: payment.reservationId },
                    data: { status: 'confirmee' },
                });
            }

            return {
                success: true,
                paymentId,
                transactionRef: payment.transactionRef || '',
                status: 'reussi',
                message: 'Paiement confirmé avec succès',
            };
        } else {
            // Update payment to failed
            await prisma.paiement.update({
                where: { id: paymentId },
                data: {
                    status: 'echec',
                    errorMessage: isValidOtp ? 'Insufficient balance (mock)' : 'Invalid OTP code',
                },
            });

            return {
                success: false,
                paymentId,
                transactionRef: payment.transactionRef || '',
                status: 'echec',
                message: isValidOtp
                    ? 'Solde insuffisant. Veuillez recharger votre compte.'
                    : 'Code OTP invalide',
            };
        }
    }

    /**
     * Get payment by ID
     */
    static async getPaymentById(paymentId: string): Promise<any> {
        const payment = await prisma.paiement.findUnique({
            where: { id: paymentId },
            include: {
                reservation: {
                    select: {
                        id: true,
                        startDate: true,
                        endDate: true,
                        status: true,
                        accommodation: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundError('Payment not found');
        }

        return payment;
    }

    /**
     * Get payments for a reservation
     */
    static async getReservationPayments(reservationId: string): Promise<any[]> {
        return prisma.paiement.findMany({
            where: { reservationId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get user payment history
     */
    static async getUserPayments(
        userId: string,
        filters: { status?: PaymentStatus; page?: number; limit?: number } = {}
    ): Promise<{ payments: any[]; total: number; page: number; limit: number }> {
        const { status, page = 1, limit = 20 } = filters;

        const where: any = { userId };
        if (status) {
            where.status = status;
        }

        const skip = (page - 1) * limit;
        const total = await prisma.paiement.count({ where });

        const payments = await prisma.paiement.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                reservation: {
                    select: {
                        id: true,
                        accommodation: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });

        return { payments, total, page, limit };
    }

    /**
     * Cancel/Refund a payment (mock)
     */
    static async refundPayment(
        paymentId: string,
        reason?: string
    ): Promise<PaymentResult> {
        const payment = await prisma.paiement.findUnique({
            where: { id: paymentId },
        });

        if (!payment) {
            throw new NotFoundError('Payment not found');
        }

        if (payment.status !== 'reussi') {
            throw new ValidationError('Only successful payments can be refunded');
        }

        // Simulate refund processing
        await this.simulateProcessingDelay(1500);

        // Update payment status
        await prisma.paiement.update({
            where: { id: paymentId },
            data: {
                status: 'rembourse',
                paymentDetails: {
                    ...(payment.paymentDetails as object || {}),
                    refundReason: reason,
                    refundDate: new Date().toISOString(),
                },
            },
        });

        return {
            success: true,
            paymentId,
            transactionRef: payment.transactionRef || '',
            status: 'rembourse',
            message: 'Remboursement effectué avec succès',
        };
    }

    /**
     * Get available mobile money operators
     */
    static getAvailableOperators(): typeof MOBILE_MONEY_OPERATORS {
        return MOBILE_MONEY_OPERATORS;
    }
}
