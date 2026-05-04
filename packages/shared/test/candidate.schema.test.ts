import { describe, it, expect } from 'vitest'
import { CandidateSchema } from '../src/schemas/candidate'

describe('Candidate Schema', () => {
  it('should pass with valid candidate', () => {
    const result = CandidateSchema.safeParse({
      name: 'Ibrahim',
      email: 'test@example.com',
      phone: '123456',
      location: 'Berlin',
      linkedin_url: 'https://linkedin.com/in/test',
      notes: 'some notes'
    })

    expect(result.success).toBe(true)
  })

  it('should fail when name is too short', () => {
    const result = CandidateSchema.safeParse({
      name: 'A',
      email: 'test@example.com'
    })

    expect(result.success).toBe(false)
  })

  it('should fail invalid email', () => {
    const result = CandidateSchema.safeParse({
      name: 'Ibrahim',
      email: 'invalid-email'
    })

    expect(result.success).toBe(false)
  })

  it('should allow optional nullable fields', () => {
    const result = CandidateSchema.safeParse({
      name: 'Ibrahim',
      email: 'test@example.com',
      phone: null,
      location: null
    })

    expect(result.success).toBe(true)
  })
})
