const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const jwt = require('jsonwebtoken')
const pool = require('./db') // The MySQL connection pool
require('dotenv').config()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value

        // --- CUSTOM AUTHORIZATION LOGIC (Database Check) ---
        const [rows] = await pool.query(
          'SELECT roles FROM users WHERE email = ?',
          [email]
        )

        let scopes = []
        if (rows.length > 0) {
          // If user is found, get their custom roles (scopes)
          scopes = rows[0].roles.split(',')
        } else {
          // Option 1: Reject unauthorized emails
          // return done(null, false, { message: 'Email not authorized.' });

          // Option 2: Assign default scopes for valid sign-in but no custom roles
          scopes = ['guest:read']
        }

        // Store Login Event
        const ipAddress = 'N/A' // In a real app, you'd get this from the request
        await pool.query(
          'INSERT INTO login_events (user_email, ip_address) VALUES (?, ?)',
          [email, ipAddress]
        )

        const user = {
          id: profile.id,
          email: email,
          name: profile.displayName,
          scopes: scopes, // Inject custom scopes here
        }

        // --- TOKEN INJECTION (Custom Bearer Token Generation) ---
        // This JWT will be the 'Bearer Token' for subsequent API calls
        const token = jwt.sign(
          { email: user.email, scopes: user.scopes },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        )

        // Pass the user and the custom token back
        return done(null, { user, token })
      } catch (err) {
        console.error('Database/Auth Error:', err)
        return done(err, null)
      }
    }
  )
)

// Not strictly needed for REST API, but good practice for session management
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

module.exports = passport
