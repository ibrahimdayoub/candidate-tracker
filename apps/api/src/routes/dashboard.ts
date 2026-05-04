import type { FastifyInstance } from 'fastify'
import type { ApplicationStatus } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

type StatusCount = {
  status: ApplicationStatus
  _count: number
}

export async function dashboardRoutes (app: FastifyInstance) {
  /**
   * 1. LIST Stats
   */
  app.get('/dashboard/stats', async () => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const activeCandidateFilter = {
      candidate: { deleted_at: null }
    }

    const [
      totalCandidates,
      totalApplications,
      statusCounts,
      hiredThisMonth,
      latestApplications
    ] = await Promise.all([
      prisma.candidate.count({
        where: { deleted_at: null }
      }),

      prisma.application.count({
        where: activeCandidateFilter
      }),

      prisma.application.groupBy({
        by: ['status'],
        where: activeCandidateFilter,
        _count: true
      }),

      prisma.application.count({
        where: {
          status: 'hired',
          applied_at: { gte: firstDayOfMonth },
          ...activeCandidateFilter
        }
      }),

      prisma.application.findMany({
        where: activeCandidateFilter,
        take: 5,
        orderBy: { applied_at: 'desc' },
        include: {
          candidate: {
            select: { name: true }
          }
        }
      })
    ])

    const typed = statusCounts as StatusCount[]

    const rejectedCount = typed.find(s => s.status === 'rejected')?._count ?? 0

    const rejectionRate =
      totalApplications > 0 ? (rejectedCount / totalApplications) * 100 : 0

    return {
      totalCandidates,
      totalApplications,

      statusDistribution: typed.map(s => ({
        name: s.status,
        value: s._count
      })),

      hiredThisMonth,
      rejectionRate: Number(rejectionRate.toFixed(1)),
      latestApplications
    }
  })
}
