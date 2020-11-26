// 每一个promise 都有三个状态 pending fulfilled reject 分别是等待 成功 失败
// 每个promise 需要有一个then方法,传入两个参数 一个是成功resolve 失败reject
// new promise 会立即执行
// 一旦成功与失败状态只能有一种 不能转换
// promise抛出异常后 也会走失败态

const enum STATUS { // 存放需要的状态
  pending = 'PEDDING',
  fulfilled = 'FULFILLED',
  reject = 'REJECT',
}
const isObject: (target: any) => Boolean = (target: unknown) =>
  typeof target == 'object' && target != null
function resolvePromise(
  promise2: Promise,
  x: any,
  resolve: (value:unknown)=>void,
  reject: Function
) {
  if (x == promise2) reject(new TypeError('不能返回同一个promise')) // 如果promise是一样的 状态一样就没有意义
  if (isObject(x) || typeof x == 'function') {
    let called = false
    try {
      let then = x.then // 获取then方法
      if (typeof then == 'function') {
        then.call( // 这样的好处在于不会触发 x的get属性获取方法
          x,
          (y: unknown) => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject) // 怕返回的还是promise再检查一次
          },
          (r: unknown) => {
            // reject
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
  public status: STATUS
  value: any // 成功
  reason: any // 失败
  onResolveCallbacks: Function[] // 成功回调
  onRejectedCallbacks: Array<Function> // 失败回调
  static deferred?: any
  constructor(executor: (resolve:(value:unknown)=>void, reject:(reason: unknown)=>void)=>void) {
    this.status = STATUS.pending
    this.value = undefined
    this.reason = undefined
    this.onRejectedCallbacks = []
    this.onResolveCallbacks = []

    const resolve = (value: any) => {
      // 给promise函数一个成功返回函数
      if (this.status === STATUS.pending) {
        // 只有pending状态可以修改成别的状态
        this.status = STATUS.fulfilled
        this.value = value // 成功返回值
        // 发布
        this.onResolveCallbacks.forEach((fn) => fn())
      }
    }
    const reject = (reason: any) => {
      // 给promise函数一个失败返回函数
      if (this.status === STATUS.pending) {
        // 只有pending状态可以修改成别的状态
        this.status = STATUS.reject
        this.reason = reason // 失败返回值
        // 发布
        this.onRejectedCallbacks.forEach((fn) => fn())
      }
    }
    try {
      executor(resolve, reject) // new promise时就执行
    } catch (e) {
      reject(e)
    }
  }
  then(onFufilled?: any, onRejected?: any) {
    // 判断是不是函数 不是则重置返回一个函数
    onFufilled =
      typeof onFufilled == 'function' ? onFufilled : (x: unknown) => x
    onRejected =
      typeof onRejected == 'function'
        ? onRejected
        : (err: unknown) => {
            throw err
          }
    // 返回一个promise 支持链式调用
    let promise2 = new Promise((resolve: (value:unknown)=>void, reject: (reason:unknown)=>void) => {
      if (this.status == STATUS.fulfilled) { // 状态是成功
        setTimeout(() => { // 异步的好处在于能够获取到promise2
          try {
            let x = onFufilled(this.value) // 回调函数中传入成功结果 接受函数返回值
            // resolve(x)
            resolvePromise(promise2, x, resolve, reject) // 对返回值判断
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
      // promise处于pending状态时 可能是还没调用成功或失败回调 将成功或失败函数发布 等待订阅
      if (this.status == STATUS.pending) {
        // 发布
        this.onResolveCallbacks.push(() => {
            setTimeout(() => {
              try {
                let x = onFufilled(this.value) // 回调函数中传入成功结果
                // resolve(x)
                resolvePromise(promise2, x, resolve, reject)
              } catch (e) {
                reject(e)
              }
            }, 0)
        })
        this.onRejectedCallbacks.push(() => {
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
    })
    return promise2
  }
  catch(errFn: () => void) { // 只有错误返回的then方法
    return this.then(null, errFn)
  }
}
// 延迟函数 拆分promise到一个对象中
Promise.deferred = function () {
  let dfd = {} as any
  dfd.promise = new Promise((resolve: (value:unknown) => void, reject: (reason:unknown) => void) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

export default Promise
