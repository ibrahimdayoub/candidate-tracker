import type {
  ApplicationParams,
  UpdateApplicationPayload
} from '@/hooks/useApplications'
import { api } from '../lib/axios'
import type { Application } from '@candidate-tracker/shared'

/**
 * Application API Layer
 * Handles all HTTP requests related to applications
 */
export const applicationApi = {
  /**
   * Fetch applications with filters (search, status, pagination, date range)
   */
  list: (params?: ApplicationParams) => {
    return api.get('/applications', { params })
  },

  /**
   * Get single application by ID
   */
  detail: (id: string) => {
    return api.get(`/applications/${id}`)
  },

  /**
   * Create new application
   */
  create: (data: Application) => {
    return api.post('/applications', data)
  },

  /**
   * Update existing application
   */
  update: (payload: UpdateApplicationPayload) => {
    return api.patch(`/applications/${payload.id}`, payload.data)
  },

  /**
   * Hard delete application
   */
  remove: (id: string | undefined) => {
    return api.delete(`/applications/${id}`)
  }
}
