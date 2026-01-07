/**
 * Types communs pour les services API
 */

import { ApiResponse, PaginatedResponse } from '@/types/api'

export interface ServiceResponse<T> extends ApiResponse<T> { }

export interface PaginatedServiceResponse<T> extends ApiResponse<PaginatedResponse<T>> { }
