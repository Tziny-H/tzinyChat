const mysql = require('mysql')

const db = mysql.createPool({
    host: '127.0.0.1',
    user: "root",
    password: 'root',
    database: 'ys_project_api'
})

module.exports = db