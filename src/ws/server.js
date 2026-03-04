import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../utils/arcjet-security.js";

const matchSubscribers = new Map();


function subscribe(matchId, socket){
    if(!matchSubscribers.has(matchId)){
        matchSubscribers.set(matchId, new Set())
    }
    matchSubscribers.get(matchId).add(socket);
}

function unsubscribe(matchId, socket){
    const subscribers = matchSubscribers.get(matchId);
    if(!subscribers) return;
    subscribers.delete(socket);
    if(subscribers.size === 0){
        matchSubscribers.delete(matchId)
    }
}

function cleanupSubscriptions(socket){
    for(const matchId of socket.subscriptions){
        unsubscribe(matchId, socket)
    }
}

function broadcastToMatch(matchId, payload){
    const subscribers = matchSubscribers.get(matchId);
    if(!subscribers || subscribers.size === 0)return;
    const message = JSON.stringify(payload);

    for(const client of subscribers){
        if(client.readyState === WebSocket.OPEN){
            client.send(message)
        }
    }
}

function sendJson(socket, payload){

    if(socket.readyState !== WebSocket.OPEN) return
    
    socket.send(JSON.stringify(payload));
}

function broadcastToAll(wss, payload){

    wss.clients.forEach( client => {
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(payload))
        }
    })
}

function handleMessage(socket, data){
    let message
    try {
        message = JSON.parse(data.toString());
    } catch (error) {
        sendJson(socket, {type: 'error', message: "Invalid JSON"})
    }

    if(message?.type === "subscribe" && Number.isInteger(message.matchId)){
        subscribe(message.matchId, socket);
        socket.subscriptions.add(message.matchId);
        sendJson(socket, {type: 'subscribed', matchId: message.matchId})

    }

    if(message?.type === "unsubscribe" && Number.isInteger(message.matchId)){
        unsubscribe(message.matchId, socket);
        socket.subscriptions.delete(message.matchId);
        sendJson(socket, {type: 'unsubscribed', matchId: message.matchId})

    }
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
        //attatching a new set allowing the socket to remember what it subscribed to
        socket.subscriptions = new Set();

        sendJson(socket, {type: 'connected'})

        socket.on('message', (data)=>{
            handleMessage(socket, data);
        })

        socket.on('error', ()=>{
            socket.terminate();
        })
        socket.on('close', ()=>{
            cleanupSubscriptions(socket)
        })

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

        broadcastToAll(wss, {type: 'match_created', data: match})

    }
    function broadcastCommentary(matchId, comment){
        broadcastToMatch(matchId, {type:'commentary', data: comment})
    }

    //returning the function to be used in other files
    return { broadcastingMatchCreated , broadcastCommentary}
}
