


const Promise =require('./bundle')


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
let promise2 = new Promise((resolve, reject) => {
    resolve('ok')
}).then(data => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(100);
                }, 100);
            }));
        }, 1000)
    })
}, err => {

});
let promise3 = promise2.then(data => {
    console.log('success', data);
}, err => {
    console.log('fail', err);
})