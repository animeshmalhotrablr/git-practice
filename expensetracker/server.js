const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
// const port = 3000
const port = process.env.APP_PORT // || 3001 // Use the port from environment variable or default to 3001
const pool = require('./db')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const path = require('path')
const { appendRowToSheet } = require('./googleSheets') // Import the helper function

// Use the cors middleware before your routes
app.use(cors()) // <-- Add this line

// Configure CORS to only allow your React frontend's domain
// const corsOptions = {
//   origin: true,
//   optionsSuccessStatus: 200, // For legacy browser support
// }

// app.use(cors(corsOptions))

app.use(express.json())

// Set up the environment variable check
const enableSheetLogging = process.env.ENABLE_SHEET_LOGGING === 'true'

// Load the Swagger file
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'))

// Use swagger-ui-express to serve the API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// 1. POST /expenses - Create a new expense record
app.post('/expenses', async (req, res) => {
  const { date, description, category, payment_mode, person, amount } = req.body
  try {
    const [result] = await pool.execute(
      'INSERT INTO expenses (date, description, category, payment_mode, person, amount) VALUES (?, ?, ?, ?, ?, ?)',
      [date, description, category, payment_mode, person, amount]
    )
    res
      .status(201)
      .json({ id: result.insertId, message: 'Expense added successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create expense' })
  }
})

// 2. GET /expenses - Get all expense records
app.get('/expenses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM expenses')
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to retrieve expenses' })
  }
})

// 3. GET /expenses/:id - Get a single expense record by ID
app.get('/expenses/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await pool.execute('SELECT * FROM expenses WHERE id = ?', [
      id,
    ])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to retrieve expense' })
  }
})

// 4. PUT /expenses/:id - Update an existing expense record by ID
app.put('/expenses/:id', async (req, res) => {
  const { id } = req.params
  const { date, description, category, payment_mode, person, amount } = req.body
  try {
    const [result] = await pool.execute(
      'UPDATE expenses SET date = ?, description = ?, category = ?, payment_mode = ?, person = ?, amount = ? WHERE id = ?',
      [date, description, category, payment_mode, person, amount, id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' })
    }
    res.json({ message: 'Expense updated successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update expense' })
  }
})

// 5. DELETE /expenses/:id - Delete an expense record by ID
app.delete('/expenses/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.execute('DELETE FROM expenses WHERE id = ?', [
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' })
    }
    res.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete expense' })
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
