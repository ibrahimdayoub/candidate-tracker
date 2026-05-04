import { z } from 'zod'
import { ApplicationSchema } from './application'

export const CandidateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional().or(z.literal('')),
  notes: z.string().nullable().optional()
})

export const CandidateWithCountSchema = CandidateSchema.extend({
  _count: z.object({
    applications: z.number()
  })
})

export const CandidateWithApplicationsSchema = CandidateSchema.extend({
  applications: z.array(ApplicationSchema)
})

export type Candidate = z.infer<typeof CandidateSchema>
export type CandidateWithCount = z.infer<typeof CandidateWithCountSchema>
export type CandidateWithApplications = z.infer<typeof CandidateWithApplicationsSchema>