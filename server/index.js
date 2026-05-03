import dotenv from 'dotenv'

import app from './app.js'
import connectDatabase from './config/database.js'

dotenv.config()

const port = Number(process.env.PORT) || 5001

const startServer = async () => {
  await connectDatabase(process.env.MONGODB_URI)

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
