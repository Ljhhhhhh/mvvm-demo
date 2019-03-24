// 给数据添加观察者，当数据变化时执行对应方法
class Watcher{
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    // 获取旧值
    this.value = this.get();
  }

  getVal(vm, expr) {
    expr = expr.split('.');
    return expr.reduce((prev, next) => {
      return prev[next];
    }, vm.$data);
  }

  get() {
    Dep.target = this;
    let value = this.getVal(this.vm, this.expr);
    Dep.target = null;
    return value;
  }

  update() {
    let newVal = this.getVal(this.vm, this.expr);
    let oldVal = this.value;
    if (newVal !== oldVal) {
      this.cb(newVal); // 对应watcher的callback函数
    }
  }
}