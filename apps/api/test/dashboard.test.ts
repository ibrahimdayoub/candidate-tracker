import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

let app: Awaited<ReturnType<typeof buildApp>>

const createCandidate = () => ({
  name: 'Test User',
  email: `test-${Date.now()}-${Math.random()}@example.com`
})

const createApplication = (candidate_id: string, overrides = {}) => ({
  candidate_id,
  job_title: 'Frontend Dev',
  company: 'Google',
  status: 'applied' as const,
  applied_at: new Date().toISOString(),
  ...overrides
})

describe.sequential('Dashboard Routes', () => {
  beforeAll(async () => {
    app = buildApp()
    await app.ready()
  })

  beforeEach(async () => {
    await prisma.application.deleteMany()
    await prisma.candidate.deleteMany()
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('GET /api/dashboard/stats -> should return correct stats', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    await prisma.application.createMany({
      data: [
        createApplication(candidate.id, { status: 'applied' }),
        createApplication(candidate.id, { status: 'rejected' }),
        createApplication(candidate.id, { status: 'hired' })
      ]
    })

    const res = await app.inject({
      method: 'GET',
      url: '/api/dashboard/stats'
    })

    expect(res.statusCode).toBe(200)

    const body = JSON.parse(res.body)

    // Basic counts
    expect(body.totalCandidates).toBe(1)
    expect(body.totalApplications).toBe(3)

    // status distribution
    expect(body.statusDistribution.length).toBeGreaterThan(0)

    const rejected = body.statusDistribution.find(
      (s: any) => s.name === 'rejected'
    )

    expect(rejected.value).toBe(1)

    // rejection rate (1/3)
    expect(body.rejectionRate).toBeCloseTo(33.3)

    // latest applications
    expect(body.latestApplications.length).toBe(3)
    expect(body.latestApplications[0]).toHaveProperty('candidate')
  })

  it('GET /api/dashboard/stats -> should handle empty database', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/dashboard/stats'
    })

    const body = JSON.parse(res.body)

    expect(res.statusCode).toBe(200)

    expect(body.totalCandidates).toBe(0)
    expect(body.totalApplications).toBe(0)
    expect(body.rejectionRate).toBe(0)
    expect(body.latestApplications.length).toBe(0)
  })
})
