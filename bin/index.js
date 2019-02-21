#!/usr/bin/env node



global.DEBUG = 1;
const path = require('path')
global.util = require(path.join(__dirname,'util.js'))
const program = require('commander')
const chalk = require('chalk')
const pkgUp = require('pkg-up')
const fs = require('fs')

var state = {}


function contextCheck(){
    return pkgUp().then(filename=>{
        if(!filename){
            console.error(chalk.red("ERROR | CWD is not a node project!"))
            process.exit(1)
        }
        else
            global.projDir = path.dirname(filename)
    })
    .then(()=>global.util.verifyInstallation())
    .then(result=>{
        if(result.err){
            console.error(chalk.red("ERROR | Install somnia locally!"))
            global.util.exit(state)
        }
    })
    .then(()=>
            fs.writeFileSync(
                path.join(global.projDir,'somnia_cloud.json'),
                '{}',
                {flag:'wx'}
            )
    )
    .catch(err=>{
       //if not a EEXIST error
       if(err.errno!=-17){
           console.error(err)
           global.util.exit(state)
       }      
    })
}


async function init(){
    await contextCheck()
    state = {
                handleRequest : require(path.join(__dirname,'AWS_GENERATION','index.js'))
            }
    require('./commands/start.js')(state,program)
    program.parse(process.argv)
}


init()



