import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { URL } from 'url'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const dbUrl = new URL(connectionString)

const isTest = process.env.NODE_ENV === 'test'

// PostgreSQL Pool
const pool = new pg.Pool({
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname,
  port: Number(dbUrl.port),
  database: dbUrl.pathname.replace('/', '')
})

// Prisma Adapter
const adapter = new PrismaPg(pool)

// IMPORTANT: no singleton in test
export const prisma = isTest
  ? new PrismaClient({
      adapter,
      log: ['error']
    })
  : (globalThis as any).prisma ??
    new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? // ? ['query', 'error', 'warn']
            ['error', 'warn']
          : ['error']
    })

// cache only in dev/prod (NOT test)
if (!isTest) {
  ;(globalThis as any).prisma = prisma
}

// cleanup only for production
if (process.env.NODE_ENV === 'production') {
  const cleanup = async () => {
    await prisma.$disconnect()
    await pool.end()
  }

  process.on('SIGTERM', cleanup)
  process.on('SIGINT', cleanup)
}
