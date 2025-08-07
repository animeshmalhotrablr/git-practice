const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'mysql-713b71f-searchkota2021-4fa5.l.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_zjOCKPVT6FEgwOre0SI',
  database: 'defaultdb',
  port: 10073, // <-- Added port configuration
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

module.exports = pool
