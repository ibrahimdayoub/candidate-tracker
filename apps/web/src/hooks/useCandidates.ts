import type { Candidate } from '@candidate-tracker/shared'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { candidateApi } from '../api/candidate.api'

export interface CandidateParams {
  search?: string
  page?: number
  limit?: number
}

export interface UpdateCandidatePayload {
  id: string
  data: Partial<Candidate>
}

/**
 * Candidates Hook
 */
export function useCandidates (params?: CandidateParams) {
  const queryClient = useQueryClient()

  /**
   * LIST
   */
  const candidatesQuery = useQuery({
    queryKey: ['candidates', params],
    queryFn: async () => {
      const { data } = await candidateApi.list(params)
      return data
    }
  })

  /**
   * CREATE
   */
  const createMutation = useMutation({
    mutationFn: candidateApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    }
  })

  /**
   * UPDATE
   */
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateCandidatePayload) =>
      candidateApi.update(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['candidate', vars.id] })
    }
  })

  /**
   * DELETE
   */
  const deleteMutation = useMutation({
    mutationFn: candidateApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    }
  })

  return {
    // Data
    candidates: candidatesQuery.data?.items ?? [],
    totalCount: candidatesQuery.data?.total ?? 0,
    lastPage: candidatesQuery.data?.last_page ?? 1,

    // States
    isLoading: candidatesQuery.isLoading,
    isError: candidatesQuery.isError,

    // Mutations
    createCandidate: createMutation.mutateAsync,
    updateCandidate: updateMutation.mutateAsync,
    deleteCandidate: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

/**
 * Single Candidate
 */
export function useCandidateDetail (id?: string) {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const { data } = await candidateApi.detail(id!)
      return data
    },
    enabled: !!id
  })
}
