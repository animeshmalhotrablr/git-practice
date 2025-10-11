const jwt = require('jsonwebtoken')
require('dotenv').config()

// Middleware to verify JWT and extract user/scopes
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(' ')[1] // Expects 'Bearer TOKEN'

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        // Token is invalid or expired
        return res
          .status(403)
          .json({ message: 'Forbidden: Invalid or expired token.' })
      }
      req.user = user // user now contains { email: ..., scopes: [...] }
      next()
    })
  } else {
    res.status(401).json({ message: 'Unauthorized: No token provided.' })
  }
}

// Middleware to check if the user has a required scope
const authorizeScope = (requiredScope) => {
  return (req, res, next) => {
    if (!req.user || !req.user.scopes || req.user.scopes.length === 0) {
      return res
        .status(403)
        .json({ message: 'Forbidden: No scopes found on token.' })
    }

    const hasScope =
      req.user.scopes.includes(requiredScope) ||
      req.user.scopes.includes('admin')

    if (hasScope) {
      next()
    } else {
      res.status(403).json({
        message: `Forbidden: Missing required scope: ${requiredScope}`,
      })
    }
  }
}

module.exports = { authenticateJWT, authorizeScope }
