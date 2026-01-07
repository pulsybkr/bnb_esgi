import { Request, Response, NextFunction } from 'express';
import { PaymentService, MOBILE_MONEY_OPERATORS, InitiatePaymentData } from '../../services/payment';
import { AuthenticatedRequest } from '../../types';

export class PaymentController {
    /**
     * Initiate a payment (card or mobile money)
     */
    static async initiatePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const { reservationId, amount, method, mobileOperator, cardDetails } = req.body;

            if (!reservationId || !amount || !method) {
                throw new Error('Missing required fields: reservationId, amount, method');
            }

            const paymentData: InitiatePaymentData = {
                reservationId,
                amount,
                method,
                mobileOperator,
                cardDetails,
            };

            let result;

            if (method === 'carte') {
                result = await PaymentService.processCardPayment(authReq.user.id, paymentData);
            } else if (method === 'mobile_money') {
                result = await PaymentService.processMobileMoneyPayment(authReq.user.id, paymentData);
            } else {
                throw new Error('Invalid payment method. Use "carte" or "mobile_money"');
            }

            const statusCode = result.success ? 200 : 400;
            res.status(statusCode).json({
                success: result.success,
                message: result.message,
                data: {
                    paymentId: result.paymentId,
                    transactionRef: result.transactionRef,
                    status: result.status,
                    requiresAction: result.requiresAction,
                    actionType: result.actionType,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Confirm Mobile Money payment with OTP
     */
    static async confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const { paymentId } = req.params;
            const { otpCode } = req.body;

            if (!otpCode) {
                throw new Error('OTP code is required');
            }

            const result = await PaymentService.confirmMobileMoneyPayment(
                authReq.user.id,
                paymentId,
                otpCode
            );

            const statusCode = result.success ? 200 : 400;
            res.status(statusCode).json({
                success: result.success,
                message: result.message,
                data: {
                    paymentId: result.paymentId,
                    transactionRef: result.transactionRef,
                    status: result.status,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payment status
     */
    static async getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { paymentId } = req.params;
            const payment = await PaymentService.getPaymentById(paymentId);

            res.json({
                success: true,
                data: { payment },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payments for a reservation
     */
    static async getReservationPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reservationId } = req.params;
            const payments = await PaymentService.getReservationPayments(reservationId);

            res.json({
                success: true,
                data: { payments },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user payment history
     */
    static async getMyPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            if (!authReq.user) {
                throw new Error('User not authenticated');
            }

            const { status, page, limit } = req.query;

            const result = await PaymentService.getUserPayments(authReq.user.id, {
                status: status as any,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 20,
            });

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Request refund
     */
    static async requestRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { paymentId } = req.params;
            const { reason } = req.body;

            const result = await PaymentService.refundPayment(paymentId, reason);

            res.json({
                success: result.success,
                message: result.message,
                data: {
                    paymentId: result.paymentId,
                    status: result.status,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available mobile money operators
     */
    static async getOperators(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const operators = PaymentService.getAvailableOperators();

            // Transform to a more frontend-friendly format
            const operatorsList = Object.entries(operators).map(([code, info]) => ({
                code,
                name: info.name,
                countries: info.countries,
            }));

            res.json({
                success: true,
                data: { operators: operatorsList },
            });
        } catch (error) {
            next(error);
        }
    }
}
