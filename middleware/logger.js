const pool = require('../config/db')

const auditLogger = async (req, res, next) => {
  const userEmail = req.user ? req.user.email : 'GUEST'

  // Defer logging until AFTER the request has finished to capture the status code
  res.on('finish', async () => {
    try {
      await pool.query(
        'INSERT INTO audit_logs (user_email, action_type, endpoint, status_code) VALUES (?, ?, ?, ?)',
        [userEmail, req.method, req.originalUrl, res.statusCode]
      )
    } catch (err) {
      console.error('Audit Log DB Error:', err)
    }
  })

  next()
}

module.exports = auditLogger
