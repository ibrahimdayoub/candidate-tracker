import Fastify from 'fastify'
import cors from '@fastify/cors'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod'

import { candidateRoutes } from './routes/candidates.js'
import { applicationRoutes } from './routes/applications.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { errorHandler } from './plugins/error-handler.js'

export function buildApp () {
  const app = Fastify({
    logger: false
  }).withTypeProvider<ZodTypeProvider>()

  // Zod
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // CORS
  app.register(cors, {
    origin: process.env.WEB_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })

  // Routes
  app.register(dashboardRoutes, { prefix: '/api' })
  app.register(candidateRoutes, { prefix: '/api' })
  app.register(applicationRoutes, { prefix: '/api' })

  // Error handling
  app.register(errorHandler)

  // 404
  app.setNotFoundHandler((req, reply) => {
    reply.status(404).send({ message: 'Route not found' })
  })

  return app
}
