import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'

/**
 * Dashboard Stats Hook
 */
export function useDashboardStats () {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get(`/dashboard/stats`)
      return data
    }
  })
}
