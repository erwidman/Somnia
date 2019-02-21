import endpoint from './endpoint.js'


const initWebsocket = ()=>{
    return new Promise((resolve, reject) => {
        let ws = new WebSocket(`ws://localhost:${endpoint}`)
        ws.onmessage = event=>{
            if(event.data==="SOMNIA_HANDSHAKE")
                resolve(ws)
        }
    })
    .catch(err=>null)
}

const sendMessage = (ws,msg)=>{
    if(ws)
        ws.send(JSON.stringify(msg))
    else
        throw new Error('WEBSOCKET_NOT_CONNECTED')
}


export default {
                    initWebsocket,
                    sendMessage
                }