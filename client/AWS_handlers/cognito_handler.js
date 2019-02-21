import sokLib from '../socket.js'
const AmanzonCognitoIdentity = require('amazon-cognito-identity-js')


const generatePool = (userPool,state)=>{
    state.userPool = new AmanzonCognitoIdentity.CognitoUserPool({
            UserPoolId : userPool.poolId,
            ClientId : userPool.clientID
        })
}


//____signUp
const _signUp = (ws,params,cloud)=>{
    return new Promise((resolve, reject) => {
        ws.onmessage = event=>{
            resolve(event)
        }
        sokLib.sendMessage(ws,{action:"signUp",params:params})
    })
}

const  signUp = (params,{userPool},state)=>{
    if(!state.userPool)
        generatePool(userPool,state)

    let attributeList = []
    for(let key of Object.keys(params)){
        if(key!='email' && key !='password' && key !='username'){
            let tmp = new AmanzonCognitoIdentity.CognitoUserAttribute({Name:key,Value:params[key]})
            attributeList.push(tmp)
        }
    }

    return new Promise((resolve, reject) => {
        state.userPool.signUp(params.username||params.email,params.password,attributeList,null,(err,result)=>{
            if(err)
                reject(err)
            else
                resolve(result)
        })
    })
    .catch(err=>console.error(err))
}

const _login = (ws,params,{userPool})=>{
    return new Promise((resolve, reject) => {
        if(userPool)
            resolve()
        else
            throw new Error('NO_USERS_EXIST')
    })
    .catch(err=>console.error(err))

}


const login = (params,{userPool},state)=>{
    if(!state.userPool)
        generatePool(userPool,state)

    let authDetails = new AmanzonCognitoIdentity.AuthenticationDetails({
            Username : params.username||params.email,
            Password : params.password,
         })
    let cognitoUser = new AmanzonCognitoIdentity.CognitoUser({
                Username : params.username||params.email,
                Pool : state.userPool
             })
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails,{
          onSuccess : resolve,
          onFailure : reject
      })
    })
}


const _confirmAccount = (ws,params,{userPool})=>{
     return new Promise((resolve, reject) => {
        if(userPool)
            resolve()
        else
            throw new Error('NO_USERS_EXIST')
    })
    .catch(err=>console.error(err))
}


const confirmAccount = (params,{userPool},state)=>{
    if(!state.userPool)
        generatePool(userPool,state)
    const userData = 
    {
        Username : params.username || params.email,
        Pool : state.userPool
    }
    let cognitoUser = new AmanzonCognitoIdentity.CognitoUser(userData)
    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(params.code,true,(err,result)=>{
          if(err)
              reject(err)
          else
              resolve(result)
      })
    })

}




export default {
                _signUp,
                signUp,
                _login,
                login,
                _confirmAccount,
                confirmAccount
            }