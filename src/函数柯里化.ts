// 柯里化函数

// 柯里化的功能就是让函数功能更加具体(保留参数)
// 反柯里化 就是让函数范围更大

// 1.typeof(判断不了object null 数组对象) 2.constructor(由谁构造出来的) 3.intanceof(谁是谁的实例) 4.Object.prototype.toString.call(判断出具体类型 判断不来谁是谁实例 [obejct 类型])
// 实列: 判断一个变量得类型

function isType(val:unknown,type:string) {
    return Object.prototype.toString.call(val) == `[object ${type}]`
}

let isString = isType('sss','string')
let isNumber = isType('sss','number')

// 柯里化之后
type ReturnFn = (val:unknown) => boolean
// let utils:Record<'isString' | 'isNumber' | 'isBoolean',ReturnFn> = {}  as any;
let utils:any = {}
function isTypeLevel(typing:string){ // 高阶函数可以用于保存参数
   return function (val:unknown) {
         return Object.prototype.toString.call(val) == `[object ${typing}]`
   }
}
['String','Number','Boolean'].forEach(type=>{
    utils['is'+type] = isTypeLevel(type); // 闭包
})
console.log(utils.isString('123'));
console.log(utils.isNumber(123));



// 实例: 实现一个通用的柯里化函数,可以自动得将一个函数转换成多次传递参数

const curring = (fn: Function) => {
    const exec = (sumArgs: any[] = []) => {
        // 判断参数大于或等于当前函数所需参数    条件成立函数执行  条件不成立返回一个函数  函数调用时当前参数(sumArgs)与传入参数(args)传给exec函数                
        return sumArgs.length >= fn.length ? fn(...sumArgs) : (...args: any[]) => exec([...sumArgs, ...args])
    }
    return exec() // 收集每次执行时传入得参数 第一次默认为空
}
curring(isType)('ss')('sting')

export {}

