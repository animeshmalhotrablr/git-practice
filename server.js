const express = require('express')
const session = require('express-session') // Required for passport
const passport = require('./config/passport')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const auditLogger = require('./middleware/logger')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Use the cors middleware before your routes
app.use(cors()) // <-- Add this line

// Middleware Setup
app.use(express.json())
app.use(
  session({
    secret: process.env.JWT_SECRET, // Use a session secret
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
)
app.use(passport.initialize())
app.use(passport.session())

// --- Audit Logger Middleware ---
// Apply to all routes after authentication/token validation (not to auth routes)
app.use('/api', auditLogger)

// --- ROUTES ---

// 1. Authentication Routes (Sign-in)
app.use('/auth', authRoutes)

// 2. API Routes (Protected Resources & Logs)
// Note: /api/profile uses authenticateJWT internally to validate the Bearer token
app.use('/api', userRoutes)

// 3. Swagger Documentation
const swaggerDocument = YAML.load('./swagger/swagger.yaml')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/', (req, res) => {
  res.send(
    'API is running. Check <a href="/api-docs">/api-docs</a> for endpoints.'
  )
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
