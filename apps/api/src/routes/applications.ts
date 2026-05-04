import {
  ApplicationSchema,
  ApplicationStatusEnum,
  ApplicationWithCandidateSchema
} from '@candidate-tracker/shared'

import type { FastifyInstance } from 'fastify'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

// Schemas
const ListQuerySchema = z.object({
  search: z.string().optional(),
  status: ApplicationStatusEnum.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
})

const ListResponseSchema = z.object({
  items: z.array(ApplicationWithCandidateSchema),
  total: z.number(),
  page: z.number(),
  last_page: z.number()
})

const ParamsSchema = z.object({
  id: z.string().uuid()
})

type ListQueryParams = z.infer<typeof ListQuerySchema>
type ParamsType = z.infer<typeof ParamsSchema>
type ApplicationBody = z.infer<typeof ApplicationSchema>

// Only applications with active candidates
const activeCandidateFilter: Prisma.ApplicationWhereInput = {
  candidate: {
    deleted_at: null
  }
}

// Routes
export async function applicationRoutes (app: FastifyInstance) {
  /**
   * 1. LIST Applications
   */
  app.get<{ Querystring: ListQueryParams }>(
    '/applications',
    {
      schema: {
        querystring: ListQuerySchema,
        response: {
          200: ListResponseSchema
        }
      }
    },
    async request => {
      const query = ListQuerySchema.parse(request.query)
      const { search, status, from, to, page, limit } = query

      const skip = (page - 1) * limit

      const where: Prisma.ApplicationWhereInput = {
        ...activeCandidateFilter,
        ...(status && { status }),
        ...((from || to) && {
          applied_at: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) })
          }
        }),
        ...(search && {
          OR: [
            { job_title: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
            { source: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } },
            {
              candidate: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                  { location: { contains: search, mode: 'insensitive' } }
                ]
              }
            }
          ]
        })
      }

      const [items, total] = await Promise.all([
        prisma.application.findMany({
          where,
          skip,
          take: limit,
          orderBy: { applied_at: 'desc' },
          include: {
            candidate: {
              select: { id: true, name: true, email: true }
            }
          }
        }),
        prisma.application.count({ where })
      ])

      return {
        items,
        total,
        page,
        last_page: Math.ceil(total / limit)
      }
    }
  )

  /**
   * 2. CREATE Application
   */
  app.post<{ Body: ApplicationBody }>(
    '/applications',
    {
      schema: {
        body: ApplicationSchema,
        response: {
          201: ApplicationSchema
        }
      }
    },
    async (request, reply) => {
      const data = ApplicationSchema.parse(request.body)
      const candidate = await prisma.candidate.findFirst({
        where: {
          id: data.candidate_id,
          deleted_at: null
        }
      })

      if (!candidate) {
        return reply.status(400).send({
          message: 'Invalid candidate'
        })
      }

      const created = await prisma.application.create({
        data: {
          ...data,
          applied_at: new Date(data.applied_at)
        },
        include: { candidate: true }
      })

      return reply.status(201).send(created)
    }
  )

  /**
   * 3. GET Application
   */
  app.get<{ Params: ParamsType }>(
    '/applications/:id',
    {
      schema: {
        params: ParamsSchema,
        response: {
          200: ApplicationWithCandidateSchema
        }
      }
    },
    async (request, reply) => {
      const { id } = request.params

      const application = await prisma.application.findFirst({
        where: {
          id,
          ...activeCandidateFilter
        },
        include: { candidate: true }
      })

      if (!application) {
        return reply.status(404).send({
          message: 'Application not found'
        })
      }

      return application
    }
  )

  /**
   * 4. UPDATE Application
   */
  app.patch<{ Params: ParamsType; Body: Partial<ApplicationBody> }>(
    '/applications/:id',
    {
      schema: {
        params: ParamsSchema,
        body: ApplicationSchema.partial(),
        response: {
          200: ApplicationSchema
        }
      }
    },
    async (request, reply) => {
      const { id } = request.params
      const data = ApplicationSchema.partial().parse(request.body)
      const existing = await prisma.application.findFirst({
        where: {
          id,
          ...activeCandidateFilter
        }
      })

      if (!existing) {
        return reply.status(404).send({
          message: 'Application not found'
        })
      }

      if (data.candidate_id) {
        const candidate = await prisma.candidate.findFirst({
          where: {
            id: data.candidate_id,
            deleted_at: null
          }
        })

        if (!candidate) {
          return reply.status(400).send({
            message: 'Invalid candidate'
          })
        }
      }

      const updated = await prisma.application.update({
        where: { id },
        data: {
          ...data,
          applied_at: data.applied_at ? new Date(data.applied_at) : undefined
        },
        include: { candidate: true }
      })

      return updated
    }
  )

  /**
   * 5. DELETE Application (Hard delete)
   */
  app.delete<{ Params: ParamsType }>(
    '/applications/:id',
    {
      schema: {
        params: ParamsSchema
      }
    },
    async (request, reply) => {
      const { id } = request.params

      const result = await prisma.application.deleteMany({
        where: { id }
      })

      if (result.count === 0) {
        return reply.status(404).send({ message: 'Application not found' })
      }

      return reply.status(204).send()
    }
  )
}
