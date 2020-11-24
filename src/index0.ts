// 每一个promise 都有三个状态 pending fulfilled reject 分别是等待 成功 失败
// 每个promise 需要有一个then方法,传入两个参数 一个是成功resolve 失败reject
// new promise 会立即执行
// 一旦成功与失败状态只能有一种 不能转换
// promise抛出异常后 也会走失败态

const enum STATUS { // 存放需要的状态
    pending = 'PEDDING',
    fulfilled = 'FULFILLED',
    reject = 'REJECT'
}

export default class Promise {
    public status: STATUS
    value:any // 成功
    reason:any // 失败
    onResolveCallbacks: Function[] // 成功回调
    onRejectedCallbacks: Array<Function> // 失败回调
    constructor(executor:Function){
        this.status = STATUS.pending
        this.value = undefined
        this.reason = undefined 
        this.onRejectedCallbacks = []
        this.onResolveCallbacks = []

        const resolve = (value:any)=>{ // 给promise函数一个成功返回函数
            if(this.status === STATUS.pending){ // 只有pending状态可以修改成别的状态
                this.status = STATUS.fulfilled
                this.value = value // 成功返回值
                // 发布
                this.onResolveCallbacks.forEach(fn=>fn())
            }
        }
        const reject = (reason:any)=>{ // 给promise函数一个失败返回函数
            if(this.status === STATUS.pending) { // 只有pending状态可以修改成别的状态
                this.status = STATUS.reject
                this.reason = reason // 失败返回值
                // 发布
                this.onRejectedCallbacks.forEach(fn=>fn())
            }
        }
        try{
            executor(resolve,reject) // new promise时就执行 
        }catch(e){
            reject(e)
        }
    }
    then(onFufilled:Function,onRejected:Function){ // 传入成功失败回调
        let promise2 = new Promise((resolve:Function,reject:Function)=>{ // 返回一个promise 支持链式调用
            if(this.status == STATUS.fulfilled){
                try {
                    let x = onFufilled(this.value) // 回调函数中传入成功结果
                    resolve(x)
                }catch(e){
                    reject(e)
                }
            }
            if(this.status == STATUS.reject){
                try {
                    let x = onRejected(this.reason) // 回调函数中传入失败原因
                    resolve(x)
                }catch(e){
                    reject(e)
                }
            }
            if(this.status == STATUS.pending){
                // 订阅 成功失败的回调
                this.onResolveCallbacks.push(()=>{
                    onFufilled(this.value)
                })
                this.onRejectedCallbacks.push(()=>{
                    onRejected(this.reason)
                })
            }
        })
        return promise2
    }
}




