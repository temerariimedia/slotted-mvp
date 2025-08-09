import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { campaignRouter } from './routes/campaigns'
import { contentRouter } from './routes/content'
import { googleWorkspaceRouter } from './routes/googleWorkspace'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Routes
app.use('/api/google', googleWorkspaceRouter)
app.use('/api/campaigns', campaignRouter)
app.use('/api/content', contentRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Slotted Backend API',
  })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Slotted Backend running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Frontend CORS: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
})
