import 'dotenv/config'

import cors from 'cors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js'

const app = express()

const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]

const allowedOrigins = [...new Set([...configuredOrigins, ...defaultDevOrigins])]

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors(corsOptions))
app.use(express.json())

const distPath = path.resolve(__dirname, '..', 'dist')

app.use(express.static(distPath))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

// Fallback to index.html for SPA routing — only for HTML GET requests so that
// missing asset requests still fall through to the 404 handler.
app.use((request, response, next) => {
  const isGetRequest = request.method === 'GET'
  const wantsHtml = request.accepts('html')
  const isAssetRequest = path.extname(request.path) !== ''
  const isApiRequest = request.path.startsWith('/api/')

  if (!isGetRequest || !wantsHtml || isAssetRequest || isApiRequest) {
    next()
    return
  }

  const indexPath = path.join(distPath, 'index.html')
  response.sendFile(indexPath)
})

app.use(notFoundHandler)

app.use((err, request, response, next) => {
  console.error(`[errorHandler] ${request.method} ${request.originalUrl} →`, err)
  errorHandler(err, request, response, next)
})

export default app
