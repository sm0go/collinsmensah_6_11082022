// Variables
const express = require('express')
const app = express()
const path = require('path');
const headers = require('cors')

// Routes
const sauceRoutes = require('./router/sauce')
const userRoutes = require('./router/user')

// Mongoose Connect
require('./mongoose/connect');

// Headers CORS and Body Parse
app.use(headers());
app.use(express.json());

// Requests
app.use('/api/sauces', sauceRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))

// App export
module.exports = app