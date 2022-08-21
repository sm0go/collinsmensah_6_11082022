require('dotenv').config()
const http = require('http')
const app = require('./app')

const server = http.createServer(app)

app.set(3000)
server.listen(3000)

