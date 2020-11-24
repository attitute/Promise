'use strict';

var isObject = function (target) { return typeof target == 'object' && target != null; };
function resolvePromise(promise, x, resolve, reject) {
    if (x == promise)
        reject(TypeError('类型错误'));
    if (isObject(x) || typeof x == 'function') {
        var called_1 = false;
        var then = x.then;
        if (typeof then == 'function') { // ? 怎么判断是不是promise 只通过then?
            try {
                then.call(x, function (y) {
                    if (called_1)
                        return;
                    called_1 = true;
                    resolvePromise(promise, y, resolve, reject);
                }, function (r) {
                    if (called_1)
                        return;
                    called_1 = true;
                    reject(r);
                });
            }
            catch (error) {
                reject(error);
            }
        }
        else {
            if (called_1)
                return;
            called_1 = true;
            resolve(x);
        }
    }
    else {
        resolve(x);
    }
}
var Promise = /** @class */ (function () {
    function Promise(exector) {
        var _this = this;
        this.status = "PENDING" /* pending */;
        this.value = undefined;
        this.reason = undefined;
        this.onResolveCallbacks = [];
        this.onRejectCallbacks = [];
        var resolve = function (value) {
            if (_this.status == "PENDING" /* pending */) {
                _this.status = "FULFILLED" /* fulfilled */;
                _this.value = value;
                _this.onResolveCallbacks.forEach(function (fn) { return fn; });
            }
        };
        var reject = function (reason) {
            if (_this.status == "PENDING" /* pending */) {
                _this.status = "REJECT" /* reject */;
                _this.reason = reason;
                _this.onRejectCallbacks.forEach(function (fn) { return fn; });
            }
        };
        try {
            exector(resolve, reject);
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
                            var x = onFulfilled(_this.value);
                            resolvePromise(promise2, x, resolve, reject);
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
            if (_this.status == "FULFILLED" /* fulfilled */) {
                setTimeout(function () {
                    try {
                        var x = onFulfilled(_this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (error) {
                        reject(error);
                    }
                }, 0);
            }
            if (_this.status == "REJECT" /* reject */) {
                setTimeout(function () {
                    try {
                        var x = onRejected(_this.reason);
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
        return this.then(null, errFn);
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

module.exports = Promise;
