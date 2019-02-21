import sokLib from './client/socket.js'
import cognito from './client/AWS_handlers/cognito_handler.js'



var ws = null;
var connectionPromise = sokLib.initWebsocket().then(result=>ws=result)
const signUp = params=>cognito.signUp(ws,params)


const exportObj = {
    signUp,
}

const proxyHandler = {
    get : 
    (target,prop,argumentList)=>{
            const targetMethod = target[prop]
            return async function(...argumentList){
                if(!ws)
                  await connectionPromise  
                return targetMethod.apply(this,argumentList)
            }
     
    }
}

const proxy = new Proxy(exportObj,proxyHandler)

export default proxy