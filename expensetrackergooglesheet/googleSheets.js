const { google } = require('googleapis')
const path = require('path')

const KEY_FILE_PATH = path.join(__dirname, 'searchkota-5d17dfc1ad27.json')
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const SPREADSHEET_ID = '1S1kqBL5euTC02odxPRROO9eEZ-qm9IJl8SX1zqAYE4w'

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: SCOPES,
})

const sheets = google.sheets({ version: 'v4', auth })

/**
 * Gets all data from the sheet, including the generated ID.
 */
async function getAllData() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:G', // Now includes the ID column
  })
  const rows = response.data.values
  if (!rows || rows.length === 0) {
    return []
  }
  const headers = rows[0]
  const data = rows.slice(1)
  return data.map((row) => {
    const expense = {}
    headers.forEach((header, i) => {
      expense[header.toLowerCase()] = row[i]
    })
    expense.id = parseInt(expense.id)
    return expense
  })
}

/**
 * Finds the row index (in the sheet) for a given ID.
 * Returns -1 if not found.
 */
async function findRowIndexById(id) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:A', // Only check the ID column
  })
  const ids = response.data.values.flat()
  const rowIndex = ids.findIndex((rowId) => rowId == id)
  return rowIndex === -1 ? -1 : rowIndex + 1 // +1 to convert to 1-based row number
}

/**
 * Gets the next available unique ID.
 */
async function getNextId() {
  const expenses = await getAllData()
  const maxId = expenses.reduce((max, exp) => Math.max(max, exp.id), 0)
  return maxId + 1
}

// CREATE: Appends a new row to the sheet with an auto-generated ID
async function createExpense(rowData) {
  const newId = await getNextId()
  const newRow = [newId, ...rowData]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:G',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [newRow],
    },
  })
  return newId
}

// UPDATE: Updates a specific row in the sheet based on ID
async function updateExpense(id, rowData) {
  const rowIndex = await findRowIndexById(id)
  if (rowIndex === -1) {
    throw new Error('Expense not found')
  }
  const updatedRow = [id, ...rowData]
  const range = `Sheet1!A${rowIndex}:G${rowIndex}`
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [updatedRow],
    },
  })
}

// DELETE: Deletes a specific row from the sheet based on ID
async function deleteExpense(id) {
  const rowIndex = await findRowIndexById(id)
  if (rowIndex === -1) {
    throw new Error('Expense not found')
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  })
}

module.exports = { getAllData, createExpense, updateExpense, deleteExpense }
