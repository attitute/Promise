


const Promise = require('./bundle')
let fs = require('fs');



// 常用
// let promise = new Promise((resolve,reject)=>{
//     resolve('1')
// }).then((data)=>{
//     return data
// }).then((data)=>{
//     console.log(data)
// })
// 异步返回resolve 或reject  发布订阅处理
// let promise1 = new Promise((resolve,reject)=>{
//     setTimeout(() => {
//         reject('ok');
//     }, 1000);
// }).then(data=>{
//     return 1
// },err=>{ 
//     return 100
// })
// promise1.then(data=>{
//     console.log(data,'**');
// },err=>{
//     console.log(err,'----');
// })

// 返回一个promise 处理
// let promise2 = new Promise((resolve, reject) => {
//     resolve('ok')
// }).then(data => {
//     console.log(data, 'success')
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             reject(new Promise((resolve, reject) => { // 
//                 setTimeout(() => {
//                     resolve(100);
//                 }, 100);
//             }));
//         }, 1000)
//     })
// }, err => {

// });
// let promise3 = promise2.then(data => {
//     console.log('success', data);
// }, err => {
//     console.log('err')
//     console.log('fail', err); // 返回一个promise
//     return err
// }).then((data)=>{
//     console.log(data,'then')
// })

// then空值一直then 

// let promise4 = new Promise((resolve,reject)=>{
//     resolve('success')
// }).then().then((data)=>{
//     console.log(data)
// })

// 对象中then方法  将then函数取出 call指向x 不调用get属性取值操作 避免了下面的报错

// let resultObj = {}
// let index = 0;
// Object.defineProperty(resultObj,'then',{
//     get(){
//         if(++index == 2){
//             throw new Error('出错了')
//         }
//     }
// })
// let promise2 = new Promise((resolve,reject)=>{
//     resolve('ok')
// }).then(data=>{
//    return resultObj // 我等待我自己去干些事， 我没有任何动作
// },err=>{
   
// }).then(data=>{
//     console.log(data.then,'success');
//     return data
// },err=>{
//     console.log(err,'999')
// }).then(data=>{
//     console.log(data,'success1')
// },err=>{
//     console.log(err,'error')
// })

// dedeferred 延迟对象
// Promise.deferred = function () {
//     let dfd = {} as any;
//     dfd.promise = new Promise((resolve,reject)=>{
//         dfd.resolve = resolve;
//         dfd.reject = reject;
//     })
//     return dfd;
// }
// function read(url) {
//     let dfd = Promise.deferred(); // 延迟对象
//     fs.readFile(url, 'utf8', function(err, data) {
//         if (err) dfd.reject(err)
//         // console.log(data,'read')
//         dfd.resolve(data);
//     })
//     return dfd.promise
// }
// read('./a.txt').then((data => {
//     return read(data);
// })).then(data => {
//     console.log(data,'then1');
// }).catch(err=>{
//     console.log(err,'catch');
// }).then(data=>{
//     console.log(data,'then2');
// });


// ------promise.all

// Promise.all([read('./a.txt'),read('./b.txt'),2,read('./c.txt')]).then(data=>{
//     console.log(data,':then')
// },(err)=>{
//     console.log(err, 'err')
// })


// -----promise.finally
 // finally规则 resolve只返回自己的Promise  
 // resolve情况 finally中resolve返回不修改最初值
 // reject 情况 finally中reject返回会修改最初值 如果返回resolve则不影响
// Promise.reject('ok').finally(()=>{
//     return new Promise((resolve,reject)=>{
//         setTimeout(() => {
//             resolve('err')
//         }, 1000)
//     })
// }).then((data)=>{
//     console.log(data,'data')
// },(err)=>{
//     console.log('err',err)
// })

// promise.race() 返回第一个结果

// const promiser1 = new Promise((resolve,reject)=>{
//     setTimeout(() => { 
//         resolve('1')
//     }, 1000);
// })
// const promiser2 = new Promise((resolve,reject)=>{
//     setTimeout(() => {
//         reject('2')
//     }, 500);
// })
 
// Promise.race([promiser1,promiser2]).then(data=>{
//     console.log('race:', data)
// },(err)=>{
//     console.log('err', err)
// })

// promise.race 使用场景 不要超时的返回结果 超时就不需要了


// const promiser3 = new Promise((resolve,reject)=>{
//     setTimeout(() => { 
//         resolve('1')
//     }, 2000);
// })

// function wrap(p){
//     let abort;
//     let p2 = new Promise((resolve,reject)=>{
//         abort = reject
//     })
//     let p3 = Promise.race([p,p2])
//     p3.abort = abort
//     return p3
// }
// let p = wrap(promiser3)
// setTimeout(() => {
//     p.abort('fail')
// }, 1000);
// p.then((data)=>{
//     console.log('data',data)
// },(err)=>{
//     console.log('err',err)
// })


// promise.allSettled([]) // 无论成功失败执行完毕 返回所有结果

Promise.allSettled([promiser1,promiser2]).then(data=>{
    console.log(data)
})


