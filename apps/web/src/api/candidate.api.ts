import type { Candidate } from '@candidate-tracker/shared'

import { api } from '../lib/axios'
import type {
  CandidateParams,
  UpdateCandidatePayload
} from '@/hooks/useCandidates'

/**
 * Candidate API Layer
 * Handles all HTTP requests related to candidates
 */
export const candidateApi = {
  /**
   * Fetch candidates list with optional filters
   */
  list: (params?: CandidateParams) => {
    return api.get('/candidates', { params })
  },

  /**
   * Get single candidate by ID
   */
  detail: (id: string) => {
    return api.get(`/candidates/${id}`)
  },

  /**
   * Create new candidate
   */
  create: (data: Candidate) => {
    return api.post('/candidates', data)
  },

  /**
   * Update existing candidate
   */
  update: (payload: UpdateCandidatePayload) => {
    return api.patch(`/candidates/${payload.id}`, payload.data)
  },

  /**
   * Soft delete candidate
   */
  remove: (id: string | undefined) => {
    return api.delete(`/candidates/${id}`)
  }
}
