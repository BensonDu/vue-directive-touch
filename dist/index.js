'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function () {
    var Helper = {
        getTimestamp: function getTimestamp() {
            return new Date().getTime();
        },
        getRandomKey: function getRandomKey() {
            return 'vue-touch-' + (Math.random() + '').replace(/\D/g, '');
        },
        getType: function getType(start, end) {
            var type = null;
            var ratio = window.devicePixelRatio;
            var during = end.T - start.T;
            var h = (end.X - start.X) / ratio;
            var v = (end.Y - start.Y) / ratio;
            var absh = Math.abs(h);
            var absv = Math.abs(v);
            var move = Math.sqrt(Math.pow(h, 2) + Math.pow(v, 2));
            switch (true) {
                case during < 3:
                    break;
                case during > 500 && move < 20:
                    type = 'long';
                    break;
                case move < 10:
                    type = 'tap';
                    break;
                case h > 0 && absv < 20:
                    type = 'right';
                    break;
                case h < 0 && absv < 20:
                    type = 'left';
                    break;
                case v > 0 && absh < 20:
                    type = 'down';
                    break;
                case v < 0 && absh < 20:
                    type = 'up';
                    break;
                default:
            }
            return type;
        },
        getEventName: function getEventName() {
            return isMobile ? {
                start: 'touchstart',
                end: 'touchend'
            } : {
                start: 'mousedown',
                end: 'mouseup'
            };
        },
        attachEvent: function attachEvent(el, handler, capture) {
            var event = Helper.getEventName();
            el.addEventListener(event.start, handler.start, capture);
            el.addEventListener(event.end, handler.end, capture);
        },
        detachEvent: function detachEvent(el, handler) {
            var event = Helper.getEventName();
            el.removeEventListener(event.start, handler.start);
            el.removeEventListener(event.end, handler.end);
        }
    };
    var vueTouch = {};
    var isMobile = 'ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 || /(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i.test(navigator.userAgent);
    var modifierRules = function modifierRules(dom, e, modifiers) {
        /* 禁止冒泡 */
        modifiers.stop && e.stopPropagation();
        /* 阻止默认事件 */
        modifiers.prevent && e.preventDefault();
        /* 元素本身事件 */
        if (modifiers.self && dom !== e.target) {
            return false;
        }
        return true;
    };
    var newHandler = function newHandler(type) {
        return {
            start: function start(e) {
                var key = this['vue-touch-id'];
                var data = workSpace[key][type];
                var method = data.method;
                var modifiers = data.modifiers;
                var start = data.start;
                if (isMobile) {
                    start.X = e.touches[0].pageX;
                    start.Y = e.touches[0].pageY;
                } else {
                    start.X = e.screenX;
                    start.Y = e.screenY;
                }
                start.T = Helper.getTimestamp();
                /* 修饰符策略 */
                if (!modifierRules(this, e, modifiers)) {
                    return false;
                }
                /* 周期开始 */
                data.cycle = 1;
                /* 长按计时器 */
                if (type === 'long') {
                    if (data.timer) clearTimeout(data.timer);
                    data.timer = setTimeout(function () {
                        data.cycle < 3 && method(e);
                        data.timer = 0;
                    }, 300);
                }
            },
            end: function end(e) {
                var end = {
                    X: 0,
                    Y: 0,
                    T: Helper.getTimestamp()
                };
                if (isMobile) {
                    end.X = e.changedTouches[0].pageX;
                    end.Y = e.changedTouches[0].pageY;
                } else {
                    end.X = e.screenX;
                    end.Y = e.screenY;
                }

                var key = this['vue-touch-id'];
                var data = workSpace[key][type];
                var method = data.method;
                var modifiers = data.modifiers;
                var start = data.start;
                /* 周期完成 */
                data.cycle = 3;
                if (!type || Helper.getType(start, end) !== type) return false;
                /* 修饰符策略 */
                if (!modifierRules(this, e, modifiers)) {
                    return false;
                }
                /* 事件执行 */
                type !== 'long' && method(e, start, end);
                /* 单次执行结束后释放事件及数据 */
                if (modifiers.once) {
                    Helper.detachEvent(this, data.handler);
                    delete workSpace[key][type];
                }
                /* 执行 afterEvent Hook */
                if (afterEvent !== null) {
                    afterEvent(this, type, e);
                }
            }
        };
    };
    var afterEvent = null;
    var workSpace = {};

    vueTouch.install = function (Vue, options) {
        if (options && options.afterEvent && typeof options.afterEvent === 'function') afterEvent = options.afterEvent;
        Vue.directive('touch', {
            bind: function bind(el, binding) {
                var type = binding.arg;
                var modifiers = binding.modifiers;
                var capture = !!modifiers.capture;
                var method = binding.value;
                var key = '';

                if (typeof binding.value !== 'function' || !binding.arg) {
                    return console.error('[Vue warn]: Invalid parameter, Expected Function.');
                }

                if (el.hasOwnProperty('vue-touch-id')) {
                    key = el['vue-touch-id'];
                } else {
                    key = el['vue-touch-id'] = Helper.getRandomKey();
                    workSpace[key] = {};
                }
                var handler = newHandler(type);
                workSpace[key][type] = {
                    method: method,
                    modifiers: modifiers,
                    handler: handler,
                    start: {
                        X: 0,
                        Y: 0,
                        T: 0
                    },
                    timer: 0,
                    cycle: 0
                };
                Helper.attachEvent(el, handler, capture);
            },
            update: function update(el, binding) {
                var type = binding.arg;
                var method = binding.value;
                var key = el['vue-touch-id'];
                var data = workSpace[key];
                if (data.hasOwnProperty(type)) {
                    data[type].method = method;
                }
            },
            unbind: function unbind(el) {
                var key = el['vue-touch-id'];
                var data = workSpace[key];
                for (var i in data) {
                    if (data.hasOwnProperty(i) && i) {
                        Helper.detachEvent(el, data[i].handler);
                    }
                }
                delete workSpace[key];
            }
        });
    };

    if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == "object") {
        module.exports = vueTouch;
    } else if (typeof define == "function" && define.amd) {
        define([], function () {
            return vueTouch;
        });
    } else if (window.Vue) {
        window.vueTouch = vueTouch;
        Vue.use(vueTouch);
    }
}();