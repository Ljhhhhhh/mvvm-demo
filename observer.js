class Observer {
  constructor(data) {
    this.observer(data);
  }

  observer(data) {
    if (!data || typeof data !== 'object') {
      return;
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
      this.observer(data[key]);
    });
  }

  // 劫持数据做响应式处理
  defineReactive(obj, key, value) {
    let self = this;
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set(newVal) {
        if (newVal !== value) {
          self.observer(newVal);
          value = newVal;
          dep.notify();
        }
      }
    });
  }
}

class Dep{
  constructor() {
    this.subs = [];
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}