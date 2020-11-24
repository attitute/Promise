
const enum STATE {
  pending = 'PENDING',
  fulfilled = 'FULFILLED',
  rejected = 'REJECTED'
}


export default class Promise{
  status: STATE
  value:any
  reason:any
  resolveCallBack: Array<Function>
  rejectCallBack: Array<Function>
  constructor(exec:Function){
    this.status = STATE.pending
    this.value = undefined
    this.reason = undefined
    this.resolveCallBack = []
    this.rejectCallBack = []
    
    const resolve = (value:any)=>{
      if(this.status == STATE.pending){
        this.value = value
        this.status = STATE.fulfilled
        // 订阅
        this.resolveCallBack.forEach(fn=>fn)
      }
    }

    const reject = (reason:any)=>{
      if(this.status == STATE.pending){
        this.reason = reason
        this.status = STATE.rejected
        // 订阅
        this.rejectCallBack.forEach(fn=>fn)
      }
    }

    try{
      exec(resolve,reject)
    }catch(e){
      reject(e)
    }
  }
  then(onFulfilled:any,onRejected:Function){
    let promise = new Promise((resolve:Function,reject:Function)=>{
      if (this.status == STATE.fulfilled){
        try{
          let x = onFulfilled(this.value)
          resolve(x)
        }catch(e){
          reject(e)
        }
      }
      if (this.status == STATE.fulfilled){
        try{
          let x = onRejected(this.reason)
          resolve(x)
        }catch(e){
          reject(e)
        }
      }
      if(this.status == STATE.pending){
        // 发布
        this.resolveCallBack.push(onFulfilled)
        this.rejectCallBack.push(onRejected)
      }
    })
    return promise
  }
  catch(errFn:Function){
    return this.then(null, errFn)
  }
}

