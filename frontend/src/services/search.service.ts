import apiClient from './api'

export interface Tag {
  id: string
  label: string
  category: string
}

export interface TagsResponse {
  categories: {
    style: Tag[]
    location: Tag[]
    feature: Tag[]
    audience: Tag[]
    special: Tag[]
  }
  allTags: Tag[]
}

export const searchService = {
  /**
   * Récupère des suggestions d'auto-complétion
   */
  async getSuggestions(
    type: 'city' | 'country' | 'tag',
    query: string,
    limit: number = 10
  ): Promise<string[] | Tag[]> {
    const response = await apiClient.get('/search/suggestions', {
      params: { type, q: query, limit },
    })
    return response.data.data.suggestions
  },

  /**
   * Récupère toutes les suggestions de villes
   */
  async getCitySuggestions(query: string, limit: number = 10): Promise<string[]> {
    const suggestions = await this.getSuggestions('city', query, limit)
    return suggestions as string[]
  },

  /**
   * Récupère toutes les suggestions de pays
   */
  async getCountrySuggestions(query: string, limit: number = 10): Promise<string[]> {
    const suggestions = await this.getSuggestions('country', query, limit)
    return suggestions as string[]
  },

  /**
   * Récupère toutes les suggestions de tags
   */
  async getTagSuggestions(query: string, limit: number = 10): Promise<Tag[]> {
    const suggestions = await this.getSuggestions('tag', query, limit)
    return suggestions as Tag[]
  },

  /**
   * Récupère tous les tags et catégories
   */
  async getTags(): Promise<TagsResponse> {
    const response = await apiClient.get('/search/tags')
    return response.data.data
  },
}

