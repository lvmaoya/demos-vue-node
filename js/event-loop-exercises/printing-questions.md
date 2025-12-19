# JS 事件循环常见打印题目（预测输出顺序）

请阅读每道题的代码，先在脑中预测打印顺序，再在浏览器控制台验证。所有题目均为浏览器环境。

1) 基础题：同步、定时器、微任务
```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
```

2) 多个微任务的顺序
```js
Promise.resolve().then(() => console.log('A'));
Promise.resolve().then(() => console.log('B'));
queueMicrotask(() => console.log('C'));
console.log('D');
```

3) then 链的排队
```js
Promise.resolve().then(() => {
  console.log('A');
}).then(() => {
  console.log('B');
});
console.log('C');
```

4) async/await 的位置
```js
async function run() {
  console.log('A');
  await Promise.resolve();
  console.log('B');
}
run();
console.log('C');
```

5) 计时器中创建微任务
```js
console.log('A');
setTimeout(() => {
  console.log('B');
  Promise.resolve().then(() => console.log('C'));
}, 0);
Promise.resolve().then(() => console.log('D'));
console.log('E');
```

6) setTimeout 0 与 setTimeout 10
```js
setTimeout(() => console.log('A'), 0);
setTimeout(() => console.log('B'), 10);
console.log('C');
Promise.resolve().then(() => console.log('D'));
```

7) requestAnimationFrame 与微任务
```js
console.log('A');
requestAnimationFrame(() => console.log('B'));
Promise.resolve().then(() => console.log('C'));
console.log('D');
```

8) MessageChannel 与定时器
```js
const channel = new MessageChannel();
channel.port1.onmessage = () => console.log('A');
channel.port2.postMessage('x');
setTimeout(() => console.log('B'), 0);
console.log('C');
Promise.resolve().then(() => console.log('D'));
```

9) 微任务饥饿
```js
let count = 0;
function loop() {
  if (count++ < 3) {
    Promise.resolve().then(loop);
  }
}
loop();
setTimeout(() => console.log('A'), 0);
console.log('B');
```

10) MutationObserver 的批处理
```html
<div id="x"></div>
<script>
const target = document.getElementById('x');
const mo = new MutationObserver(() => console.log('A'));
mo.observe(target, { childList: true });
target.append('1');
target.append('2');
Promise.resolve().then(() => console.log('B'));
console.log('C');
</script>
```

11) 事件回调中的任务
```html
<button id="btn">Click</button>
<script>
btn.addEventListener('click', () => {
  console.log('A');
  setTimeout(() => console.log('B'), 0);
  Promise.resolve().then(() => console.log('C'));
});
console.log('D');
</script>
```

12) 错误传播
```js
Promise.resolve().then(() => {
  console.log('A');
  throw new Error('x');
}).catch(() => console.log('B'));
setTimeout(() => {
  console.log('C');
  throw new Error('y');
}, 0);
console.log('D');
```

13) then 中的同步异常
```js
new Promise((resolve) => {
  resolve();
}).then(() => {
  console.log('A');
  JSON.parse('{'); // 同步异常
}).then(() => {
  console.log('B');
}).catch(() => {
  console.log('C');
});
console.log('D');
```

14) 链式 then 打断与续接
```js
Promise.resolve('A')
  .then(v => { console.log(v); return 'B'; })
  .then(v => { console.log(v); throw 'err'; })
  .then(() => console.log('C'))
  .catch(() => console.log('D'))
  .then(() => console.log('E'));
console.log('F');
```

15) 组合大题
```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => {
  console.log('C');
  setTimeout(() => console.log('D'), 0);
});
requestAnimationFrame(() => console.log('E'));
console.log('F');
```

