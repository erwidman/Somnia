import sokLib from './client/socket.js'
import services from './client/services.js'
import settings from './client/endpoint.js'

//setup cloud and state
var cloud = require('./somnia_cloud.json')
var state = {}

//setup socket
var ws = null;
var connectionPromise;
if(settings.stage=='development')
    connectionPromise = sokLib.initWebsocket().then(result=>ws=result)


//populate exportObj
const exportObj = {}
for(let service in services){
    service = services[service]
    for(let serviceMethod of Object.keys(service)){
        let targetMethod = service[serviceMethod]
        if(serviceMethod[0]==='_' && settings.stage=='development')
            exportObj[serviceMethod] = params=>targetMethod(ws,params,cloud)
        else
            exportObj[serviceMethod] = params=>targetMethod(params,cloud,state)
    }
}


const proxyHandler = {
    get : 
    (target,prop,argumentList)=>{

            const targetMethod = target[prop]
            const developmentMethod = target[`_${prop}`]

            return async function(...argumentList){
                if(settings.stage=='development' && !ws)
                  await connectionPromise  
                if(settings.stage=='development'){
                  await developmentMethod.apply(this,argumentList)
                  cloud = require('./somnia_cloud.json')
                }
                return targetMethod.apply(this,argumentList)
            }
     
    }
}

const proxy = new Proxy(exportObj,proxyHandler)
console.log(exportObj)

export default proxy