const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const waitlistRoutes = require('./routes/waitlist')
const { publicRouter, adminRouter } = require('./routes/insight')  // ← updated

const app = express()
const port = Number(process.env.PORT || 5000)
const host = process.env.HOST || '127.0.0.1'
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const allowedOrigins = [
  frontendOrigin,
  'https://intuvision.pro',
  'https://www.intuvision.pro',
  'https://legacyx.pro',
  'https://www.legacyx.pro',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
]

async function isBackendAlreadyRunning(checkHost, checkPort) {
  try {
    const res = await fetch(`http://${checkHost}:${checkPort}/api/health`)
    if (!res.ok) return false
    const data = await res.json().catch(() => ({}))
    return data?.ok === true
  } catch {
    return false
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      const normalizedOrigin = origin.replace(/\/$/, '')
      if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true)
      if (
        normalizedOrigin.startsWith('http://localhost:') ||
        normalizedOrigin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true)
      }
      return callback(new Error('Not allowed by CORS'))
    },
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api', waitlistRoutes)
app.use('/api/insights', publicRouter)        // ← public
app.use('/api/admin/insights', adminRouter)   // ← admin only

function startServer(preferredPort) {
  const server = app.listen(preferredPort, host, () => {
    console.log(`Backend listening on http://${host}:${preferredPort}`)
  })

  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE') {
      const alreadyRunning = await isBackendAlreadyRunning(host, preferredPort)
      if (alreadyRunning) {
        console.error(
          `\nBackend is already running on http://${host}:${preferredPort}.\n` +
            'Stop the existing process first (Ctrl+C) before starting again.\n',
        )
        process.exit(0)
      }
      console.error(
        `\nPort ${preferredPort} is already in use.\n` +
          'Run: taskkill /F /IM node.exe  (Windows)\n' +
          'Then restart with: npm run dev\n',
      )
      process.exit(1)
    }
    console.error('Failed to start backend server:', err)
    process.exit(1)
  })
}

startServer(port)