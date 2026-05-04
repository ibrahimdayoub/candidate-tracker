import type { FastifyInstance, FastifyError } from 'fastify'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

export async function errorHandler (app: FastifyInstance) {
  app.setErrorHandler((error: unknown, request, reply) => {
    // 1. Zod validation error
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Failed',
        message: 'The data provided is invalid',
        details: error.flatten().fieldErrors
      })
    }

    // 2. Prisma known errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return reply.status(409).send({
            error: 'Conflict',
            message: `A record with this ${
              error.meta?.target ?? 'field'
            } already exists.`
          })
        case 'P2025':
          return reply.status(404).send({
            error: 'Not Found',
            message: 'The requested record does not exist or has been deleted.'
          })
      }
    }

    // 3. Fastify / Generic errors
    if (error instanceof Error) {
      const fastifyError = error as FastifyError
      const statusCode = fastifyError.statusCode ?? 500

      app.log.error(error)

      return reply.status(statusCode).send({
        error:
          statusCode === 500 ? 'Internal Server Error' : 'Application Error',
        message:
          statusCode === 500
            ? 'An unexpected error occurred on our end'
            : error.message
      })
    }

    // 4. Fallback (Unknown)
    return reply.status(500).send({
      error: 'Unknown Error',
      message: 'An unidentifiable error occurred'
    })
  })
}
