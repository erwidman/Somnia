const uuid = require('uuid/v4')
const {exec} = require('child_process')
const {promisify} = require('util')
const promiseExec = promisify(exec)
const path = require('path')


const passwordPolicy = 
`\"PasswordPolicy={MinimumLength=10,`+
 `RequireUppercase=true,`+
 `RequireLowercase=true,`+
 `RequireNumbers=true,`+
 `RequireSymbols=false}\"`

const createPool = (params,cloud)=>{
    const poolName = uuid()
    console.log(`pool name ${poolName}`)
    return promiseExec(
        `aws cognito-idp create-user-pool `+
        `--pool-name ${poolName} `+
        `--policies ${passwordPolicy} `+
        `--username-attributes ${params.uid} `+
        `--auto-verified-attributes \"email\" `+
        `--query UserPool.Id ` + 
        `--output text`
    )
    .then(result=>{
        if(result.stderr.length>0)
            throw new Error('FAILED_TO_CREATE_POOL')
        cloud.userPool = {poolName,poolId:result.stdout.trim(),created: Date.now()}
    })
    .then(()=>{
        const clientName = uuid()
        return promiseExec(
            `aws cognito-idp create-user-pool-client `+
            `--user-pool-id ${cloud.userPool.poolId} `+
            `--client-name ${clientName} `+
            `--no-generate-secret `+
            `--query UserPoolClient.ClientId `+
            `--output text`
        )
    })
    .then(result=>{
        if(result.stderr.length>0)
            throw new Error('FAILED_TO_GENERATE_CLIENT')
        cloud.userPool.clientID = result.stdout.trim()
        return global.util.updateCloud(cloud)
    })
  
}


const generatePool = ({phone_number,email,username,password},cloud)=>{
    if(phone_number && email || username)
        return createPool({uid:'email'},cloud)
    else 
        return Promise.reject(new Error('INVALID_PARAMS'))
    
}

const main = (params,ws,cloud)=>{
    if(!cloud.userPool){
        console.log(generatePool)
        generatePool(params,cloud)
        .then(()=>ws.send("POOL_GENERATED"))
        .catch(err=>{
            console.log(err)
            ws.send("FAILED_TO_GENERATE_POOL")
        })
    }
    else
        ws.send('POOL_ALREADY_EXIST')
}


module.exports = main