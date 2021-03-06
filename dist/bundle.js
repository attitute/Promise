'use strict';

// 1.每个promise 都有三个状态 pennding等待态  resolve 标识变成成功态 fulfilled reject 标识变成失败态 REJECTED
// 2.每个promise 需要有一个then方法 ， 传入两个参数 一个是成功的回调另一个是失败的回调
// 3.new Promise会立即执行
// 4.一旦成功就不能失败 一旦失败不能成功
// 5.当promise抛出异常后 也会走失败态
var isObject = function (target) { return typeof target === 'object' && target !== null; };
function resolvePromise(promise2, x, resolve, reject) {
    if (x == promise2) { // 如果x和promise2是一个状态 那就返回类型错误
        return reject(new TypeError('出错了'));
    }
    if (isObject(x) || typeof x === 'function') { // x是一个对象或者是一个函数
        var called_1 = false; // 保证只返回一个状态
        try {
            var then = x.then; // 获取函数或对象的then方法
            if (typeof then == 'function') { // 判断是不是一个promise函数  规范认为有then方法就是promise
                then.call(x, function (y) {
                    if (called_1)
                        return;
                    called_1 = true;
                    resolvePromise(promise2, y, resolve, reject); // 再次判断是不是promise
                }, function (r) {
                    if (called_1)
                        return;
                    called_1 = true;
                    reject(r);
                });
            }
            else { // 不是函数直接返回即可
                resolve(x);
            }
        }
        catch (e) {
            if (called_1)
                return;
            called_1 = true;
            reject(e); // 走失败逻辑
        }
    }
    else {
        // 如果不是那就是一个普通值
        resolve(x);
    }
}
var Promise = /** @class */ (function () {
    function Promise(executor) {
        var _this = this;
        this.status = "PENDING" /* pending */;
        this.value = undefined;
        this.reason = undefined;
        this.onResloveCallbacks = [];
        this.onRejectCallbacks = [];
        var resolve = function (value) {
            if (value instanceof Promise) {
                return value.then(resolve, reject); // 循环调用resolve 防止返回还是promise
            }
            if (_this.status == "PENDING" /* pending */) { // 只有pengding状态才能修改状态
                _this.status = "FULFILLED" /* fulfilled */;
                _this.value = value;
                // 订阅未完成的成功回调
                _this.onResloveCallbacks.forEach(function (fn) { return fn(); });
            }
        };
        var reject = function (reason) {
            if (_this.status == "PENDING" /* pending */) {
                _this.status = "REJECTED" /* rejected */;
                _this.reason = reason;
                // 订阅未完成的失败回调
                _this.onRejectCallbacks.forEach(function (fn) { return fn(); });
            }
        };
        try {
            executor(resolve, reject); // 初始化执行函数
        }
        catch (e) {
            reject(e);
        }
    }
    Promise.resolve = function (value) {
        return new Promise(function (resolve, reject) {
            resolve(value);
        });
    };
    Promise.reject = function (err) {
        return new Promise(function (resolve, reject) {
            reject(err);
        });
    };
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        // 判断是不是函数 不是则重置返回一个函数  使不传参数的then也有返回值 .then().then(data=>data)
        onFulfilled = typeof onFulfilled == 'function' ? onFulfilled : function (x) { return x; };
        onRejected = typeof onRejected == 'function' ? onRejected : function (err) { throw err; };
        // 返回一个promise 支持链式调用
        var promise2 = new Promise(function (resolve, reject) {
            if (_this.status == "PENDING" /* pending */) { // 如果resolve 或者reject是异步的 那么就是pending状态
                // 发布所有的成功或者失败回调
                _this.onResloveCallbacks.push(function () {
                    setTimeout(function () {
                        try {
                            var x = onFulfilled(_this.value);
                            // 传入promise2 主要是想拿到resolve reject方法
                            // promise2.resolve = resolve
                            // promise2.reject = reject // 或者直接传入方法
                            resolvePromise(promise2, x, resolve, reject); // 返回参数可能是一个promise 对参数进行判断
                        }
                        catch (error) {
                            reject(error);
                        }
                    }, 0);
                });
                _this.onRejectCallbacks.push(function () {
                    setTimeout(function () {
                        try {
                            var x = onRejected(_this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        }
                        catch (error) {
                            reject(error);
                        }
                    }, 0);
                });
            }
            if (_this.status == "FULFILLED" /* fulfilled */) { // 状态时fulfilled时
                setTimeout(function () {
                    try {
                        var x = onFulfilled(_this.value); // 接收成功处理函数返回值
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (error) { // 只要运行出错就reject
                        reject(error);
                    }
                }, 0);
            }
            if (_this.status == "REJECTED" /* rejected */) {
                setTimeout(function () {
                    try {
                        var x = onRejected(_this.reason); // 执行失败处理函数 接收其返回值
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (error) {
                        reject(error);
                    }
                }, 0);
            }
        });
        return promise2;
    };
    Promise.prototype.catch = function (errFn) {
        this.then(null, errFn);
    };
    return Promise;
}());
// 延迟函数 不写这个 promise测试通不过
// npm i promises-aplus-tests -g promise测试
// promises-aplus-tests [js文件名] 即可验证你的Promise的规范。
Promise.deferred = function () {
    var df = {};
    df.promise = new Promise(function (resolve, reject) {
        df.resolve = resolve;
        df.reject = reject;
    });
    return df;
};
var isPromise = function (target) {
    if (isObject(target) || typeof target == 'function') {
        if (typeof target.then == 'function') {
            return true;
        }
    }
    return false;
};
// 执行数组中所有的promise 并且将结果按照顺序存入数组
Promise.all = function (values) {
    return new Promise(function (resolve, reject) {
        var arr = [];
        var times = 0;
        function collectResult(value, key) {
            arr[key] = value;
            if (++times == values.length) {
                resolve(arr);
            }
        }
        values.forEach(function (value, key) {
            if (isPromise(value)) {
                value.then(function (y) {
                    collectResult(y, key);
                }, reject);
            }
            else {
                collectResult(value, key);
            }
        });
    });
};
// 不管什么情况都会触发
// finally规则 resolve只返回自己的Promise  
// resolve情况 finally中resolve返回不修改最初值
// reject 情况 finally中reject返回会修改最初值 如果返回resolve则不影响
Promise.prototype.finally = function (callback) {
    return this.then(function (data) {
        return Promise.resolve(callback()).then(function () { return data; });
    }, function (err) {
        return Promise.resolve(callback()).then(function () { throw err; });
    });
};
// promise.race() 返回第一个结果 跟all差不多
Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
        function collectResult(value) {
            resolve(value);
        }
        values.forEach(function (v) {
            if (v && isPromise(v)) {
                v.then(function (data) {
                    collectResult(v);
                }, reject);
            }
            else {
                collectResult(v);
            }
        });
    });
};
// promise.allSettled 无论成功失败执行完毕 按顺序返回所有结果（就是all方法一样）
Promise.allSettled = function (values) {
    return new Promise(function (resolve, reject) {
        var arr = [], times = 0;
        function collectResult(value, key, status) {
            arr[key] = status == 'fulfilled' ? { value: value, status: status } : { reason: value, status: status };
            if (++times == values.length) {
                resolve(arr);
            }
        }
        values.forEach(function (v, key) {
            if (v && isPromise(v)) {
                v.then(function (data) {
                    collectResult(data, key, 'fulfilled');
                }, function (reason) {
                    collectResult(reason, key, 'rejected');
                });
            }
            else {
                collectResult(v, key, 'noStatus');
            }
        });
    });
};

module.exports = Promise;
