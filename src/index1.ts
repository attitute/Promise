import { type } from "os"

const enum STATUS {
  pending = 'PENDING',
  fulfilled = 'FULFILLED',
  reject = 'REJECT',
}
const isObject = (target: unknown) =>
  typeof target == 'object' && target != null

function resolvePromise(promise: Promise, x: any, resolve: any, reject: any) {
  if (x == promise) reject(new TypeError('类型错误'))
  if (isObject(x) || typeof x == 'function') {
    let called = false
    try {
      let then = x.then
      if (typeof then == 'function') {
        then.call(
          x,
          (y: any) => {
            if (called) return
            called = true
            resolvePromise(promise, y, resolve, reject)
          },
          (r: any) => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        if (called) return
        called = true
        resolve(x)
      }
    } catch (error) {
      if (called) return
      called = true
      reject(error)
    }
  } else {
    resolve(x)
  }
}

class Promise {
  status: STATUS
  value?: any
  reason?: any
  onResolveCallbacks: Array<Function>
  onRejectCallbacks: Array<Function>
  static deferred?: any
  static all?: any
  constructor(exector: (resolve: (value: unknown)=>void, reject: (reason:unknown)=>void) => void) {
    this.status = STATUS.pending
    this.value = undefined
    this.reason = undefined
    this.onResolveCallbacks = []
    this.onRejectCallbacks = []
    const resolve = (value: unknown) => {
      if (this.status == STATUS.pending) {
        this.status = STATUS.fulfilled
        this.value = value
        this.onResolveCallbacks.forEach((fn) => fn())
      }
    }
    const reject = (reason: unknown) => {
      if (this.status == STATUS.pending) {
        this.status = STATUS.reject
        this.reason = reason
        this.onRejectCallbacks.forEach((fn) => fn())
      }
    }

    try {
      exector(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }
  then(onFulfilled?: any, onRejected?: any) {
    onFulfilled =
      typeof onFulfilled == 'function' ? onFulfilled : (x: unknown) => x
    onRejected =
      typeof onRejected == 'function'
        ? onRejected
        : (err: unknown) => {
            throw err
          }
    let promise2 = new Promise((resolve: any, reject: any) => {
      if (this.status == STATUS.pending) {
        this.onResolveCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.onRejectCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
      if (this.status == STATUS.fulfilled) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }
      if (this.status == STATUS.reject) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }
    })
    return promise2
  }
  catch(errFn: () => void) {
    return this.then(null, errFn)
  }
}
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

export default Promise
