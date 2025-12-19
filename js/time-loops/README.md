# 时间循环练习题

下面是围绕“时间与循环”主题设计的练习题，共 10 题。从基础到进阶，覆盖字符串处理、循环、日期时间 API、数组组合等常见技能。建议在 `exercises.js` 中按题号实现对应函数。

1. 输出一天中的所有分钟时间点  
   - 生成从 `00:00` 到 `23:59` 的所有时间字符串，共 1440 个，格式为 `HH:MM`。  
   - 对应函数：`listAllMinutes() -> string[]`

2. 秒数格式化为 `HH:MM:SS`  
   - 输入一个非负整数秒数，返回 `HH:MM:SS` 格式字符串，允许超过 24 小时。  
   - 对应函数：`formatSeconds(totalSeconds: number) -> string`

3. 生成时间序列（等间隔）  
   - 给定开始时间、结束时间与间隔分钟数，生成闭区间内的时间点序列，格式 `HH:MM`。  
   - 示例：`09:00` 到 `11:00`，间隔 `30` 分钟，输出 `["09:00","09:30","10:00","10:30","11:00"]`。  
   - 对应函数：`generateTimeSeries(start: string, end: string, stepMinutes: number) -> string[]`

4. 找出一天中的所有回文时间  
   - 在 `00:00` 到 `23:59` 中，找到所有满足 `HHMM` 为回文的时间，如 `01:10`、`02:20`、`12:21`。  
   - 对应函数：`palindromeTimes() -> string[]`

5. 统计时间范围内的周末天数  
   - 输入两个日期字符串 `YYYY-MM-DD`（闭区间），统计其中周六、周日的总天数。  
   - 对应函数：`countWeekendDays(startDate: string, endDate: string) -> number`

6. 月日历网格生成  
   - 输入年份与月份，返回按周分组的日期网格，前后用 `0` 补齐。  
   - 示例：`monthGrid(2025, 12)` 返回一个二维数组，内部每行 7 个数，非本月日期用 `0`。  
   - 对应函数：`monthGrid(year: number, month: number) -> number[][]`

7. 排序时间（跨午夜）  
   - 输入一组 `HH:MM` 时间字符串，按时间顺序排序，`00:10` 应排在 `23:50` 之后（跨午夜视为次日更早）。  
   - 可参数化一个锚点时间，基于该锚点进行循环排序。  
   - 对应函数：`sortTimes(times: string[], anchor?: string) -> string[]`

8. 倒计时生成器  
   - 输入秒数，返回一个数组，包含从输入值到 `0` 的每秒计数，格式为 `HH:MM:SS`。  
   - 对应函数：`countdownSeries(totalSeconds: number) -> string[]`

9. 生成每周时间段表  
   - 给定一周的开始日期（周一）与每天的起止时间及间隔分钟数，生成一周 7 天的时间段表。  
   - 对应函数：`weeklySlots(monday: string, start: string, end: string, stepMinutes: number) -> Record<string, string[]>`

10. 不同时区时间映射  
   - 输入一个 ISO 时间字符串与一组 IANA 时区标识，返回各时区的本地时间 `YYYY-MM-DD HH:MM`。  
   - 对应函数：`mapTimeZones(isoTime: string, zones: string[]) -> Record<string, string>`

使用方式  
- 在 `exercises.js` 中实现上述函数。  
- 打开 `index.html` 在浏览器控制台调试。  
- 可自由新增辅助函数，但请保持函数签名一致，方便对照练习题。

