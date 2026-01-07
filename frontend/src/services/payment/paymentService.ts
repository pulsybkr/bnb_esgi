import api from '../api'
import type {
    InitiatePaymentData,
    PaymentResult,
    Payment,
    PaymentFilters,
    MobileMoneyOperator,
} from '@/types/payment'

export const paymentService = {
    /**
     * Get available mobile money operators
     */
    async getOperators(): Promise<MobileMoneyOperator[]> {
        const response = await api.get('/payments/operators')
        return response.data.data.operators
    },

    /**
     * Initiate a payment (card or mobile money)
     */
    async initiatePayment(data: InitiatePaymentData): Promise<PaymentResult> {
        const response = await api.post('/payments', data)
        return response.data.data
    },

    /**
     * Confirm mobile money payment with OTP
     */
    async confirmPayment(paymentId: string, otpCode: string): Promise<PaymentResult> {
        const response = await api.post(`/payments/${paymentId}/confirm`, { otpCode })
        return response.data.data
    },

    /**
     * Get payment status
     */
    async getPaymentStatus(paymentId: string): Promise<Payment> {
        const response = await api.get(`/payments/${paymentId}`)
        return response.data.data.payment
    },

    /**
     * Get user payment history
     */
    async getMyPayments(filters?: PaymentFilters): Promise<{
        payments: Payment[]
        total: number
        page: number
        limit: number
    }> {
        const params = new URLSearchParams()
        if (filters?.status) params.append('status', filters.status)
        if (filters?.page) params.append('page', filters.page.toString())
        if (filters?.limit) params.append('limit', filters.limit.toString())

        const response = await api.get(`/payments/my?${params.toString()}`)
        return response.data.data
    },

    /**
     * Get payments for a reservation
     */
    async getReservationPayments(reservationId: string): Promise<Payment[]> {
        const response = await api.get(`/payments/reservation/${reservationId}`)
        return response.data.data.payments
    },

    /**
     * Request refund
     */
    async requestRefund(paymentId: string, reason?: string): Promise<PaymentResult> {
        const response = await api.post(`/payments/${paymentId}/refund`, { reason })
        return response.data.data
    },
}
