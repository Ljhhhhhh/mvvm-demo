class MVVM {
  constructor(options) {
    // 挂载可用数据到实例上
    this.$el = options.el;
    this.$data = options.data;

    // 如果含有模板就去编译
    if (this.$el) {
      // 数据劫持处理
      new Observer(this.$data);
      // 使key可以直接拿到拿到data[key]的值
      this.proxyData(this.$data);

      // 用数据和元素进行编译
      new Compile(this.$el, this);
    }
  }

  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(newValue) {
          data[key] = newValue;
        }
      })
    })
  }
}