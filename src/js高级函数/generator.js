// 浏览器最早解决 异步方式 回调=>promise => generator => asyn + await

// generator在 开发中基本不用 react saga中有使用

// 使用generator 函数内部蛇形 第一步到yield 第二步 赋值a 再yield2 第三步赋值b 再return false
function * read() {
  let a = yield 1
  console.log('a',a)
  let b = yield 2
  
  return false
}

const t = read()
let {value} = t.next()
console.log(t.next(value)) // 传入value就是给上一个a赋值 { value: 2, done: false }
console.log(t.next(value)) // 传入value就是给上一个b赋值 后面没有内容 done为true{ value: false, done: true }