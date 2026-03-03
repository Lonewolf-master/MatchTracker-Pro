import express from 'express'; // Import express module
import { configDotenv } from "dotenv";
import { createServer } from 'http'; // Built-in Node module
import { attchedWebSocketServer } from './ws/server.js'
import matchRouter from './routes/matches.js'
import { arcjetProtection } from "./middleware/arcjet.middleware.js"

configDotenv(); // Load environment variables from .env
const app = express()

const PORT = process.env.PORT || 3000 ; // Define the port number
const HOST = process.env.HOST || '0.0.0.0' ;

// 1. Create the HTTP Server manually using the Express app
const server = createServer(app);

app.use(arcjetProtection)
app.use(express.json())

app.get('/', (req, res) => {     
console.log('Hello from Express server!')
})

const { broadcastingMatchCreated } = attchedWebSocketServer(server)

// accessible globally across your entire application without needing to import it in every file
// app.locals: This is an object provided by Express.js that persists throughout the life of the application.
// The Benefit: Any Route Handler or Middleware can now access that specific function using req.app.locals.broadcastingMatchCreated. or res.app.locals.broadcastingMatchCreated.
app.locals.broadcastingMatchCreated = broadcastingMatchCreated

app.use('/matches', matchRouter)

server.listen(PORT,HOST,()=>{

    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `ws://${HOST}:${PORT}`;
    console.log(`Server is running on ${baseUrl}...`);
    console.log(`WebSocket Server is running on ${baseUrl.replace('http','ws')}/ws...`)
})

export default server
