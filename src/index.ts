

const enum STATUS {
  pending = 'PENDING',
  fulfilled = 'FULFILLED',
  reject = 'REJECT'
}
const isObject: (target: any) => Boolean = (target: unknown) =>typeof target == 'object' && target != null

function resolvePromise (promise2:Promise, x:any, resolve:Function, reject:Function){
  if (x == promise2) reject(new TypeError('类型错误'))
  if (isObject(x) || typeof x == 'function'){
    let called = false // 防止别人的promise没有做 状态限制
    try {
      let then = x.then
      if(typeof then == 'function'){ // 只要有then方法就认为是promise对像
        then.call(x,(y:unknown)=>{ // 这样使用好处在于 不是一直调用x的then属性取值操作 then方法this指向x
          if(called)return
          called = true
          resolvePromise(promise2,y,resolve,reject)
        },(r:unknown)=>{
          if(called)return
          called = true
          reject(r)
        })
      }else{
        if(called)return
        called = true
        resolve(x)
      } 
    } catch (error) {
      if(called)return
      called = true
      reject(error)
    }
  }else {
    resolve(x)
  }
}

class Promise {
  status:STATUS
  value?:any
  reason?:any
  onResolveCallbacks:Array<Function>
  onRejectCallbacks:Array<Function>
  static deferred?:any
  static all?:any
  finally?: (fn:Function) => Promise
  constructor(executor:(resolve:(value:unknown)=>void,reject:(value:unknown)=>void)=>void){
    this.status = STATUS.pending
    this.value = undefined
    this.reason = undefined
    this.onResolveCallbacks = []
    this.onRejectCallbacks = []
    const resolve = (value:any)=>{
      if (value instanceof Promise){ // 规则就是resolve只能返回自己的promise
        return value.then(resolve,reject) // 需要递归解析 可能promise里面还是promise
      }
      if (this.status == STATUS.pending){
        this.status = STATUS.fulfilled
        this.value = value
        this.onResolveCallbacks.forEach(fn=>fn())
      }
    }
    const reject = (reason:unknown)=>{
      if (this.status == STATUS.pending){
        this.status = STATUS.reject
        this.reason = reason
        this.onRejectCallbacks.forEach(fn=>fn())
      }
    }

    try {
      executor(resolve,reject)
    } catch (error) {
      reject(error)
    }
  }
  then(onFulfilled?: any, onRejected?: any){
    onFulfilled = typeof onFulfilled == 'function' ? onFulfilled : (x:unknown)=>x
    onRejected = typeof onRejected == 'function' ? onRejected : (err:unknown)=>{throw err}
    let promise2 = new Promise((resolve:(value:unknown)=>void,reject:(value:unknown)=>void)=>{
      if (this.status == STATUS.pending){
        this.onResolveCallbacks.push(()=>{
            setTimeout(() => {
              try {
                let x = onFulfilled(this.value) // 回调函数中传入成功结果
                // resolve(x)
                resolvePromise(promise2, x, resolve, reject)
              } catch (e) {
                reject(e)
              }
            }, 0)
        })
        this.onRejectCallbacks.push(()=>{
            setTimeout(() => {
              try {
                let x = onRejected(this.reason) // 回调函数中传入失败原因
                resolvePromise(promise2, x, resolve, reject)
              } catch (e) {
                reject(e)
              }
            }, 0)
        })
      }
      if (this.status == STATUS.fulfilled){
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value) // 回调函数中传入成功结果
            // resolve(x)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.status == STATUS.reject) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason) // 回调函数中传入失败原因
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
    })
    return promise2
  }
  catch(errFn:()=>void) {
    return this.then(null,errFn)
  }
  static resolve(value:unknown){
    return new Promise((resolve,reject)=>resolve(value))
  }
  static reject(value:unknown){
    return new Promise((resolve,reject)=>reject(value))
  }
}
Promise.deferred = function(){
  let df = {} as any
  df.promise = new Promise((resolve,reject)=>{
    df.resolve = resolve
    df.reject = reject
  })
  return df
}


const isPromise = function(values:any){
    if(isObject(values) || typeof values == 'function'){
        if(typeof values.then == 'function'){
            return true
        }
    }
    return false
}


Promise.all = function(values:any[]){
    return new Promise((resolve, reject)=>{
        let arr = [] as any[]
        let times = 0
        function collectResult(key:number,value:unknown){
            arr[key] = value
            if(++times == values.length){
                console.log(arr,'aaaa')
                resolve(arr)
            }
        }
        // Object.prototype.toString.call(values) == '[object array]'
        values.forEach((value:any,index:number) =>{
            if (value && isPromise(value)){
                value.then((y:unknown)=>{
                    collectResult(index,y)
                },reject)
            }else {
                collectResult(index,value)
            }
        })
    })
}

Promise.prototype.finally = function(callBack:Function){
  return this.then((data:unknown)=>{
    return Promise.resolve(callBack()).then(()=>data) // finally规则是使用上一个resolve中的值
  },(err:unknown)=>{
    // 如果callBack失败 那么不会走then的成功了（我们在then函数中做了处理所以不需要额外写失败的回调）  如果没失败就是成功了成功就用上次的结果
    return Promise.resolve(callBack()).then(()=>{throw err})
  })
}

export default Promise

