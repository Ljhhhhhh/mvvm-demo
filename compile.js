class Compile{
  constructor(el ,vm) {
    this.el = this.isElememtNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    if (this.el) {
      // 把需要操作的dom先放到内存中
      let fragment = this.node2fragment(this.el);
      // 编译：提取元素节点的v-model和文本节点{{}}
      this.compile(fragment);
      // 把编译完成的元素放到页面中
      this.el.appendChild(fragment);
    }
  }

  isElememtNode(node) {
    return node.nodeType === 1;
  }

  isDirective(name) {
     return name.startsWith('v-');
  }

  // 编译元素节点
  compileElement(node) {
    let attrs = node.attributes; // 获取当前节点的属性
    Array.from(attrs).forEach(attr => {
      let attrName = attr.name;
      // 如果是指令进行数据处理
      if (this.isDirective(attrName)) {
        let expr = attr.value;
        let [,type] = attrName.split('-');
        CompileUtil[type](node, this.vm, expr)
      }
    })
  }

  // 编译文本节点
  compileText(node) {
    let expr = node.textContent;
    // 匹配开头是{{结尾是}}并且中间不存在}的值
    let reg = /\{\{([^}]+)\}\}/g;
    if (reg.test(expr)) {
      CompileUtil['text'](node, this.vm, expr);
    }
  }

  node2fragment(el) {
    // 创建文档碎片
    let fragment = document.createDocumentFragment();
    let firstChild;
    while(firstChild = el.firstChild) {
      // 把dom元素移入到fragment
      fragment.appendChild(firstChild);
    }
    return fragment;
  }

  compile(fragment) {
    // 获取fragment的所有子元素
    let childNodes = fragment.childNodes;
    Array.from(childNodes).forEach(node => {
      if (this.isElememtNode(node)) {
        // 编译元素
        this.compileElement(node);
        // 递归执行
        this.compile(node);
      } else {
        this.compileText(node);
      }
    })
  }
}

// 编译所需的辅助方法
CompileUtil = {
  getVal(vm, expr) { // 获取实例上对应的数据
    expr = expr.split('.');
    return expr.reduce((prev, next) => {
      return prev[next];
    }, vm.$data);
  },
  
  getTextVal(expr, vm) {
    return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
      return this.getVal(vm, arguments[1]);
    });
  },

  setVal(vm, expr, value) {
    console.log(expr)
    expr = expr.split('.');
    return expr.reduce((prev, next, currentIndex) => {
      if (currentIndex === expr.length - 1) {
        return prev[next] = value;
      }
      return prev[next];
    }, vm.$data);
  },

  text(node, vm, expr) { // 文本处理
    let updateFn = this.updater['textUpdater'];
    let value = this.getTextVal(expr, vm);
    // 替换掉{{}}符号
    expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
      new Watcher(vm, arguments[1], () => {
        // 数据变化，文本节点需要重新获取依赖的数据并更新内容
        updateFn && updateFn(node, this.getTextVal(expr, vm));
      })
    });
    updateFn && updateFn(node, value);
  },

  model(node, vm ,expr) { // v-model处理
    let updateFn = this.updater['modelUpdater'];
    new Watcher(vm, expr,(newVal) => {
      // 当值变化后调用cb传递新值
      updateFn && updateFn(node, this.getVal(vm, expr));
    });
    node.addEventListener('input', (e) => {
      let newValue = e.target.value;
      this.setVal(vm, expr, newValue);
    })
    updateFn && updateFn(node, this.getVal(vm, expr));
  },

  updater: {
    textUpdater(node, value) {
      node.textContent = value;
    },
    modelUpdater(node, value) {
      node.value = value;
    }
  }
}