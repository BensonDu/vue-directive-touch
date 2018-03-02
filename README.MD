# Vue 2.0 移动设备指令 ( Vue touch directive )

> 轻量级 Vue 2.0 移动触摸事件自定义指令；<br>
> 预设 tap up right down left long 触摸操作类型；<br>
> 完整支持 self once prevent capture stop 事件修饰符；<br>
> 自定义指令方法传参最佳实例；<br>
> 资源合理释放；<br>


## 安装：

> * ES6

``` bash
 
npm install vue-directive-touch --save; 

```

```javascript

import touch from 'vue-directive-touch';
Vue.use(touch);

```

> * 直接引入:
```html
<script src="./vue.js"></script>
<script src="./dist/index.js"></script>
```


## 使用 How to use:


### 常规


```html

<p v-touch:tap="eventFun">绑定事件</p>

<!-- 包含修饰符 -->
<p v-touch:tap.self.once.prevent.capture.stop="eventFun">绑定事件</p>

```

```javascript
new Vue({
	el: "dom",
	methods : {
		eventFun : function() {
			//事件方法
		}
	}
});
```

## 传参

```html
<ul>
	<li 
	    v-for = "(item,index) in list"
		v-touch:tap = "eventFunWithParam(index,item)"
		v-touch:tap = "eventFunNoParam"
		@click = "orginalFun(index,item,$event)"
	>
	</li>
</ul>
```

```javascript
new Vue({
	el: "dom",
	methods : {
	    /* 自定义指令方法: 附带参数 */
		eventFunWithParam : function(index,item) {
			return function(event, start, end) {
			    /*
			    *   event 为事件实例
			    *   start end 分别包含事件起始信息： X  --> 横坐标 | Y --> 纵坐标 | T --> 时间戳 
			    *   index、item 为方法传参
			    */
			    
			}
		},
		/* 自定义指令方法： 无传参 */
                eventFunNoParam : function(event, start, end) {
                      /*
                        *   event 为事件实例
                        *   start end 分别包含事件起始信息： X  --> 横坐标 | Y --> 纵坐标 | T --> 时间戳 
                        *   index、item 为方法传参
                        */
                },
		/* 原生 Vue 事件方法 */
		orginalFun : function(index,item,event) {
                    /*
                     *   event 为事件实例
                     *   index、item 为方法传参
                     */
		}
		
	}
});
```
<br><br>


## 事件类型：

> 单击：  v-touch:tap   <br>
> 长按：  v-touch:long  <br>
> 左滑：  v-touch:left   <br>
> 右滑：  v-touch:right  <br>
> 上滑：  v-touch:up     <br>
> 下滑：  v-touch:down   <br>

<br><br>

## 事件修饰符
##### 事件修饰符释义参照 Vue [官方文档](https://cn.vuejs.org/v2/guide/events.html#事件修饰符) <br><br><br>

## Vue 1.0 与 2.0 自定义指令开发的差异:
> Vue 2.0 版本自定义指令 API 相比 1.0 全部更改，在自定义指令开发层面完全不兼容，使用层面主要差异为："自定义指令方法的传参" <br>
> 例：<br>
> 在 Vue 1.0 中可以实现以下自定义指令 <br>
> v-touch="fun($index,param)" <br>
> Vue 2.0 的指令机制会直接将其解析为 expression，也就是自定义指令中的 fun($index,param) 会被直接执行，传递到生命周期中的值是 fun($index,param) 执行的结果；<br>
> Vue 2.0 相关机制更改的原因引用文档中的解释：" 有的情况下,你仍然需要对纯 DOM 元素进行底层操作,这时候就会用到自定义指令"，另外一个层面，也可以保持指令传递方法逻辑处理的统一；


## License

MIT

