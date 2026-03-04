//Testing the http arcjet security by sending request multiple times
for i in {1..60}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/matches; done
//Testing the websocket arcjet security by sending request multiple times

for(let i=0; i<10;, i++>){
    const socket = new WebSocket('ws://localhost:5000/ws')
    ws.onopen = () =>console.log(`socket ${i} opene`)
     ws.onclose = (e) =>console.log(`socket ${i} closed: ${e.code} ${e.reason}`)
}


The wss.on('upgrade', (request, socket, head) => {}) event listener in Node.js (specifically within the ws library) is used to intercept and handle the initial HTTP/1.1 handshake request before it is upgraded to a persistent WebSocket (or Secure WebSocket) connection.



1)is the server.on in the ws library or it's express build in library
    Neither. server.on belongs to the native Node.js http module.
    Express and the ws library both sit on top of this built-in Node.js functionality. Here is how they relate:
    Node.js http.Server: This is the "base" layer. It provides the .on('upgrade') event.
    Express: It is a framework that handles the logic for standard HTTP requests (GET, POST). When you call app.listen(), Express internally creates a Node.js http.Server.
    ws Library: It is a tool that knows how to speak the WebSocket protocol. It "borrows" the upgrade event from the Node.js server to turn a standard web request into a socket.



===== what is the difference between parse and Safeparse ====
In the context of the Zod validation library, the primary difference is how they handle invalid data: parse throws an error, while safeParse returns a result object. 

1. .parse()
Use this when you have high confidence in your data or want to stop execution immediately if something is wrong. 

Behavior: Validates data and returns it if successful.
Error Handling: If validation fails, it throws a ZodError.
Best For: Internal data flows where an error should be caught by a global try-catch block or middleware. 

2. .safeParse()
Use this for unpredictable data, such as user input or API responses, where you want to handle errors gracefully without crashing the app. 

Behavior: Returns a discriminated union object instead of throwing an exception.
Return Type:
Success: { success: true; data: T }
Failure: { success: false; error: ZodError }
Best For: Logic that uses if/else branches to handle validation results directly. 

