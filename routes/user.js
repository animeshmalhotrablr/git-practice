const express = require('express')
const { authenticateJWT, authorizeScope } = require('../middleware/auth')
const pool = require('../config/db')
const router = express.Router()

// --- PROTECTED ENDPOINTS ---

// Example: Requires 'user:read' scope
router.get(
  '/profile',
  authenticateJWT,
  //   authorizeScope('user:read'),
  authorizeScope('guest:read'),
  (req, res) => {
    // req.user has been injected by authenticateJWT
    res.json({
      message: 'Welcome to your protected profile!',
      data: {
        email: req.user.email,
        scopes: req.user.scopes,
      },
    })
  }
)

// Example: Requires 'user:write' scope (e.g., updating data)
router.post(
  '/data',
  authenticateJWT,
  authorizeScope('data:write'),
  (req, res) => {
    res.json({
      message: `Data created successfully by ${req.user.email}.`,
      scope_used: 'data:write',
    })
  }
)

// --- LOG/AUDIT ENDPOINTS ---

// Requires 'admin' scope to view all logs
router.get(
  '/logs/login',
  authenticateJWT,
  authorizeScope('admin'),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM login_events ORDER BY login_time DESC'
      )
      res.json(rows)
    } catch (error) {
      res.status(500).json({
        message: 'Error retrieving login events.',
        error: error.message,
      })
    }
  }
)

// Requires 'admin' scope to view all audit logs
router.get(
  '/logs/audit',
  authenticateJWT,
  authorizeScope('admin'),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM audit_logs ORDER BY timestamp DESC'
      )
      res.json(rows)
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error retrieving audit logs.', error: error.message })
    }
  }
)

module.exports = router
