import sokLib from '../socket.js'

const signUp = (ws,params)=>{
    ws.onmessage = event=>{
        console.log(event)
    }
    sokLib.sendMessage(ws,{action:"signUpBuilder",params:params})

}


export default {signUp}