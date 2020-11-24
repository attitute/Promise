// 1.每个promise 都有三个状态 pennding等待态  resolve 标识变成成功态 fulfilled reject 标识变成失败态 REJECTED
// 2.每个promise 需要有一个then方法 ， 传入两个参数 一个是成功的回调另一个是失败的回调
// 3.new Promise会立即执行
// 4.一旦成功就不能失败 一旦失败不能成功
// 5.当promise抛出异常后 也会走失败态

//Program 是支持链式调用的 
/**
 * 无论是成功还是失败 都可以返回结果(1.出错了走错误2.返回一个普通值(非promise),就会作为下一次then的成功结果)
 * 如果是返回promise的情况(会采用返回的promise的状态) 用promise解析后的结果传递给下一个
 * 
*/

const enum STATUS {
    pending = 'PENDING',
    fulfilled = 'FULFILLED',
    rejected = 'REJECTED'
}

const isObject:(targe:unknown)=>Boolean = target=> typeof target === 'object' && target !== null

function resolvePromise(promise2:Promise,x:any,resolve:(x:unknown)=>void,reject:Function) {
    if(x == promise2){ // 如果x和promise2是一个状态 那就返回类型错误 //可以自己测下
        return reject(new TypeError('出错了'))
    }
    if(isObject(x) || typeof x === 'function') { // x是一个对象或者是一个函数
        let called = false // 保证只返回一个状态
        try{
            let then = x.then // 获取函数或对象的then方法
            if(typeof then == 'function') {
                then.call(x,(y: unknown)=>{ // 判断是不是一个promise函数
                  if(called) return
                  called = true
                  resolvePromise(promise2, y, resolve, reject) // 再次判断是不是promise
                }, (r:unknown) =>{
                  if(called)return
                  called = true
                  reject(r)
                })
            } else { // 不是函数直接返回即可
                resolve(x)
            }
        } catch (e) {
            if (called) return
            called = true
            reject(e) // 走失败逻辑
        }
    }else {
        // 如果不是那就是一个普通值
        resolve(x)
    }
}

interface promise2 {
  resolve: Function
  reject: Function
}

export default class Promise {
    status: STATUS
    value:any
    reason:any
    onResloveCallbacks: Array<Function>
    onRejectCallbacks: Function[]

    constructor (executor:(resolve:(value:unknown)=>void,reject:(reason:any)=>void)=>void){
        this.status = STATUS.pending
        this.value = undefined
        this.reason = undefined
        this.onResloveCallbacks = []
        this.onRejectCallbacks = []

        const resolve = (value?:any)=>{
            if(this.status == STATUS.pending){
                this.status = STATUS.fulfilled
                this.value = value
                // 订阅未完成的成功回调
                this.onResloveCallbacks.forEach(fn=>fn())
            }
        }
        const reject = (reason?: any)=>{
            if (this.status == STATUS.pending){
                this.status = STATUS.rejected
                this.reason = reason
                // 订阅未完成的失败回调
                this.onRejectCallbacks.forEach(fn=>fn())
            }
        }

        try {
            executor(resolve,reject)
        }catch(e){
            reject(e)
        }
    }
    then(onFulfilled:any, onRejected:Function){
        let promise2 = new Promise((resolve,reject)=>{
            if(this.status == STATUS.pending){ // 如果resolve 或者reject是异步的 那么就是pending状态
                // 发布所有的成功或者失败回调
                this.onResloveCallbacks.push(()=>{
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value)
                            // resolve(x)
                            // 传入promise2 主要是想拿到resolve reject方法
                            // promise2.resolve = resolve
                            // promise2.reject = reject // 或者直接传入方法
                            resolvePromise(promise2,x,resolve,reject)
                        } catch (error) {
                            reject(error)
                        }
                    }, 0);
                })
                this.onRejectCallbacks.push(()=>{
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason)
                            // resolve(x)
                            resolvePromise(promise2,x,resolve,reject)
                        } catch (error) {
                            reject(error)
                        }
                    }, 0);
                })
            }
            if (this.status == STATUS.fulfilled){
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value)
                        // resolve(x)
                        resolvePromise(promise2,x,resolve,reject)
                    } catch (error) {
                        reject(error)
                    }
                }, 0);
            }
            if (this.status == STATUS.rejected){
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason)
                        // resolve(x)
                        resolvePromise(promise2,x,resolve,reject)
                    } catch (error) {
                        reject(error)
                    }
                }, 0);
            }
        })
        return promise2
    }
    catch(errFn: Function){
        this.then(null, errFn)
    }

}
