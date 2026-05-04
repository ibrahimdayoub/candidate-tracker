import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { ApplicationStatus } from '@prisma/client'
import { buildApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

let app: Awaited<ReturnType<typeof buildApp>>

const unique = () => `${Date.now()}-${Math.random()}`

const createCandidate = () => ({
  name: 'Test User',
  email: `test-${unique()}@example.com`
})

const createApplication = (candidate_id: string, overrides = {}) => ({
  candidate_id,
  job_title: 'Frontend Dev',
  company: 'Google',
  status: ApplicationStatus.applied,
  applied_at: new Date().toISOString(),
  source: 'LinkedIn',
  ...overrides
})

describe.sequential('Applications Routes', () => {
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

  it('POST /api/applications -> should create application', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    const res = await app.inject({
      method: 'POST',
      url: '/api/applications',
      payload: createApplication(candidate.id)
    })

    expect(res.statusCode).toBe(201)

    const body = JSON.parse(res.body)
    expect(body.candidate_id).toBe(candidate.id)
  })

  it('POST /api/applications -> should return 400 if candidate is invalid', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/applications',
      payload: createApplication('invalid-id')
    })

    expect(res.statusCode).toBe(400)
  })

  it('GET /api/applications -> should return list of applications', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    await prisma.application.create({
      data: createApplication(candidate.id)
    })

    const res = await app.inject({
      method: 'GET',
      url: '/api/applications'
    })

    const body = JSON.parse(res.body)

    expect(res.statusCode).toBe(200)
    expect(body.items.length).toBe(1)
    expect(body.total).toBe(1)
  })

  it('GET /api/applications?search -> should filter by job title', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    await prisma.application.createMany({
      data: [
        {
          ...createApplication(candidate.id),
          applied_at: new Date(Date.now() + 1).toISOString(),
          job_title: 'Frontend Dev'
        },
        {
          ...createApplication(candidate.id),
          applied_at: new Date(Date.now() + 1).toISOString(),
          job_title: 'Backend Dev'
        }
      ]
    })

    const res = await app.inject({
      method: 'GET',
      url: '/api/applications?search=Frontend'
    })

    const body = JSON.parse(res.body)

    expect(body.items.length).toBe(1)
  })

  it('GET /api/applications?search -> should filter by candidate name', async () => {
    const candidate = await prisma.candidate.create({
      data: {
        ...createCandidate(),
        name: 'Ibrahim Dayoub'
      }
    })

    await prisma.application.createMany({
      data: [
        {
          ...createApplication(candidate.id)
        },
        {
          ...createApplication(candidate.id)
        }
      ]
    })

    const res = await app.inject({
      method: 'GET',
      url: '/api/applications?search=Ibrahim'
    })

    const body = JSON.parse(res.body)

    expect(res.statusCode).toBe(200)
    expect(body.items.length).toBe(2)
    expect(body.items[0].candidate.name).toContain('Ibrahim')
  })

  it('GET /api/applications?status -> should filter by status', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    await prisma.application.createMany({
      data: [
        {
          ...createApplication(candidate.id),
          applied_at: new Date(Date.now() + 1).toISOString(),
          status: 'applied'
        },
        {
          ...createApplication(candidate.id),
          applied_at: new Date(Date.now() + 1).toISOString(),
          status: 'rejected'
        }
      ]
    })

    const res = await app.inject({
      method: 'GET',
      url: '/api/applications?status=rejected'
    })

    const body = JSON.parse(res.body)

    expect(body.items.length).toBe(1)
    expect(body.items[0].status).toBe('rejected')
  })

  it('GET /api/applications/:id -> should return single application', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    const application = await prisma.application.create({
      data: createApplication(candidate.id)
    })

    const res = await app.inject({
      method: 'GET',
      url: `/api/applications/${application.id}`
    })

    const body = JSON.parse(res.body)

    expect(res.statusCode).toBe(200)
    expect(body.id).toBe(application.id)
    expect(body.job_title).toBe('Frontend Dev')
  })

  it('PATCH /api/applications/:id -> should update application', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    const application = await prisma.application.create({
      data: createApplication(candidate.id)
    })

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/applications/${application.id}`,
      payload: { job_title: 'Updated Job' }
    })

    const body = JSON.parse(res.body)

    expect(res.statusCode).toBe(200)
    expect(body.job_title).toBe('Updated Job')
  })

  it('DELETE /api/applications/:id -> should delete application', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    const application = await prisma.application.create({
      data: createApplication(candidate.id)
    })

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/applications/${application.id}`
    })

    expect(res.statusCode).toBe(204)

    const deleted = await prisma.application.findUnique({
      where: { id: application.id }
    })

    expect(deleted).toBeNull()
  })

  it('DELETE /api/applications/:id -> should return 400 for invalid id', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/applications/invalid-id'
    })

    expect(res.statusCode).toBe(400)
  })

  it('DELETE /api/applications/:id -> should return 404 if not found', async () => {
    const fakeId = crypto.randomUUID()

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/applications/${fakeId}`
    })

    expect(res.statusCode).toBe(404)
  })
})
