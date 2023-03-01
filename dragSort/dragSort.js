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
 * @param {Array} arr 
 */
function DraggableList(el) {
    el.classList.add('draggable-list');
    for (let fn in this) {
        if (fn.charAt(0) == '_' && typeof this[fn] === 'function') {
            el[fn.slice(1)] = this[fn].bind(this);
        }
    }
    el.replaceChildren();
    this.listEl = el;
}

DraggableList.prototype = {
    constructor: DraggableList,
    bindArr(arr) {
        if (!arr instanceof Array) {
            console.error(arr, 'is not an Array object.');
            return;
        }

        this.arr = arr = arr.map(item => this.createEl({ value: item }));
        let proxy = new Proxy(arr, {
            set: (target, property, value) => {
                // console.log(target, property, value);
                if (/^\d+$/.test(property)) {
                    if (target[property] === undefined) {
                        // console.log('add', property, value);
                        for (let i = target.length; i <= property; i++) {
                            target[i] = { value: i == property ? value : '' };
                            this.createEl(target[i]);
                        }
                    } else {
                        // console.log('directlyUpdate', property, target[property], value);
                        target[property].value = value;
                        this.directlyUpdate(target[property]);
                    }
                } else if (property === 'length') {
                    target[property] = value;
                    while (this.listEl.children.length > value) {
                        this.listEl.removeChild(this.listEl.lastElementChild);
                    }
                }
                this.emit('changed', this.proxy);
                return true;
            },
            get(target, property) {
                if (/^\d+$/.test(property)) {
                    return target[property]?.value;
                } else return target[property];
            },
        });

        let methods = {
            swap: (i, j) => {
                if (!this.arr[i] || !this.arr[j] || i === j) return;
                this.recordItems([this.arr[i], this.arr[j]]);
                if (i > j) [i, j] = [j, i];
                this.positionUpdate(i, this.arr[j]);
                this.transitionIn(this.arr[i]);
                this.positionUpdate(j + 1, this.arr[i]);
                this.transitionIn(this.arr[j]);
                [this.arr[i], this.arr[j]] = [this.arr[j], this.arr[i]];
            },
            moveTo: (i, j) => {  // i 移到 j
                if (!this.arr[i] || !this.arr[j] || i === j) return;
                let f = i < j ? 1 : -1;
                this.recordItems([this.arr[i]]);
                for (let k = i + f; (f == 1 ? k <= j : k >= j); k += f) {
                    this.recordItems([this.arr[k]]);
                    this.positionUpdate(f == 1 ? k - f : k - 2 * f, this.arr[k]);
                    this.transitionIn(this.arr[k]);
                }
                this.transitionIn(this.arr[i]);
                Array.prototype.splice.call(this.arr, j, 0, ...Array.prototype.splice.call(this.arr, i, 1))
            },
            unshift: (...items) => {
                this.recordItems(this.arr);
                items = items.map(item => this.createEl(
                    { value: item }, this.listEl.firstElementChild)
                );
                Array.prototype.unshift.apply(this.arr, items);
                this.updateAll();
            },
            shift: () => {
                this.recordItems(this.arr);
                this.listEl.removeChild(this.listEl.firstElementChild);
                Array.prototype.shift.apply(this.arr);
                this.updateAll();
            },
            splice: (start, length, ...items) => {
                this.recordItems(this.arr);
                for (let i = 0; i < length; i++)this.listEl.removeChild(this.listEl.children[start]);
                if (items) items = items.map(item => this.createEl(
                    { value: item }, this.listEl.children[start])
                );
                Array.prototype.splice.call(this.arr, start, length, ...items);
                this.updateAll();
            },
            reverse: () => {
                this.recordItems(this.arr);
                Array.prototype.reverse.apply(this.arr);
                this.updateAll();
            },
            sort: () => {
                this.recordItems(this.arr);
                Array.prototype.sort.call(this.arr, (a, b) => {
                    return a.value - b.value;
                });
                this.updateAll();
            }
        }
        for (let m in methods) {
            arr[m] = new Proxy(methods[m], {
                apply: (target, _, args) => {
                    target(...args);
                    this.emit('changed', this.proxy);
                }
            });
        }
        
        this.proxy = proxy;
        return proxy;
    },
    createEl(item, beforeNode) {
        if (item.el) return;
        let dom = document.createElement('div');
        dom.classList.add('draggable-list-item');
        dom.draggable = true;
        dom.innerText = item.value;
        dom._item = item;
        if (!beforeNode) this.listEl.appendChild(dom);
        else this.listEl.insertBefore(dom, beforeNode);
        item.el = dom;
        this.transitionIn(item);
        return item;
    },
    directlyUpdate(item) {
        item.el.innerText = item.value;
    },
    positionUpdate(key, item) {
        if (this.listEl.children[key] === item.el) return;
        let res = this.listEl.insertBefore(item.el, this.listEl.children[key]);
        // console.log(key, item, res);
    },
    updateAll() {
        this.arr.forEach((item, i) => {
            this.positionUpdate(i, item);
            this.transitionIn(item);
        });
    },
    recordItems(items) {
        items.forEach(item => {
            const { top, left } = item.el.getBoundingClientRect();
            item.pos = { top, left };
        });
    },
    transitionIn(item) {
        const dom = item.el;
        const { top, left } = dom.getBoundingClientRect();
        const pos = item.pos || { top, left: left + 50 };
        if (pos) {
            dom.style.transform = `translate3d(${pos.left - left}px,${pos.top - top}px,0px)`;
            setTimeout(() => {
                dom.style.transition = `transform 0.1s ease-out`;
                dom.style.transform = 'none';
            }, 10);
            !dom.ontransitionend && (dom.ontransitionend = () => {
                dom.style.transition = 'unset';
            });
        }
    },
    _ondragstart(e) {
        this.draggingEl = e.target;
        setTimeout(() => {
            e.target.classList.add('moving');
        }, 0);
        e.dataTransfer.effectAllowed = 'move';
    },
    _ondragend(e) {
        e.target.classList.remove('moving');
    },
    _ondragenter(e) {
        e.preventDefault();
        if (e.target === this.listEl || e.target === this.draggingEl) return false;
        let i = this.arr.indexOf(e.target._item),
            j = this.arr.indexOf(this.draggingEl._item);
        this.arr.moveTo(j, i);
    },
    _ondragover(e) {
        e.preventDefault();
    },
}
Object.assign(DraggableList.prototype, MyEvent);