import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { buildApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

let app: ReturnType<typeof Fastify>

const unique = () => `${Date.now()}-${Math.random()}`

const createCandidate = () => ({
  name: 'Test User',
  email: `test-${unique()}@example.com`,
  phone: '123456',
  location: 'Berlin'
})

describe.sequential('Candidates Routes', () => {
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

  it('POST /api/candidates -> should create candidate', async () => {
    const candidate = createCandidate()

    const res = await app.inject({
      method: 'POST',
      url: '/api/candidates',
      payload: candidate
    })

    expect(res.statusCode).toBe(201)

    const body = JSON.parse(res.body)
    expect(body.email).toBe(candidate.email)
  })

  it('POST /api/candidates -> should fail if email exists', async () => {
    const candidate = createCandidate()

    await prisma.candidate.create({ data: candidate })

    const res = await app.inject({
      method: 'POST',
      url: '/api/candidates',
      payload: candidate
    })

    expect(res.statusCode).toBe(409)
  })

  it('POST /api/candidates -> should restore soft deleted candidate', async () => {
    const candidate = createCandidate()

    const deleted = await prisma.candidate.create({
      data: {
        ...candidate,
        deleted_at: new Date()
      }
    })

    const res = await app.inject({
      method: 'POST',
      url: '/api/candidates',
      payload: candidate
    })

    expect(res.statusCode).toBe(201)

    const restored = await prisma.candidate.findUnique({
      where: { id: deleted.id }
    })

    expect(restored?.deleted_at).toBeNull()
    expect(restored?.email).toBe(candidate.email)
    expect(restored?.name).toBe(candidate.name)
  })

  it('GET /api/candidates -> should return paginated list', async () => {
    const c1 = createCandidate()
    const c2 = createCandidate()

    await prisma.candidate.createMany({
      data: [
        { ...c1, email: 'a@test.com' },
        { ...c2, email: 'b@test.com' }
      ]
    })

    const res = await app.inject({
      method: 'GET',
      url: '/api/candidates'
    })

    const body = JSON.parse(res.body)

    expect(res.statusCode).toBe(200)
    expect(body.total).toBe(2)
  })

  it('GET /api/candidates -> should filter by search', async () => {
    const base = createCandidate()

    await prisma.candidate.createMany({
      data: [
        { ...base, name: 'Ibrahim Dev', email: 'i@test.com' },
        { ...base, name: 'Other User', email: 'o@test.com' }
      ]
    })

    const res = await app.inject({
      method: 'GET',
      url: '/api/candidates?search=Ibrahim'
    })

    const body = JSON.parse(res.body)

    // expect(body.items.length).toBe(1)
    expect(body.items).toHaveLength(1)
    expect(body.items[0].name).toContain('Ibrahim')
  })

  it('GET /api/candidates/:id -> should return candidate detail', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    const res = await app.inject({
      method: 'GET',
      url: `/api/candidates/${candidate.id}`
    })

    const body = JSON.parse(res.body)

    expect(res.statusCode).toBe(200)
    expect(body.id).toBe(candidate.id)
  })

  it('PATCH /api/candidates/:id -> should update candidate', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/candidates/${candidate.id}`,
      payload: { name: 'Updated Name' }
    })

    expect(res.statusCode).toBe(200)

    const updated = await prisma.candidate.findUnique({
      where: { id: candidate.id }
    })

    expect(updated?.name).toBe('Updated Name')
  })

  it('DELETE /api/candidates/:id -> should soft delete candidate', async () => {
    const candidate = await prisma.candidate.create({
      data: createCandidate()
    })

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/candidates/${candidate.id}`
    })

    expect(res.statusCode).toBe(204)

    const deleted = await prisma.candidate.findUnique({
      where: { id: candidate.id }
    })

    expect(deleted?.deleted_at).not.toBeNull()
  })

  it('DELETE /api/candidates/:id -> should return 404 if already deleted', async () => {
    const candidate = await prisma.candidate.create({
      data: {
        ...createCandidate(),
        deleted_at: new Date()
      }
    })
  
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/candidates/${candidate.id}`
    })
  
    expect(res.statusCode).toBe(404)
  })

  it('DELETE /api/candidates/:id -> should return 400 for invalid id', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/candidates/invalid-id'
    })

    expect(res.statusCode).toBe(400)
  })

  it('DELETE /api/candidates/:id -> should return 404 if not found', async () => {
    const fakeId = crypto.randomUUID()

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/candidates/${fakeId}`
    })

    expect(res.statusCode).toBe(404)
  })
})
