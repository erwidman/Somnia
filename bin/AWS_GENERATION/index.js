
const AWS = require('aws-sdk')
const fs = require('fs')
const path = require("path")


//generate request router from 
const requestRouter = {}
fs.readdirSync(path.join(__dirname,'generators'))
.forEach(file=>requestRouter[path.parse(file).name]=require(path.join(__dirname,'generators',file)))

//get cloudSpec
const cloudSpec = JSON.parse(fs.readFileSync(path.join(global.projDir,'Infrastructure.json')))







module.exports = (request,ws)=>{
    if(!AWS.config.credentials || AWS.config.credentials.expired)
        throw new Error("INVALID_AWS_CREDENTIALS")
    requestRouter[request.action](request.params,ws,cloudSpec)
}
