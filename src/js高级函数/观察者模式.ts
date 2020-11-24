// 首先了解发布订阅与 观察者模式的区别

// 1. 发布订阅 是通过中间的第三方arr变量  使发布订阅产生关系
// 2. 观察模式 被观察者自身就能够通知观察者  (内部还是发布订阅)

class Subject { // 被观察者
    say:string = '我给你画画'
    observers!:Observe[] // 非空断言
    constructor(public name:string){}
    attach(o:Observe){
        this.observers.push(o)
    }

    setSay(newsay:string){
        this.say = newsay
        this.observers.forEach(v=>v.update(this))
    }

}

class Observe { // 观察者
    constructor(public name:string){
    }
    update(jack:Subject){
        console.log(jack.name+ '对' +this.name + '说:' + jack.say)
    }

}

let jack = new Subject('jack')
let rose = new Observe('rose')

jack.attach(rose)
jack.setSay('You jump! I jump!')