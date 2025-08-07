const express = require('express')
const { v4: uuidv4 } = require('uuid')
const db = require('./db')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// --- GET all active locations ---
app.get('/locations', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM locationdetail WHERE Active = 1'
    )
    res.status(200).json(rows)
  } catch (error) {
    console.error('Error fetching locations:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// --- GET a location by Id ---
app.get('/locations/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      'SELECT * FROM locationdetail WHERE Id = ? AND Active = 1',
      [id]
    )
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Location not found or is not active' })
    }
    res.status(200).json(rows[0])
  } catch (error) {
    console.error('Error fetching location:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// --- POST a new location ---
app.post('/locations', async (req, res) => {
  const { Lat, Lng, CF1, CF2, CF3, CF4, TenantId, CreatedBy } = req.body

  // Basic validation
  if (!Lat || !Lng || !TenantId) {
    return res
      .status(400)
      .json({ error: 'Lat, Lng, and TenantId are required fields' })
  }

  const Id = uuidv4()
  const Active = 1
  const CreatedOn = new Date()

  const query = `
        INSERT INTO locationdetail (Id, Lat, Lng, CF1, CF2, CF3, CF4, TenantId, Active, CreatedOn, CreatedBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

  const values = [
    Id,
    Lat,
    Lng,
    CF1,
    CF2,
    CF3,
    CF4,
    TenantId,
    Active,
    CreatedOn,
    CreatedBy,
  ]

  try {
    await db.query(query, values)
    res.status(201).json({ message: 'Location created successfully', Id })
  } catch (error) {
    console.error('Error creating location:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'A location with this Lat, Lng, and TenantId already exists',
      })
    }
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// --- PUT to update an existing location by Id ---
app.put('/locations/:id', async (req, res) => {
  const { id } = req.params
  const { Lat, Lng, CF1, CF2, CF3, CF4, TenantId, UpdatedBy } = req.body

  // Check if location exists and is active
  const [existingLocation] = await db.query(
    'SELECT * FROM locationdetail WHERE Id = ? AND Active = 1',
    [id]
  )
  if (existingLocation.length === 0) {
    return res
      .status(404)
      .json({ error: 'Location not found or is not active' })
  }

  const UpdatedOn = new Date()

  const query = `
        UPDATE locationdetail
        SET Lat = ?, Lng = ?, CF1 = ?, CF2 = ?, CF3 = ?, CF4 = ?, TenantId = ?, UpdatedOn = ?, UpdatedBy = ?
        WHERE Id = ?
    `

  const values = [
    Lat,
    Lng,
    CF1,
    CF2,
    CF3,
    CF4,
    TenantId,
    UpdatedOn,
    UpdatedBy,
    id,
  ]

  try {
    await db.query(query, values)
    res.status(200).json({ message: 'Location updated successfully', Id: id })
  } catch (error) {
    console.error('Error updating location:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'A location with this Lat, Lng, and TenantId already exists',
      })
    }
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// --- DELETE a location by Id (soft delete) ---
app.delete('/locations/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query(
      'UPDATE locationdetail SET Active = 0 WHERE Id = ?',
      [id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Location not found' })
    }
    res.status(200).json({ message: 'Location deactivated successfully' })
  } catch (error) {
    console.error('Error deactivating location:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
