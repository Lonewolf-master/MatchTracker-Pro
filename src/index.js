import express from 'express'; // Import express module
const app = express()
const port = 3000; // Define the port number
app.use(express.json())

app.get('/', (req, res) => {    
console.log('Hello from Express server!')
})

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})