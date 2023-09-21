import app from './app.js';
import mongoose from 'mongoose';
import 'dotenv/config'

const {DB_HOST, PORT = 3000} = process.env

mongoose.connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful")
    app.listen(PORT, () => {
      console.log("Server running. Use our API on port: 3000")
    })
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })


