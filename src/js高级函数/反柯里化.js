// 反柯里化 让范围变大   柯里化就是范围变小

// let toString = Object.prototype.toString // toString 原型方法
// console.log(toString.call(123)) // toSting this指向变了 


// Function.prototype.unCurrying = function () {
//     return (...args) => {
//         // Function.prototype.call好处在于 调用的一定是原型的call方法 而不是用户定义的call
//         // apply改了this指向 call方法中this就指向了toString 所以就是toString.call 并且传入了参数
//         return Function.prototype.call.apply(this, args)
//     }
// }

// let toString = Object.prototype.toString.unCurrying() // 私有的toString方法
// console.log(toString(123))


