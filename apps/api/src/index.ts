import 'dotenv/config'
import { buildApp } from './app.js'

const start = async () => {
  const app = buildApp()

  try {
    const PORT = Number(process.env.PORT) || 3001

    await app.listen({
      port: PORT,
      host: '0.0.0.0'
    })

    app.log.info(`Server running on http://localhost:${PORT}/api`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
