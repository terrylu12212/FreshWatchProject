import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_CONNECTION_STRING)
    console.log('Connected to DB...')
  } catch (error) {
    console.error(`Error connecting to DB: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
