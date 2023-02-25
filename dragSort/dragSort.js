const MyEvent = {
    on: function (eventName, callback) {
        this._ev = this._ev || {};
        this._ev[eventName] = this._ev[eventName] || new Array();
        this._ev[eventName].push(callback);
    },
    emit: function (eventName, ...params) {
        if (this._ev?.[eventName]) {
            Array.prototype.forEach.call(this._ev[eventName], function (callback) {
                callback.apply(this, params);
            });
        }
    }
};


/**
 * 
 * @param {HTMLElement} el 
 * @param {Array} dataArr 
 */
function DraggableList(el) {
    el.classList.add('draggable-list');
    for (let fn in this) {
        if (fn.charAt(0) == '_' && typeof this[fn] === 'function') {
            el[fn.slice(1)] = this[fn].bind(this);
        }
    }
    this.listEl = el;
    // this.dataArr = undefined;
    // this.draggingEl = undefined;
}

DraggableList.prototype = {
    constructor: DraggableList,
    bindArr(dataArr) {
        let items = dataArr.map(v => this.createItem(v));
        this.listEl.replaceChildren(...items);
        this.dataArr = dataArr;
        return new Proxy(dataArr, {
            set: (_, key, value) => {
                this.sourceUpdate(key, value);
                return Reflect.set(...arguments);
            }
        })
    },
    _ondragstart(e) {
        // 获取当前拖动的元素
        this.draggingEl = e.target;
        // 添加moving样式
        setTimeout(() => {
            e.target.classList.add('moving');
        }, 0);
        // 设置被拖动元素允许移动到新的位置
        e.dataTransfer.effectAllowed = 'move';
    },
    _ondragend(e) {
        e.target.classList.remove('moving');
    },
    _ondragenter(e) {
        e.preventDefault();
        // 拖回到原来的位置，就什么也不做
        if (e.target === this.listEl || e.target === this.draggingEl) {
            return false;
        }
        // 记录起始位置
        this.record([e.target, this.draggingEl]);
        // 获取所有子元素
        const children = Array.from(this.listEl.children);
        // 当前劫持元素的索引值
        const sourceIndex = children.indexOf(this.draggingEl);
        // 覆盖到谁上面的索引值
        const targetIndex = children.indexOf(e.target);
        if (sourceIndex < targetIndex) {
            // insertBefore(要插入的节点，在谁前面)
            this.listEl.insertBefore(this.draggingEl, e.target.nextElementSibling);
        } else {
            this.listEl.insertBefore(this.draggingEl, e.target);
        }
        // 同步改变绑定的数组，并在DraggableList对象上触发changed事件
        this.dataArr.splice(targetIndex, 0, ...this.dataArr.splice(sourceIndex, 1));
        this.emit('changed', this.dataArr);
        // 传入改变位置的两个元素，比较差异，执行动画
        this.last([e.target, this.draggingEl]);
    },
    _ondragover(e) {
        e.preventDefault();
    },
    // 记录起始位置
    record(eleAll) {
        for (let i = 0; i < eleAll.length; i++) {
            const dom = eleAll[i];
            const { top, left } = dom.getBoundingClientRect();
            dom._top = top;
            dom._left = left;
        }
    },
    // 记录最后的位置，并执行动画
    last(eleAll) {
        function cancelRaf(dom) {
            cancelAnimationFrame(dom._rafId);
            dom._rafId = 0;
        }

        for (let i = 0; i < eleAll.length; i++) {
            const dom = eleAll[i];
            const { top, left } = dom.getBoundingClientRect();
            if (dom._left) {
                // 动画过程中使用了insertBefore，说明短时间内在往复拖动，就提前结束动画再记录起始位置
                if (dom._rafId) {
                    dom.style.transition = 'unset';
                    cancelRaf(dom);
                    this.record([dom]);
                }
                dom.style.transform = `translate3d(${dom._left - left}px,${dom._top - top}px,0px)`;
                dom._rafId = requestAnimationFrame(function () {
                    dom.style.transition = `transform 0.1s ease-out`;
                    dom.style.transform = 'none';
                });
                dom.addEventListener('transitionend', () => {
                    dom.style.transition = 'unset';
                    cancelRaf(dom);
                });
            }
        }
    },
    // 绑定的源数组发生更新时
    sourceUpdate(key, value) {
        if (key >= this.listEl.children.length) {
            let item = this.createItem(value);
            this.dataArr.push(value);
            this.listEl.appendChild(item);
        } else if (key === 'length') {
            while (this.listEl.children.length > value) {
                this.listEl.removeChild(this.listEl.lastElementChild);
            }
            this.dataArr.length = value;
        } else {
            this.listEl.children[key].innerText = value;
            this.dataArr[key] = value;
        }
        this.emit('changed', this.dataArr);
    },
    createItem(value) {
        let item = document.createElement('div');
        item.classList.add('draggable-list-item');
        item.draggable = true;
        item.innerText = value;
        return item;
    }
}
Object.assign(DraggableList.prototype, MyEvent);