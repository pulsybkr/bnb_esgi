import apiClient from './api'

export interface Availability {
  id: string
  accommodationId: string
  startDate: string
  endDate: string
  status: 'disponible' | 'reserve' | 'bloque'
  customPrice?: number
  note?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAvailabilityData {
  startDate: string
  endDate: string
  status?: 'disponible' | 'reserve' | 'bloque'
  customPrice?: number
  note?: string
}

export interface AvailabilityFilters {
  startDate?: string
  endDate?: string
  status?: 'disponible' | 'reserve' | 'bloque'
}

export const availabilityService = {
  /**
   * Récupère toutes les disponibilités d'un logement
   */
  async getByProperty(propertyId: string, filters?: AvailabilityFilters): Promise<Availability[]> {
    const response = await apiClient.get(`/logements/${propertyId}/availabilities`, {
      params: filters,
    })
    return response.data.data.availabilities
  },

  /**
   * Récupère les dates disponibles pour un logement
   */
  async getAvailableDates(propertyId: string, startDate: string, endDate: string): Promise<string[]> {
    const response = await apiClient.get(`/logements/${propertyId}/available-dates`, {
      params: { startDate, endDate },
    })
    return response.data.data.availableDates
  },

  /**
   * Crée une période de disponibilité ou de blocage
   */
  async create(propertyId: string, data: CreateAvailabilityData): Promise<Availability> {
    const response = await apiClient.post(`/logements/${propertyId}/availabilities`, data)
    return response.data.data.availability
  },

  /**
   * Met à jour une période de disponibilité
   */
  async update(id: string, data: Partial<CreateAvailabilityData>): Promise<Availability> {
    const response = await apiClient.put(`/availabilities/${id}`, data)
    return response.data.data.availability
  },

  /**
   * Supprime une période de disponibilité
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/availabilities/${id}`)
  },

  /**
   * Crée plusieurs périodes en une seule requête
   */
  async bulkCreate(propertyId: string, periods: CreateAvailabilityData[]): Promise<Availability[]> {
    const response = await apiClient.post(`/logements/${propertyId}/availabilities/bulk`, {
      periods,
    })
    return response.data.data.availabilities
  },

  /**
   * Bloque des dates spécifiques
   */
  async blockDates(
    propertyId: string,
    startDate: string,
    endDate: string,
    note?: string
  ): Promise<Availability> {
    return this.create(propertyId, {
      startDate,
      endDate,
      status: 'bloque',
      note,
    })
  },
}

