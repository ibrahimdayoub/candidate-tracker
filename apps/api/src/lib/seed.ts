import { ApplicationStatusEnum } from '@candidate-tracker/shared'
import { prisma } from './prisma.js'

async function main () {
  console.log('----- ----- ----- Starting Seeding Process ----- ----- -----')

  await prisma.application.deleteMany()
  await prisma.candidate.deleteMany()

  const statuses = ApplicationStatusEnum.options

  const candidateNames = [
    'Ibrahim Dayoub',
    'Alex Nova',
    'Jordan Blake',
    'Chris Parker',
    'Taylor Morgan',
    'Casey Reed',
    'Dylan Cooper',
    'Skyler White',
    'Rowan Knight',
    'Avery Scott'
  ]

  const companies = [
    'Google',
    'Meta',
    'Amazon',
    'Microsoft',
    'Apple',
    'Netflix',
    'Spotify',
    'Uber',
    'Airbnb',
    'Stripe'
  ]

  const jobTitles = [
    'Senior Fullstack Developer',
    'Frontend Engineer',
    'Backend Engineer',
    'Software Engineer',
    'DevOps Engineer',
    'Cloud Engineer',
    'Data Engineer',
    'Solutions Architect',
    'Technical Lead',
    'Product Manager'
  ]

  const sources = [
    'LinkedIn',
    'Referral',
    'Indeed',
    'Company Website',
    'Hacker News'
  ]

  for (const name of candidateNames) {
    const candidate = await prisma.candidate.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: `+9715${Math.floor(10000000 + Math.random() * 90000000)}`,
        location: ['Dubai', 'Abu Dhabi', 'Riyadh', 'Beirut'][
          Math.floor(Math.random() * 4)
        ],
        linkedin_url: `https://linkedin.com/in/${name
          .toLowerCase()
          .replace(/\s+/g, '')}`,
        notes: 'Top talent identified during seed process.',
        applications: {
          create: Array.from({ length: Math.floor(Math.random() * 3) + 2 }).map(
            () => ({
              job_title:
                jobTitles[Math.floor(Math.random() * jobTitles.length)]!,
              company: companies[Math.floor(Math.random() * companies.length)]!,
              status: statuses[Math.floor(Math.random() * statuses.length)]!,
              applied_at: new Date(
                Date.now() - Math.floor(Math.random() * 1000000000)
              ),
              salary_expectation: Math.floor(5000 + Math.random() * 10000),
              source: sources[Math.floor(Math.random() * sources.length)]!,
              notes: 'Initial application notes.'
            })
          )
        }
      }
    })
    console.log(`Created Candidate: ${candidate.name}`)
  }

  console.log(
    '----- ----- ----- Seeding Finished Successfully ----- ----- -----'
  )
}

main()
  .catch(e => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
