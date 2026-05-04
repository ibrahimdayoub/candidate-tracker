import type { Application, ApplicationStatus } from '@candidate-tracker/shared'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationApi } from '../api/application.api'

export interface ApplicationParams {
  search?: string
  status?: ApplicationStatus
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface UpdateApplicationPayload {
  id: string
  data: Partial<Application>
}

/**
 * Applications Hook
 */
export function useApplications (params?: ApplicationParams) {
  const queryClient = useQueryClient()

  /**
   * LIST
   */
  const applicationsQuery = useQuery({
    queryKey: ['applications', params],
    queryFn: async () => {
      const { data } = await applicationApi.list(params)
      return data
    }
  })

  /**
   * CREATE
   */
  const createMutation = useMutation({
    mutationFn: applicationApi.create,
    onSuccess: (_, vars) => {
      console.log(vars)
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({
        queryKey: ['candidate', vars.candidate_id]
      })
    }
  })

  /**
   * UPDATE
   */
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateApplicationPayload) =>
      applicationApi.update(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', vars.id] })
    }
  })

  /**
   * DELETE
   */
  const deleteMutation = useMutation({
    mutationFn: applicationApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    }
  })

  return {
    // Data
    applications: applicationsQuery.data?.items ?? [],
    totalCount: applicationsQuery.data?.total ?? 0,
    lastPage: applicationsQuery.data?.last_page ?? 1,

    // States
    isLoading: applicationsQuery.isLoading,
    isError: applicationsQuery.isError,

    // Mutations
    createApplication: createMutation.mutateAsync,
    updateApplication: updateMutation.mutateAsync,
    deleteApplication: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

/**
 * Single Application
 */
export function useApplicationDetail (id?: string) {
  return useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const { data } = await applicationApi.detail(id!)
      return data
    },
    enabled: !!id
  })
}
