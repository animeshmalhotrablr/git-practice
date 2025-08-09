const express = require('express')
const {
  getAllData,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('./googleSheets')
const app = express()
const port = 3000

app.use(express.json())

function formatRow(body) {
  const { date, description, category, payment_mode, person, amount } = body
  return [date, description, category, payment_mode, person, amount]
}

// 1. POST /expenses - Create a new expense record with a unique ID
app.post('/expenses', async (req, res) => {
  try {
    const rowData = formatRow(req.body)
    const newId = await createExpense(rowData)
    res.status(201).json({
      id: newId,
      message: 'Expense added to Google Sheet successfully',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create expense' })
  }
})

// 2. GET /expenses - Get all expense records
app.get('/expenses', async (req, res) => {
  try {
    const expenses = await getAllData()
    res.json(expenses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to retrieve expenses' })
  }
})

// 3. GET /expenses/:id - Get a single expense record by ID
app.get('/expenses/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const expenses = await getAllData()
    const expense = expenses.find((exp) => exp.id === id)

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' })
    }
    res.json(expense)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to retrieve expense' })
  }
})

// 4. PUT /expenses/:id - Update an existing expense record by ID
app.put('/expenses/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const rowData = formatRow(req.body)
    await updateExpense(id, rowData)
    res.json({ message: 'Expense updated successfully' })
  } catch (error) {
    console.error(error)
    if (error.message === 'Expense not found') {
      return res.status(404).json({ error: 'Expense not found' })
    }
    res.status(500).json({ error: 'Failed to update expense' })
  }
})

// 5. DELETE /expenses/:id - Delete an expense record by ID
app.delete('/expenses/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    await deleteExpense(id)
    res.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error(error)
    if (error.message === 'Expense not found') {
      return res.status(404).json({ error: 'Expense not found' })
    }
    res.status(500).json({ error: 'Failed to delete expense' })
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
