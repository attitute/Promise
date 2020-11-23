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

class Promise {
    constructor(executor){

    }
}