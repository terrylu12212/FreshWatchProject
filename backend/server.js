import dotenv from 'dotenv'
import express from 'express'
import connectDB from './config/connectDB.js'
import userRoutes from './routes/user.js'
import cors from 'cors'
import helmet from 'helmet'

dotenv.config()

// connect to the database
connectDB();


// create the express application
const app = express()


// middleware
// app.use((req, res, next) => {
//   console.log(req.path, req.method)
//   next()
// })
app.use(helmet())                         
app.use(cors({                            
  origin: ['http://localhost:4000', 'https://your-frontend.com'], // need to change to match our frontend
  credentials: true                       
}))

app.use(express.json({ limit: '100kb' })) 

// routes
app.use('/api/user', userRoutes)

// listen for requests
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})