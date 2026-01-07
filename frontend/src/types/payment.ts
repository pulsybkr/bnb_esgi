/**
 * Types pour les paiements (synchronisés avec le backend)
 */

export type PaymentMethod = 'carte' | 'mobile_money'
export type PaymentStatus = 'en_attente' | 'reussi' | 'echec' | 'rembourse' | 'annule'

export interface MobileMoneyOperator {
    code: string
    name: string
    countries: string[]
}

export interface CardDetails {
    last4?: string
    brand?: string
}

export interface InitiatePaymentData {
    reservationId: string
    amount: number
    currency?: string
    method: PaymentMethod
    mobileOperator?: string
    cardDetails?: CardDetails
}

export interface PaymentResult {
    success: boolean
    paymentId: string
    transactionRef: string
    status: PaymentStatus
    message: string
    requiresAction?: boolean
    actionType?: 'otp' | 'redirect'
}

export interface Payment {
    id: string
    reservationId: string
    userId: string
    amount: number
    currency: string
    status: PaymentStatus
    paymentMethod: PaymentMethod
    mobileOperator?: string | null
    transactionRef?: string | null
    externalRef?: string | null
    paymentDetails?: any
    errorMessage?: string | null
    transactionDate?: Date | null
    createdAt: Date
    updatedAt: Date
    reservation?: {
        id: string
        accommodation: {
            id: string
            title: string
        }
    }
}

export interface PaymentFilters {
    status?: PaymentStatus
    page?: number
    limit?: number
}
