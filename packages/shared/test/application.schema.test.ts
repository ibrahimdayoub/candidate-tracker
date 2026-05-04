import { describe, it, expect } from 'vitest'
import { ApplicationSchema } from '../src/schemas/application'

describe('Application Schema', () => {
  it('should pass with valid application', () => {
    const result = ApplicationSchema.safeParse({
      candidate_id: crypto.randomUUID(),
      job_title: 'Frontend Dev',
      company: 'Google',
      status: 'applied',
      applied_at: new Date()
    })

    expect(result.success).toBe(true)
  })

  it('should fail invalid status', () => {
    const result = ApplicationSchema.safeParse({
      candidate_id: crypto.randomUUID(),
      job_title: 'Frontend Dev',
      company: 'Google',
      status: 'invalid-status',
      applied_at: new Date()
    })

    expect(result.success).toBe(false)
  })

  it('should coerce date correctly', () => {
    const result = ApplicationSchema.safeParse({
      candidate_id: crypto.randomUUID(),
      job_title: 'Frontend Dev',
      company: 'Google',
      status: 'applied',
      applied_at: '2025-01-01T10:00:00Z'
    })

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.applied_at).toBeInstanceOf(Date)
    }
  })

  it('should allow optional fields', () => {
    const result = ApplicationSchema.safeParse({
      candidate_id: crypto.randomUUID(),
      job_title: 'Frontend Dev',
      company: 'Google',
      status: 'applied',
      applied_at: new Date(),
      salary_expectation: null,
      source: null,
      notes: null
    })

    expect(result.success).toBe(true)
  })
})
