"use strict";

// 该还原不考虑编译层
class Context {
  constructor() {
    this.next = 0;
    this.done = false;
  }
  stop() {
    this.done = true;
  }
  abrupt(v1,v2){
    this.done = true
    return v2
  }
}

let regeneratorRuntime = {
  mark(genFunc) {
    return genFunc; // 最外层generator函数
  },
  wrap(innerFn, outerFn) {
    let it = {};
    let context = new Context();
    it.next = function (v) {
      context.send = v
      let value = innerFn(context); // 函数返回值就是yiled后面的值
      return {
        value,
        done:context.done,
      };
    };
    return it;
  },
};

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(read); // read就是刚刚写的generator

function read() {
  var a, b;
  return regeneratorRuntime.wrap(function read$(_context) {
    while (1) {
      switch ((_context.prev = _context.next)) {
        case 0:
          _context.next = 2;
          return 1;

        case 2:
          a = _context.sent;
          console.log("a", a);
          _context.next = 6;
          return 2;

        case 6:
          b = _context.sent;
          return _context.abrupt("return", false);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}

var t = read();

var _t$next = t.next(),
  value = _t$next.value;

console.log(t.next(value));
console.log(t.next(value));
