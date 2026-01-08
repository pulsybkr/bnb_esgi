import { PaymentService } from '../../../services/payment/payment.service';
import { prismaMock } from '../../setup';
import { Prisma } from '@prisma/client';

describe('PaymentService', () => {
    describe('generateTransactionRef', () => {
        it('should generate a reference starting with TXN', () => {
            const ref = (PaymentService as any).generateTransactionRef();
            expect(ref).toMatch(/^TXN-[A-Z0-9]+-[A-Z0-9]+$/);
        });
    });

    describe('processCardPayment', () => {
        const paymentData: any = {
            reservationId: 'res-1',
            amount: 500,
            method: 'carte',
        };

        it('should process card payment successfully (mock)', async () => {
            prismaMock.reservation.findUnique.mockResolvedValue({
                id: 'res-1',
                status: 'acceptee',
                tenantId: 'user-1'
            } as any);
            prismaMock.paiement.create.mockResolvedValue({
                id: 'pay-1',
                status: 'reussi',
                transactionRef: 'TR-123'
            } as any);
            prismaMock.paiement.update.mockResolvedValue({} as any);
            prismaMock.reservation.update.mockResolvedValue({} as any);

            // Disable delay for tests (hack to access private static)
            jest.spyOn(PaymentService as any, 'simulateProcessingDelay').mockResolvedValue(undefined);
            // Mock Math.random to ensure success
            jest.spyOn(Math, 'random').mockReturnValue(0.1);

            const result = await PaymentService.processCardPayment('user-1', paymentData);

            expect(result.success).toBe(true);
            expect(result.status).toBe('reussi');
            expect(prismaMock.paiement.create).toHaveBeenCalled();
        });
    });

    describe('processMobileMoneyPayment', () => {
        it('should return requiresAction for mobile money', async () => {
            const mmData: any = {
                reservationId: 'res-1',
                amount: 300,
                method: 'mobile_money',
                mobileOperator: 'orange_money'
            };

            prismaMock.reservation.findUnique.mockResolvedValue({
                id: 'res-1',
                status: 'acceptee',
                tenantId: 'user-1'
            } as any);
            prismaMock.paiement.create.mockResolvedValue({
                id: 'pay-2',
                status: 'en_attente'
            } as any);

            jest.spyOn(PaymentService as any, 'simulateProcessingDelay').mockResolvedValue(undefined);

            const result = await PaymentService.processMobileMoneyPayment('user-1', mmData);

            expect(result.requiresAction).toBe(true);
            expect(result.status).toBe('en_attente');
        });
    });
});
