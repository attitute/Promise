'use strict';

var isObject = function (target) { return typeof target == 'object' && target != null; };
function resolvePromise(promise2, x, resolve, reject) {
    if (x == promise2)
        reject(new TypeError('类型错误'));
    if (isObject(x) || typeof x == 'function') {
        var called_1 = false; // 防止别人的promise没有做 状态限制
        try {
            var then = x.then;
            if (typeof then == 'function') { // 只要有then方法就认为是promise对像
                then.call(x, function (y) {
                    if (called_1)
                        return;
                    called_1 = true;
                    resolvePromise(promise2, y, resolve, reject);
                }, function (r) {
                    if (called_1)
                        return;
                    called_1 = true;
                    reject(r);
                });
            }
            else {
                if (called_1)
                    return;
                called_1 = true;
                resolve(x);
            }
        }
        catch (error) {
            if (called_1)
                return;
            called_1 = true;
            reject(error);
        }
    }
    else {
        resolve(x);
    }
}
var Promise = /** @class */ (function () {
    function Promise(executor) {
        var _this = this;
        this.status = "PENDING" /* pending */;
        this.value = undefined;
        this.reason = undefined;
        this.onResolveCallbacks = [];
        this.onRejectCallbacks = [];
        var resolve = function (value) {
            if (value instanceof Promise) { // 规则就是resolve只能返回自己的promise
                return value.then(resolve, reject); // 需要递归解析 可能promise里面还是promise
            }
            if (_this.status == "PENDING" /* pending */) {
                _this.status = "FULFILLED" /* fulfilled */;
                _this.value = value;
                _this.onResolveCallbacks.forEach(function (fn) { return fn(); });
            }
        };
        var reject = function (reason) {
            if (_this.status == "PENDING" /* pending */) {
                _this.status = "REJECT" /* reject */;
                _this.reason = reason;
                _this.onRejectCallbacks.forEach(function (fn) { return fn(); });
            }
        };
        try {
            executor(resolve, reject);
        }
        catch (error) {
            reject(error);
        }
    }
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        onFulfilled = typeof onFulfilled == 'function' ? onFulfilled : function (x) { return x; };
        onRejected = typeof onRejected == 'function' ? onRejected : function (err) { throw err; };
        var promise2 = new Promise(function (resolve, reject) {
            if (_this.status == "PENDING" /* pending */) {
                _this.onResolveCallbacks.push(function () {
                    setTimeout(function () {
                        try {
                            var x = onFulfilled(_this.value); // 回调函数中传入成功结果
                            // resolve(x)
                            resolvePromise(promise2, x, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }, 0);
                });
                _this.onRejectCallbacks.push(function () {
                    setTimeout(function () {
                        try {
                            var x = onRejected(_this.reason); // 回调函数中传入失败原因
                            resolvePromise(promise2, x, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }, 0);
                });
            }
            if (_this.status == "FULFILLED" /* fulfilled */) {
                setTimeout(function () {
                    try {
                        var x = onFulfilled(_this.value); // 回调函数中传入成功结果
                        // resolve(x)
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                }, 0);
            }
            if (_this.status == "REJECT" /* reject */) {
                setTimeout(function () {
                    try {
                        var x = onRejected(_this.reason); // 回调函数中传入失败原因
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                }, 0);
            }
        });
        return promise2;
    };
    Promise.prototype.catch = function (errFn) {
        return this.then(null, errFn);
    };
    Promise.resolve = function (value) {
        return new Promise(function (resolve, reject) { return resolve(value); });
    };
    Promise.reject = function (value) {
        return new Promise(function (resolve, reject) { return reject(value); });
    };
    return Promise;
}());
Promise.deferred = function () {
    var df = {};
    df.promise = new Promise(function (resolve, reject) {
        df.resolve = resolve;
        df.reject = reject;
    });
    return df;
};
var isPromise = function (values) {
    if (isObject(values) || typeof values == 'function') {
        if (typeof values.then == 'function') {
            return true;
        }
    }
    return false;
};
Promise.all = function (values) {
    return new Promise(function (resolve, reject) {
        var arr = [];
        var times = 0;
        function collectResult(key, value) {
            arr[key] = value;
            if (++times == values.length) {
                console.log(arr, 'aaaa');
                resolve(arr);
            }
        }
        // Object.prototype.toString.call(values) == '[object array]'
        values.forEach(function (value, index) {
            if (value && isPromise(value)) {
                value.then(function (y) {
                    collectResult(index, y);
                }, reject);
            }
            else {
                collectResult(index, value);
            }
        });
    });
};
Promise.prototype.finally = function (callBack) {
    return this.then(function (data) {
        return Promise.resolve(callBack()).then(function () { return data; }); // finally规则是使用上一个resolve中的值
    }, function (err) {
        // 如果callBack失败 那么不会走then的成功了（我们在then函数中做了处理所以不需要额外写失败的回调）  如果没失败就是成功了成功就用上次的结果
        return Promise.resolve(callBack()).then(function () { throw err; });
    });
};

module.exports = Promise;
