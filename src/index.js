!function() {
    let Helper = {
        getTimestamp(){
            return new Date().getTime();
        },
        getRandomKey(){
            return 'vue-touch-' + (Math.random() + '').replace(/\D/g, '');
        },
        getType(start,end){
            let type = null;
            let ratio = window.devicePixelRatio;
            let during = end.T - start.T;
            let h = (end.X - start.X)/ratio;
            let v = (end.Y - start.Y)/ratio;
            let absh = Math.abs(h);
            let absv = Math.abs(v);
            let move = Math.sqrt(Math.pow(h,2) + Math.pow(v,2));
            switch (true){
                case (during < 8):
                    break;
                case (during > 300):
                    type = 'long';
                    break;
                case (move < 10):
                    type = 'tap';
                    break;
                case (h > 0 && absv < 20):
                    type = 'right';
                    break;
                case (h < 0 && absv < 20):
                    type = 'left';
                    break;
                case (v > 0 && absh < 20):
                    type = 'down';
                    break;
                case (v < 0 && absh < 20):
                    type = 'up';
                    break;
                default:
            }
            return type;
        },
        getEventName(){
            return isMobile ? {
                start: 'touchstart',
                end : 'touchend'
            } : {
                start : 'mousedown',
                end : 'mouseup'
            };
        },
        attachEvent(el,handler,capture){
            let event = Helper.getEventName();
            el.addEventListener(event.start,handler.start,capture);
            el.addEventListener(event.end,handler.end,capture);
        },
        detachEvent(el,handler){
            let event = Helper.getEventName();
            el.removeEventListener(event.start,handler.start);
            el.removeEventListener(event.end,handler.end);
        }
    };
    let vueTouch = {};
    let isMobile = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    let modifierRules = function (dom,e, modifiers) {
        /* 禁止冒泡 */
        modifiers.stop && e.stopPropagation();
        /* 阻止默认事件 */
        modifiers.prevent && e.preventDefault();
        /* 元素本身事件 */
        if(modifiers.self && dom !== e.target){
            return false;
        }
        return true;
    };
    let newHandler = function (type) {
        return  {
            start(e){
                let key = this['vue-touch-id'];
                let data = workSpace[key][type];
                let method = data.method;
                let modifiers = data.modifiers;
                let start = data.start;
                if(isMobile){
                    start.X = e.touches[0].pageX;
                    start.Y = e.touches[0].pageY;
                }
                else{
                    start.X = e.screenX;
                    start.Y = e.screenY;
                }
                start.T = Helper.getTimestamp();
                /* 修饰符策略 */
                if(!modifierRules(this,e,modifiers)){
                    return false;
                }
                /* 周期开始 */
                data.cycle = 1;
                /* 长按计时器 */
                if(type === 'long'){
                    if(data.timer)clearTimeout(data.timer);
                    data.timer = setTimeout(function () {
                        data.cycle < 3 && method(e);
                        data.timer = 0;
                    },300);
                }
            },
            end(e){
                let end = {
                    X : 0,
                    Y : 0,
                    T : Helper.getTimestamp()
                };
                if(isMobile){
                    end.X = e.changedTouches[0].pageX;
                    end.Y = e.changedTouches[0].pageY;
                }
                else{
                    end.X = e.screenX;
                    end.Y = e.screenY;
                }

                let key = this['vue-touch-id'];
                let data = workSpace[key][type];
                let method = data.method;
                let modifiers = data.modifiers;
                let start = data.start;
                /* 周期完成 */
                data.cycle = 3;
                if(!type || Helper.getType(start,end) !== type)return false;
                /* 修饰符策略 */
                if(!modifierRules(this,e,modifiers)){
                    return false;
                }
                /* 事件执行 */
                type !== 'long' && method(e);
                /* 单次执行结束后释放事件及数据 */
                if(modifiers.once){
                    Helper.detachEvent(this,data.handler);
                    delete workSpace[key][type];
                }
            }
        }
    };
    let workSpace = {};

    vueTouch.install = function(Vue) {
        Vue.directive('touch',{
            bind(el,binding){
                let type = binding.arg;
                let modifiers  = binding.modifiers;
                let capture = !!modifiers.capture;
                let method = binding.value;
                let key = '';

                if(typeof binding.value !== 'function' || !binding.arg){
                    return console.error('[Vue warn]: Invalid parameter, Expected Function.');
                }

                if(el.hasOwnProperty('vue-touch-id')){
                    key = el['vue-touch-id'];
                }
                else{
                    key = el['vue-touch-id'] = Helper.getRandomKey();
                    workSpace[key] = {};
                }
                let handler = newHandler(type);
                workSpace[key][type] = {
                    method,
                    modifiers,
                    handler,
                    start : {
                        X : 0,
                        Y : 0 ,
                        T : 0
                    },
                    timer : 0,
                    cycle : 0
                };
                Helper.attachEvent(el,handler,capture);
            },
            update(el,binding){
                let type = binding.arg;
                let method = binding.value;
                let key = el['vue-touch-id'];
                let data = workSpace[key];
                if(data.hasOwnProperty(type)){
                    data[type].method = method;
                }
            },
            unbind(el){
                let key = el['vue-touch-id'];
                let data = workSpace[key];
                for(let i in data){
                    if(data.hasOwnProperty(i) && i){
                        Helper.detachEvent(el,data[i].handler);
                    }
                }
                delete  workSpace[key];
            }
        });
    };

    if (typeof exports == "object") {
        module.exports = vueTouch;
    }
    else if (typeof define == "function" && define.amd) {
        define([], function(){ return vueTouch })
    }
    else if (window.Vue) {
        window.vueTouch = vueTouch;
        Vue.use(vueTouch);
    }
}();