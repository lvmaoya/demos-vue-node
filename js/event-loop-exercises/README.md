# JS 事件循环练习题

围绕浏览器环境的任务队列与微任务队列设计的练习题，共 12 题。建议在 `exercises.js` 中按题号实现对应函数并在控制台观察输出顺序。

1. 基础顺序判断  
   - 在同一脚本中依次调用 `console.log`、`setTimeout(..., 0)`、`Promise.resolve().then(...)`，预测并验证输出顺序。  
   - 函数：`ex1()`

2. 多个微任务的顺序  
   - 生成多个 `Promise.then` 与 `queueMicrotask`，观察它们的执行先后与插队效果。  
   - 函数：`ex2()`

3. async/await 的调度  
   - 使用 `async` 函数与 `await Promise.resolve()`，分析 `await` 前后日志在队列中的位置。  
   - 函数：`ex3()`

4. 计时器与微任务交织  
   - 在 `setTimeout(0)` 回调中创建新的微任务，比较其与外层微任务的执行先后。  
   - 函数：`ex4()`

5. MutationObserver 触发时机  
   - 对 DOM 进行多次修改并使用 `MutationObserver`，观察回调作为微任务的批处理行为。  
   - 函数：`ex5()`

6. requestAnimationFrame 与刷新周期  
   - 同时安排 `Promise.then` 与 `requestAnimationFrame`，比较它们与本轮任务结束、下一帧绘制之间的关系。  
   - 函数：`ex6()`

7. MessageChannel 与定时器  
   - 使用 `MessageChannel` 与 `setTimeout(0)`，比较两者作为宏任务的调度先后。  
   - 函数：`ex7()`

8. 微任务“饥饿”现象  
   - 连续链式创建大量微任务，观察宏任务被延迟的情况，并用定时器插入“让出控制权”。  
   - 函数：`ex8()`

9. 事件与回调顺序  
   - 在用户事件回调中安排微任务与定时器，分析它们与事件冒泡阶段的关系。  
   - 函数：`ex9()`

10. 错误传播对队列的影响  
   - 在微任务与宏任务中抛出错误，观察是否阻断后续队列及 `unhandledrejection` 行为。  
   - 函数：`ex10()`

11. 任务优先级模拟  
   - 基于多个队列（微任务、计时器、MessageChannel）模拟调度优先级，验证不同组合下的输出顺序。  
   - 函数：`ex11()`

12. 组合场景综合题  
   - 综合使用 `async/await`、`Promise.then`、`queueMicrotask`、`setTimeout`、`requestAnimationFrame`，给出输出序列并验证。  
   - 函数：`ex12()`

使用方式  
- 在 `exercises.js` 中实现上述函数。  
- 打开 `index.html` 在浏览器控制台调试。  
- 可自由新增辅助函数，但请保持函数命名一致，方便对照练习题。

