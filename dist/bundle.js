'use strict';

// 1.每个promise 都有三个状态 pennding等待态  resolve 标识变成成功态 fulfilled reject 标识变成失败态 REJECTED
// 2.每个promise 需要有一个then方法 ， 传入两个参数 一个是成功的回调另一个是失败的回调
// 3.new Promise会立即执行
// 4.一旦成功就不能失败 一旦失败不能成功
// 5.当promise抛出异常后 也会走失败态
// function resolvePromise(promise2,x,resolve,reject) {
// }
var Promise = /** @class */ (function () {
    function Promise(executor) {
        var _this = this;
        this.status = "PENDING" /* pending */;
        this.value = undefined;
        this.reason = undefined;
        this.onResloveCallbacks = [];
        this.onRejectCallbacks = [];
        var resolve = function (value) {
            if (_this.status == "PENDING" /* pending */) {
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
            executor(resolve, reject);
        }
        catch (e) {
            reject(e);
        }
    }
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        var promise2 = new Promise(function (resolve, reject) {
            if (_this.status == "PENDING" /* pending */) { // 如果resolve 或者reject是异步的 那么就是pending状态
                // 发布所有的成功或者失败回调
                _this.onResloveCallbacks.push(function () {
                    setTimeout(function () {
                        try {
                            var x = onFulfilled(_this.value);
                            resolve(x);
                            // resolvePromise(promise2,x,resolve,reject)
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
                            resolve(x);
                            // resolvePromise(promise2,x,resolve,reject)
                        }
                        catch (error) {
                            reject(error);
                        }
                    }, 0);
                });
            }
            if (_this.status == "FULFILLED" /* fulfilled */) {
                setTimeout(function () {
                    try {
                        var x = onFulfilled(_this.value);
                        resolve(x);
                        // resolvePromise(promise2,x,resolve,reject)
                    }
                    catch (error) {
                        reject(error);
                    }
                }, 0);
            }
            if (_this.status == "REJECTED" /* rejected */) {
                setTimeout(function () {
                    try {
                        var x = onRejected(_this.reason);
                        resolve(x);
                        // resolvePromise(promise2,x,resolve,reject)
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

module.exports = Promise;
