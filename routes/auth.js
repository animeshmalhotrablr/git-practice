const express = require('express')
const passport = require('passport')
const router = express.Router()

// 1. Initiate Google Authentication
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
)

// 2. Google Callback (where custom authZ and token injection happens)
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failure' }),
  (req, res) => {
    // Successful authentication. `req.user` contains { user: {...}, token: '...' }
    // Inject the custom JWT into a redirect URL or send as a JSON response
    const token = req.user.token

    // In a production setup, you would typically redirect to a front-end
    // application, passing the token in a query param or a secure cookie.
    res.status(200).json({
      message: 'Authentication successful. Use this token for API calls.',
      token: token, // THE BEARER TOKEN with SCOPES
      user: req.user.user,
    })
  }
)

router.get('/login-failure', (req, res) => {
  res
    .status(401)
    .json({ message: 'Authentication failed or email not authorized.' })
})

module.exports = router
