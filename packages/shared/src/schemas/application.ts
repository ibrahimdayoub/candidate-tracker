import { z } from 'zod'

export const ApplicationStatusEnum = z.enum([
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected'
])

export const ApplicationSchema = z.object({
  id: z.string().uuid().optional(),
  candidate_id: z.string().uuid(),
  job_title: z.string().min(2),
  company: z.string(),
  status: ApplicationStatusEnum,
  applied_at: z.coerce.date(),
  salary_expectation: z.number().nullable().optional(),
  source: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
})

export const ApplicationWithCandidateSchema = ApplicationSchema.extend({
  candidate: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string()
  })
})

export type Application = z.infer<typeof ApplicationSchema>
export type ApplicationWithCandidate = z.infer<
  typeof ApplicationWithCandidateSchema
>
export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>
