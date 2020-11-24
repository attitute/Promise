// 发布订阅模式  把需要做的事情 放到一个数组中   等事情发生了让订阅的事情依次执行

const fs = require('fs')

interface events {
    arr:Array<Function>,
    on:(fn:Function)=>void,
    // on(fn:Function):void,
    // emit: ()=>void
    emit():void
}

let events:events = {
    arr: [],
    on(fn){
        this.arr.push(fn)
    },
    emit () {
        this.arr.forEach(fn=>fn())
    }
}

interface Person {
    a: string,
    b: number
}

let person = {} as Person

events.on(()=>{
    if(Object.keys(person).length == 2) {
        console.log(person)
    }
})

events.on(()=>{
    console.log('一次')
})

fs.readFile('./a.txt','utf8', (err:unknown, data:string)=>{
    person.a = data
    events.emit()
})
fs.readFile('./b.txt','utf8', (err:unknown, data:number)=>{
    person.b = data
    events.emit()
})

