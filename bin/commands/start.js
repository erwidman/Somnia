const fs = require('fs')
const webSocket = require('ws')
const path = require('path')
const pkgUp = require('pkg-up')




function handleConnection(ws,state){
    ws.send('SOMNIA_HANDSHAKE')
    ws.on('message',msg=>state.handleRequest(JSON.parse(msg),ws))
}




const execute = (port,state)=>{
      
      fs.writeFile(
          path.join(global.projDir,'client','endpoint.js'),
          `export default ${port}`,
          {flag:'w+'},
          err=>{
              if(err){
                  console.error(err)
                  process.exit(1)
              }
          }
     )
      state.socketServer = new webSocket.Server({port})
      state.socketServer.on('connection',ws=>handleConnection(ws,state))
}


module.exports = (state,program)=>{
    program
    .command('start <port>')
    .action(port=>execute(port,state))

}
