// promise 最重要就是解决了 1.回调地狱 2.异步并发


const fs = require('fs') 

interface Iperson {
    a:string,
    b:number
}

function after(times:number, callback:(obj:Iperson)=>void){  // 调用到规定的次数时 就触发callback函数
    let obj = {} as any;
    return function(key:string, val:number|string) {
        obj[key] = val // 每次触发函数 就把触发信息存起来
        --times == 0 && callback(obj)
    }
}

let fn = after(2,(obj)=>{
    console.log(obj)
})
fs.readFile('./a.txt', 'utf8', (err:string,data:string)=>{
    fn('a',data)
})
fs.readFile('./b.txt', 'utf8', (err:string,data:number)=>{
    fn('b',data)
})


export {}





