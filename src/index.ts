// 1.每个promise 都有三个状态 pennding等待态  resolve 标识变成成功态 fulfilled reject 标识变成失败态 REJECTED
// 2.每个promise 需要有一个then方法 ， 传入两个参数 一个是成功的回调另一个是失败的回调
// 3.new Promise会立即执行
// 4.一旦成功就不能失败 一旦失败不能成功
// 5.当promise抛出异常后 也会走失败态

import { rejects } from "assert"
import { promises } from "fs"
import { resolve } from "path"

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

const isObject = (target:unknown):target is object => typeof target === 'object' && target !== null

function resolvePromise(promise2:Promise,x:any,resolve:(x:unknown)=>void,reject:Function) {
    if(x == promise2){ // 如果x和promise2是一个状态 那就返回类型错误
        return reject(new TypeError('出错了'))
    }
    if(isObject(x) || typeof x === 'function') { // x是一个对象或者是一个函数
        let called = false // 保证只返回一个状态
        try{
            let then = x.then // 获取函数或对象的then方法
            if(typeof then == 'function') { // 判断是不是一个promise函数  规范认为有then方法就是promise
                then.call(x,(y: unknown)=>{
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

class Promise {
    status: STATUS
    value:any
    reason:any
    onResloveCallbacks: Array<Function>
    onRejectCallbacks: Function[]
    static deferred:any
    static all:any
    static allSettled?: (values: any[]) => Promise
    finally!: (callback: any) => Promise
    static race: (values: any) => Promise

    constructor (executor:(resolve:(value:unknown)=>void,reject:(reason:any)=>void)=>void){
        this.status = STATUS.pending
        this.value = undefined
        this.reason = undefined
        this.onResloveCallbacks = []
        this.onRejectCallbacks = []

        const resolve = (value?:any)=>{
            if (value instanceof Promise){
                return value.then(resolve,reject) // 循环调用resolve 防止返回还是promise
            }
            if(this.status == STATUS.pending){ // 只有pengding状态才能修改状态
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
            executor(resolve,reject) // 初始化执行函数
        }catch(e){
            reject(e)
        }
    }
    static resolve (value:unknown){
        return new Promise((resolve,reject)=>{
            resolve(value)
        })
    }
    static reject (err:unknown){
        return new Promise((resolve,reject)=>{
            reject(err)
        })
    }
    then(onFulfilled?:any, onRejected?:any){
        // 判断是不是函数 不是则重置返回一个函数  使不传参数的then也有返回值 .then().then(data=>data)
        onFulfilled = typeof onFulfilled == 'function' ? onFulfilled : (x:unknown) => x
        onRejected = typeof onRejected == 'function' ? onRejected : (err:unknown) => {throw err}
        // 返回一个promise 支持链式调用
        let promise2 = new Promise((resolve,reject)=>{
            if(this.status == STATUS.pending){ // 如果resolve 或者reject是异步的 那么就是pending状态
                // 发布所有的成功或者失败回调
                this.onResloveCallbacks.push(()=>{
                    setTimeout(() => { // 异步的好处在于能够获取到promise2
                        try {
                            let x = onFulfilled(this.value)
                            // 传入promise2 主要是想拿到resolve reject方法
                            // promise2.resolve = resolve
                            // promise2.reject = reject // 或者直接传入方法
                            resolvePromise(promise2,x,resolve,reject) // 返回参数可能是一个promise 对参数进行判断
                        } catch (error) {
                            reject(error)
                        }
                    }, 0);
                })
                this.onRejectCallbacks.push(()=>{
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason) 
                            resolvePromise(promise2,x,resolve,reject)
                        } catch (error) {
                            reject(error)
                        }
                    }, 0);
                })
            }
            if (this.status == STATUS.fulfilled){ // 状态时fulfilled时
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value) // 接收成功处理函数返回值
                        resolvePromise(promise2,x,resolve,reject)
                    } catch (error) { // 只要运行出错就reject
                        reject(error)
                    }
                }, 0);
            }
            if (this.status == STATUS.rejected){
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason) // 执行失败处理函数 接收其返回值
                        resolvePromise(promise2,x,resolve,reject)
                    } catch (error) {
                        reject(error)
                    }
                }, 0);
            }
        })
        return promise2
    }
    catch(errFn: Function){ // 只有错误返回的then方法
        this.then(null, errFn)
    }
}
// 延迟函数 不写这个 promise测试通不过
// npm i promises-aplus-tests -g promise测试
// promises-aplus-tests [js文件名] 即可验证你的Promise的规范。
Promise.deferred = function () {
    let df = {} as any
    df.promise = new Promise((resolve, reject) => {
      df.resolve = resolve
      df.reject = reject
    })
    return df
  }
  const isPromise = function(target:any){
    if(isObject(target) || typeof target == 'function'){
      if(typeof target.then == 'function'){
        return true
      }
    }
    return false
  }
  // 执行数组中所有的promise 并且将结果按照顺序存入数组
  Promise.all = function(values:any[]){
    return new Promise((resolve,reject)=>{
      let arr = [] as any[]
      let times:number = 0
      function collectResult(value:any,key:number){
        arr[key] = value
        if (++times == values.length){
          resolve(arr)
        }
      }
      values.forEach((value:any,key:number)=>{
        if(isPromise(value)){
          value.then((y:unknown)=>{
            collectResult(y, key)
          },reject)
        }else {
          collectResult(value,key)
        }
      })
    })
  }
  // 不管什么情况都会触发
  // finally规则 resolve只返回自己的Promise  
  // resolve情况 finally中resolve返回不修改最初值
  // reject 情况 finally中reject返回会修改最初值 如果返回resolve则不影响
  Promise.prototype.finally = function(callback){
      return this.then((data: any)=>{
        return Promise.resolve(callback()).then(()=>data)
      },(err: any)=>{
        return Promise.resolve(callback()).then(()=>{throw err})
      })
  }

// promise.race() 返回第一个结果 跟all差不多
  Promise.race = function(values){
    return new Promise((resolve,reject)=>{
        function collectResult(value:unknown){
            resolve(value)
        }
        values.forEach((v:any)=>{
            if(v && isPromise(v)) {
                v.then((data:unknown)=>{
                    collectResult(v)
                },reject)
            }else {
                collectResult(v)
            }
        })
    })
  }
  // promise.allSettled 无论成功失败执行完毕 按顺序返回所有结果（就是all方法一样）
  Promise.allSettled = function(values:any[]){
    return new Promise((resolve,reject)=>{
        let arr = [] as any[],times = 0;
        function collectResult(value: any, key: number, status: string){
            arr[key] = status == 'fulfilled' ? {value,status} : {reason:value,status}
            if (++times == values.length){
                resolve(arr)
            }
        }
        values.forEach((v:any,key:number)=>{
            if(v && isPromise(v)){
                v.then((data: any)=>{
                    collectResult(data,key,'fulfilled')
                },(reason: any)=>{
                    collectResult(reason,key,'rejected')
                })
            }else {
                collectResult(v,key,'noStatus')
            }
        })
    })
  }




  export default Promise