const path = require('path')
const {exec} = require('child_process')
const {promisify} = require('util')
const promiseExec = promisify(exec)
const pkgUp = require('pkg-up')
const fs = require('fs')
const promiseWrite = promisify(fs.writeFile)




const verifyInstallation = ()=>{
    return promiseExec('npm ls --depth=0 --json')
    .then(stdout=>{
       let obj = JSON.parse(stdout.stdout)
       return {err:!obj.dependencies || obj.dependencies.somnia===undefined}
    })  
    .catch(err=>({err}))
}

const exit = (state)=>{
    if(state.socketServer){
        for(const client of state.socketServer)
            client.close()
    }

    process.exit(0)
}

const updateCloud = (cloud)=>
    promiseWrite(path.join(global.projDir,'Infrastructure.json'),JSON.stringify(cloud))


module.exports = {
                    verifyInstallation,
                    exit,
                    updateCloud
                }