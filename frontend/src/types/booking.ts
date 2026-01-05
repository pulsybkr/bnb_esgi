/**
 * Types pour les réservations et la gestion de disponibilité
 */

export interface Booking {
  id: string
  accommodationId: string
  guestId: string
  guestName: string
  guestEmail: string
  checkIn: Date
  checkOut: Date
  guests: number
  totalPrice: number
  status: BookingStatus
  createdAt: Date
  notes?: string
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface BlockedDate {
  id: string
  accommodationId: string
  startDate: Date
  endDate: Date
  reason?: string
  type: BlockType
  createdAt: Date
}

export enum BlockType {
  MAINTENANCE = 'maintenance',
  PERSONAL = 'personal',
  OTHER = 'other'
}

export interface CalendarEvent {
  id: string
  type: 'booking' | 'block'
  title: string
  startDate: Date
  endDate: Date
  color: string
  booking?: Booking
  blockedDate?: BlockedDate
}

