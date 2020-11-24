
const Promise = require('./bundle')
console.log(Promise)
let promise = new Promise((resolve,reject)=>{
  resolve('12')
}).then((data)=>{
  console.log(data)
  return 1
}).then((data)=>{
  console.log(data)
  return 2
}).then((data)=>{
  console.log(data)
  return 3
})
