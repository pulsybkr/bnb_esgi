import apiClient from '../api/client'

export interface AiDescriptionResponse {
    success: boolean
    data: string
}

export interface AiDescriptionRequest {
    description: string
}

export const AiService = {
    /**
     * Générer une description améliorée par l'IA
     */
    async generateDescription(data: AiDescriptionRequest): Promise<string> {
        const response = await apiClient.post<AiDescriptionResponse>('/ai/generate-description', data)
        return response.data.data
    }
}
