import {
  CandidateSchema,
  CandidateWithCountSchema,
  CandidateWithApplicationsSchema
} from '@candidate-tracker/shared'

import type { FastifyInstance } from 'fastify'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

// Schemas
const ListQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
})

const ListResponseSchema = z.object({
  items: z.array(CandidateWithCountSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  last_page: z.number()
})

const ParamsSchema = z.object({
  id: z.string().uuid()
})

const CandidateUpdateSchema = CandidateSchema.partial()

type ListQueryParams = z.infer<typeof ListQuerySchema>
type ParamsType = z.infer<typeof ParamsSchema>
type CandidateBody = z.infer<typeof CandidateSchema>
type CandidateUpdateBody = z.infer<typeof CandidateUpdateSchema>

// Base filter (soft delete)
const baseWhere: Prisma.CandidateWhereInput = {
  deleted_at: null
}

// Routes
export async function candidateRoutes (app: FastifyInstance) {
  /**
   * 1. LIST Candidates
   */
  app.get<{ Querystring: ListQueryParams }>(
    '/candidates',
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
      const { search, page, limit } = query
      const skip = (page - 1) * limit

      const where: Prisma.CandidateWhereInput = {
        ...baseWhere,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
          ]
        })
      }

      const [items, total] = await Promise.all([
        prisma.candidate.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            _count: {
              select: { applications: true }
            }
          }
        }),
        prisma.candidate.count({ where })
      ])

      return {
        items,
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit)
      }
    }
  )

  /**
   * 2. CREATE Candidate
   */
  app.post<{ Body: CandidateBody }>(
    '/candidates',
    {
      schema: {
        body: CandidateSchema,
        response: {
          201: CandidateSchema,
          409: z.object({ message: z.string() })
        }
      }
    },
    async (request, reply) => {
      const data = CandidateSchema.parse(request.body)

      const existingCandidate = await prisma.candidate.findFirst({
        where: { email: data.email }
      })

      if (existingCandidate) {
        if (existingCandidate.deleted_at === null) {
          // If the user is active, throw a 409 Conflict
          return reply.status(409).send({ message: 'Email already exists' })
        } else {
          // If the user was soft-deleted, reactivate the account
          const restoredCandidate = await prisma.candidate.update({
            where: { id: existingCandidate.id },
            data: {
              ...data,
              deleted_at: null // Reactivate
            }
          })
          return reply.status(201).send(restoredCandidate)
        }
      }

      // Normal creation if no record exists at all
      const candidate = await prisma.candidate.create({ data })
      return reply.status(201).send(candidate)
    }
  )

  /**
   * 3. GET Candidate Detail
   */

  app.get<{ Params: ParamsType }>(
    '/candidates/:id',
    {
      schema: {
        params: ParamsSchema,
        response: {
          200: CandidateWithApplicationsSchema
        }
      }
    },
    async (request, reply) => {
      const { id } = request.params

      if (!z.string().uuid().safeParse(id).success) {
        return reply.status(404).send({
          message: 'Candidate not found'
        })
      }

      const candidate = await prisma.candidate.findFirst({
        where: {
          id,
          ...baseWhere
        },
        include: {
          applications: {
            orderBy: { applied_at: 'desc' }
          }
        }
      })

      if (!candidate) {
        return reply.status(404).send({
          message: 'Candidate not found'
        })
      }

      return candidate
    }
  )

  /**
   * 4. UPDATE Candidate
   */
  app.patch<{ Params: ParamsType; Body: CandidateUpdateBody }>(
    '/candidates/:id',
    {
      schema: {
        params: ParamsSchema,
        body: CandidateSchema.partial(),
        response: {
          200: CandidateSchema
        }
      }
    },
    async (request, reply) => {
      const { id } = request.params

      const existing = await prisma.candidate.findFirst({
        where: { id, ...baseWhere }
      })

      if (!existing) {
        return reply.status(404).send({
          message: 'Candidate not found'
        })
      }

      const data = CandidateSchema.partial().parse(request.body)
      const updated = await prisma.candidate.update({
        where: { id },
        data
      })

      return updated
    }
  )

  /**
   * 5. DELETE Candidate (Soft Delete)
   */
  app.delete<{ Params: ParamsType }>(
    '/candidates/:id',
    {
      schema: {
        params: ParamsSchema
      }
    },
    async (request, reply) => {
      const { id } = request.params

      const result = await prisma.candidate.updateMany({
        where: {
          id,
          ...baseWhere
        },
        data: {
          deleted_at: new Date()
        }
      })

      if (result.count === 0) {
        return reply.status(404).send({
          message: 'Candidate not found'
        })
      }

      return reply.status(204).send()
    }
  )
}
