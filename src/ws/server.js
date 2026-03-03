import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../utils/arcjet-security.js";
function sendJson(socket, payload){

    if(socket.readyState !== WebSocket.OPEN) return
    
    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload){

    wss.clients.forEach( client => {
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(payload))
        }
    })
}

export const attchedWebSocketServer = (server)=>{

    server.on('upgrade', async(req, socket, head) =>{

         if(wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req)
                if(decision.isDenied()){

                    if(decision.reason.isRateLimit()){
                        socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n')
                    }else{
                        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
                    }
                    
                    socket.close(code, reason)
                    socket.destroy()
                    return;
                }
                
            } catch (error) {
                console.error("ws upgrade protection error", error)
                socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
                socket.destroy()
                return;
            }
        }
    })

    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024, //1mb if a client sends a message that is larger than 1mb is is automaticaly requesting    
                                //acts as a security measures against memory abuse or flooding
    })

    wss.on('connection', async(socket) =>{
       
        //Ping Pong hearth beat
        socket.isAlive = true // 1. Start fresh and healthy

        socket.on('pong', ()=> { socket.isAlive = true })  // 2. If client responds, they are alive!

        sendJson(socket, {type: 'connected'})

        socket.on('error', console.error)
    })

    const interval = setInterval( ()=>{

        wss.clients.forEach((ws) => {
            // 3. If they didn't respond to the LAST ping, kill them
            if(ws.isAlive === false) return ws.terminate()
            // 4. Set them to false and ask them to prove they are alive again
            ws.isAlive = false;
            // A noop is just an empty function: const noop = () => {};.
            ws.ping() //ping pong hearth beat Every 30 seconds
        });
    }, 30000)

    // 5. The Cleanup 
    // If your WebSocket server shuts down, you must stop the setInterval. If you don't, the timer will keep running in the background, causing a memory leak.
    wss.on('close', ()=> clearInterval(interval))

    //this function is actually called on the router folder
    function broadcastingMatchCreated(match){

        broadcast(wss, {type: 'match_created', data: match})

    }

    //returning the function to be used in other files
    return { broadcastingMatchCreated }
}
