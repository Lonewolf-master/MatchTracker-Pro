import { WebSocket, WebSocketServer } from "ws";

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

    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024, //1mb if a client sends a message that is larger than 1mb is is automaticaly requesting    
                                //acts as a security measures against memory abuse or flooding
    })

    wss.on('connection', (socket) =>{
        sendJson(socket, {type: 'connected'})
        socket.on('error', console.error)
    })

    //this function is actually called on the router folder
    function broadcastingMatchCreated(match){

        broadcast(wss, {type: 'match_created', data: match})

    }

    //returning the function to be used in other files
    return { broadcastingMatchCreated }
}
