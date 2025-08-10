import React, { useState, useEffect } from 'react'
import './App.css'

const API_URL = process.env.REACT_APP_API_URL

function App() {
  const [expenses, setExpenses] = useState([])
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    category: '',
    payment_mode: '',
    person: '',
    amount: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch all expenses from the API
  const fetchExpenses = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch expenses')
      const data = await response.json()
      setExpenses(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Run on initial component mount to fetch data
  useEffect(() => {
    fetchExpenses()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Simple validation for mandatory fields
    const requiredFields = [
      'date',
      'description',
      'category',
      'payment_mode',
      'person',
      'amount',
    ]
    const isFormValid = requiredFields.every(
      (field) => formData[field] && formData[field].trim() !== ''
    )
    if (!isFormValid) {
      setError('All fields are mandatory.')
      return
    }

    try {
      if (editingId) {
        // Update an existing expense
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        // Create a new expense
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      setFormData({
        date: '',
        description: '',
        category: '',
        payment_mode: '',
        person: '',
        amount: '',
      })
      setEditingId(null)
      fetchExpenses() // Refresh the list
    } catch (error) {
      setError('Failed to save expense. Please try again.')
    }
  }

  // Handle delete operation
  const handleDelete = async (id) => {
    setError('')
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      fetchExpenses() // Refresh the list
    } catch (error) {
      setError('Failed to delete expense. Please try again.')
    }
  }

  // Handle edit button click
  const handleEdit = (expense) => {
    setEditingId(expense.id)
    setFormData({
      date: expense.date, // <-- Use the expense's existing date
      description: expense.description,
      category: expense.category,
      payment_mode: expense.payment_mode,
      person: expense.person,
      amount: expense.amount,
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Expense Tracker</h1>
      </header>
      <main>
        {/* Form for adding/editing expenses */}
        <div className="form-container">
          <h2>{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              // The disabled attribute is removed to allow date selection
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="payment_mode"
              placeholder="Payment Mode"
              value={formData.payment_mode}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="person"
              placeholder="Person"
              value={formData.person}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <button type="submit">
              {editingId ? 'Update Expense' : 'Add Expense'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData({
                    date: '',
                    description: '',
                    category: '',
                    payment_mode: '',
                    person: '',
                    amount: '',
                  })
                }}
              >
                Cancel
              </button>
            )}
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>

        <hr />

        {/* List of all expenses */}
        <div className="table-container">
          <h2>All Expenses</h2>
          {loading ? (
            <p>Loading expenses...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Payment Mode</th>
                  <th>Person</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.id}</td>
                    <td>{expense.date}</td>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td>{expense.payment_mode}</td>
                    <td>{expense.person}</td>
                    <td>{expense.amount}</td>
                    <td>
                      <button onClick={() => handleEdit(expense)}>Edit</button>
                      <button onClick={() => handleDelete(expense.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
