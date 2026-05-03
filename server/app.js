import 'dotenv/config'

import cors from 'cors'
import express from 'express'
import fs from 'fs'
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

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors(corsOptions))
app.use(express.json())

// Serve static client build unconditionally so assets are never caught by API
// routes or the error handler (single-service deployment with Vite dist/).
const distPath = path.resolve(__dirname, '..', 'dist')

console.log(`[static] Registering express.static for distPath: ${distPath}`)
console.log(`[static] dist/ exists: ${fs.existsSync(distPath)}`)

if (fs.existsSync(distPath)) {
  try {
    const entries = fs.readdirSync(distPath)
    console.log(`[static] dist/ contents: ${entries.join(', ')}`)
  } catch (err) {
    console.error('[static] Failed to read dist/ directory:', err)
  }
} else {
  console.error('[static] WARNING: dist/ directory not found — static assets will not be served')
}

// Wrap express.static in a small shim that logs errors instead of swallowing them.
app.use((request, response, next) => {
  express.static(distPath)(request, response, (err) => {
    if (err) {
      console.error(`[static] express.static error for ${request.path}:`, err)
      next(err)
    } else {
      next()
    }
  })
})

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

// Debug route — returns distPath, whether it exists, and its top-level contents.
// Remove once the static-serving issue is resolved.
app.get('/debug/dist', (_request, response) => {
  const exists = fs.existsSync(distPath)
  let contents = null
  let assetsContents = null
  let error = null

  if (exists) {
    try {
      contents = fs.readdirSync(distPath)
      const assetsPath = path.join(distPath, 'assets')
      if (fs.existsSync(assetsPath)) {
        assetsContents = fs.readdirSync(assetsPath)
      }
    } catch (err) {
      error = err.message
    }
  }

  response.json({
    distPath,
    exists,
    contents,
    assetsContents,
    error,
    cwd: process.cwd(),
    __dirname,
  })
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
  console.log(`[spa-fallback] Sending index.html from: ${indexPath} (exists: ${fs.existsSync(indexPath)})`)
  response.sendFile(indexPath)
})

app.use(notFoundHandler)

// Full-stack error handler — logs the complete error before delegating to the
// JSON error handler so the stack trace is always visible in server logs.
app.use((err, request, response, next) => {
  console.error(`[errorHandler] ${request.method} ${request.originalUrl} →`, err)
  errorHandler(err, request, response, next)
})

export default app
