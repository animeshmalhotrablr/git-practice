const express = require('express')
const passport = require('passport')
const router = express.Router()

// 1. Initiate Google Authentication
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    // prompt: 'consent',
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

    // console.log('Authentication successful for user:', req.user.user.email)
    // console.log('Issued JWT with scopes:', req.user.user.scopes)

    // console.log('Token:', token)
    // console.log('Redirecting to frontend with token...')

    // In a production setup, you would typically redirect to a front-end
    // application, passing the token in a query param or a secure cookie.

    // res.status(200).json({
    //   message: 'Authentication successful. Use this token for API calls.',
    //   token: token, // THE BEARER TOKEN with SCOPES
    //   user: req.user.user,
    // })

    // res.redirect('http://localhost:3001/dashboard')
    res.redirect(`http://localhost:3001/auth-success?token=${token}`)
  }
)

// 3. Logout
router.get('/google/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    res.redirect('/') // Redirect to homepage after logout
  })
})

// 4. Current User Info (Protected Route Example)
const { authenticateJWT } = require('../middleware/auth')

const ensureAuthenticated = (req, res, next) => {
  authenticateJWT(req, res, next)
}

router.get('/api/current-user', ensureAuthenticated, (req, res) => {
  res.json({ user: req.user })
})

router.post('/admin/invite', ensureAuthenticated, (req, res) => {
  console.log('Current user scopes:', req.user.scopes)

  // Only allow if user has 'admin' scope
  if (!req.user.scopes.includes('admin')) {
    return res
      .status(403)
      .json({ message: 'Forbidden: Admin scope required to invite users.' })
  }

  const { inviteeEmail, selectedRoles } = req.body
  // Here you would typically create an invitation record in the database
  // and send an invitation email to the user.

  res.json({
    message: `Invitation sent to ${inviteeEmail} with scopes: ${selectedRoles.join(
      ', '
    )}`,
  })
})

// 5. Login Failure Route
router.get('/login-failure', (req, res) => {
  res
    .status(401)
    .json({ message: 'Authentication failed or email not authorized.' })
})

module.exports = router
