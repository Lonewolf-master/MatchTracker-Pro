import express from 'express'; // Import express module
import { configDotenv } from "dotenv";
import matchRouter from './routes/matches.js'

configDotenv(); // Load environment variables from .env
const port = process.env.PORT || 3000 ; // Define the port number

const app = express()

app.use(express.json())
app.use('/matches', matchRouter)

app.get('/', (req, res) => {    
console.log('Hello from Express server!')
})


app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})
