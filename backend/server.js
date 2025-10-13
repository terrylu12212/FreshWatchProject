require('dotenv').config()
const express = require('express')
const connectDB = require('./config/connectDB')

// connect to the database
connectDB();


// create the express application
const app = express()


// middleware
app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})


// routes
app.get('/', (req, res) => {
  res.json({mssg: 'Welcome to the app'})
})

// listen for requests
app.listen(process.env.PORT, () => {
  console.log("Listening on port 4000")
})