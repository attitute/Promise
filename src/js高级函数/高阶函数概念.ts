// promise 都是基于回调模式的
// 高阶函数 如果你的函数参数是一个函数或者一个函数返回一个函数就是高阶函数


// 基于代码做扩展 给core方法扩展一个before方法

type Callback = ()=> void
type ReturnFn = (...args:any[]) => void

declare global {
    interface Function{
        before(fn:Callback):ReturnFn
    }
}

Function.prototype.before = function(fn){
    return (...args) =>{
        fn()
        this(...args) // 调用原有的core方法
    }
}

function core(...args: any[]){
    console.log('core', ...args)
}

let fn = core.before(()=>{
    console.log('before core...')
})
fn()


export {}

