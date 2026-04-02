---
title: Leetcode Hot 100 最小覆盖子串
published: 2026-04-02
description: "Leetcode Hot 100 滑动窗口板块经典题：最小覆盖子串。本文用双指针加哈希计数拆解如何用 have / need 在 O(1) 代价下判断窗口是否已经覆盖目标串。"
image: "https://img.102465.xyz/file/1775143481086_minimum-window-substring-cover.jpg"
tags: ["Leetcode", "Hot 100", "滑动窗口", "哈希表", "字符串", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 继续推进，这回轮到滑动窗口里的硬菜代表：**最小覆盖子串**。

这题第一眼看上去像是在字符串里找答案，
真正的考点其实是另一句老话：

> **窗口怎么判断“已经够了”，又怎么在“刚刚够”的时候继续压缩到最短。**

说白了，右指针负责纳新，左指针负责瘦身，
而 `have == need` 这句，就是窗口的通关文牒。

## 题目链接

[LeetCode 76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给你两个字符串 `s` 和 `t`，请你在 `s` 中找出包含 `t` 所有字符的最小子串。

如果不存在这样的子串，返回空字符串 `""`。

注意这里的“覆盖”不是只看字符有没有出现，
而是要连**出现次数**也一起算上。

比如：

- `t = "ABC"`，那窗口里至少要有 `A`、`B`、`C`
- `t = "AABC"`，那窗口里就必须至少有两个 `A`

![最小覆盖子串题目截图](https://img.102465.xyz/file/1775143481086_minimum-window-substring-cover.jpg)

## 解题思路：滑动窗口 + 哈希计数

这题最自然的做法就是滑动窗口。

我们维护一个区间 `[left, right]`：

- `right` 不断向右扩张，把字符纳入窗口
- 当窗口已经覆盖 `t` 时，尝试移动 `left` 收缩窗口
- 在所有合法窗口里，持续更新最短答案

思路听上去不难，难点在于：

> **如何低成本判断当前窗口是否已经覆盖了 `t`。**

如果每次都拿窗口计数表和 `t` 的计数表做一遍完整比较，
那就会多出不少无谓开销。

所以这里要用一个更省的办法。

## 关键设计：`have` 和 `need`

先统计目标串 `t` 中每个字符需要多少次：

```python
counter = Counter(t)
```

再维护当前窗口中的字符频次：

```python
p_counter = Counter()
```

然后定义两个变量：

- `unique_char = len(counter)`：目标串里一共有多少种不同字符需要满足
- `have`：当前窗口里已经满足要求的字符种类数

这样一来，窗口是否合法就不用每次暴力比较整个哈希表，
只需要看一句：

```python
have == unique_char
```

只要这句成立，说明当前窗口已经覆盖了 `t`。

这题真正的巧劲，就在这里。

## 为什么这套判断是 O(1)

假设 `t = "AABC"`，那么：

```python
counter = {
    'A': 2,
    'B': 1,
    'C': 1
}
```

此时：

```python
unique_char = 3
```

注意是 **3 种字符**，不是总长度 `4`。

后面在窗口扩张时：

- 如果某个字符数量**刚好达到要求**，那么 `have += 1`
- 如果某个字符数量在收缩后**跌破要求**，那么 `have -= 1`

于是“窗口是否覆盖目标串”这个问题，
就被压缩成了一个整数比较。

妙就妙在：

> **不重复审判全员，只盯着达标名单。**

## 代码实现

```python
from collections import Counter

class Solution(object):
    def minWindow(self, s, t):
        """
        :type s: str
        :type t: str
        :rtype: str
        """
        n, m = len(s), len(t)
        if m > n:
            return ""

        counter = Counter(t)
        p_counter = Counter()
        ans_length = float('inf')

        left_res, right_res = 0, 0
        left = 0

        unique_char = len(counter)
        have = 0

        for right, item in enumerate(s):
            p_counter[item] += 1
            if p_counter[item] == counter[item]:
                have += 1

            while left <= right and have == unique_char:
                if ans_length > right - left + 1:
                    ans_length = right - left + 1
                    left_res, right_res = left, right

                p_counter[s[left]] -= 1
                if p_counter[s[left]] < counter[s[left]]:
                    have -= 1
                left += 1

        return s[left_res:right_res + 1] if ans_length != float('inf') else ""
```

## 代码拆解

### 1. 统计目标串需求

```python
counter = Counter(t)
```

这个哈希表记录的是：

- 每个字符至少需要出现几次

比如：

```python
t = "AABC"
```

那么：

```python
counter = {
    'A': 2,
    'B': 1,
    'C': 1
}
```

### 2. 右指针扩张窗口

```python
for right, item in enumerate(s):
    p_counter[item] += 1
```

每次把 `s[right]` 纳入窗口，
并同步更新窗口内的字符频次。

### 3. 某个字符刚好达标时，更新 `have`

```python
if p_counter[item] == counter[item]:
    have += 1
```

这里必须是 `==`，不能写成 `>=`。

因为只有“刚刚达标”的那一刻，
才代表新增了一种满足要求的字符。

如果字符数量已经超过要求了，
那也不能重复给 `have` 加分，
不然窗口会开心过头，答案就会跑偏。

### 4. 当窗口合法时，开始收缩左边界

```python
while left <= right and have == unique_char:
```

这一句表示：

- 当前窗口已经覆盖了 `t`
- 可以尝试收缩，看看能不能把它压得更短

这就是“先扩张，后收缩”的标准滑窗节奏。

### 5. 更新最短答案

```python
if ans_length > right - left + 1:
    ans_length = right - left + 1
    left_res, right_res = left, right
```

每次遇到合法窗口，都尝试更新答案。

因为我们正在收缩左边界，
所以能走到这里的窗口，
往往比之前更精瘦。

### 6. 收缩窗口时，注意何时让 `have` 失效

```python
p_counter[s[left]] -= 1
if p_counter[s[left]] < counter[s[left]]:
    have -= 1
left += 1
```

这段是本题另一个关键点。

当左边字符被移出窗口后：

- 如果它的数量仍然不少于要求，窗口依然合法
- 如果它的数量跌破要求，窗口就不再覆盖 `t`

一旦跌破，就要执行：

```python
have -= 1
```

然后退出内层 `while`，继续让右指针扩张。

## 示例推演

以经典样例为例：

```python
s = "ADOBECODEBANC"
t = "ABC"
```

目标串需要：

```python
A: 1
B: 1
C: 1
```

所以：

```python
unique_char = 3
```

### 第一阶段：先扩到覆盖

随着 `right` 向右走，
窗口会逐渐变成：

```python
"ADOBEC"
```

这时：

- `A` 达标
- `B` 达标
- `C` 达标

于是：

```python
have == unique_char == 3
```

窗口第一次合法。

### 第二阶段：开始收缩

此时尝试移动 `left`：

- 能删就删
- 直到再删就不合法为止

这个过程的意义就是：

> **固定右端点，尽量把左端点往右推，得到当前最短合法窗口。**

### 第三阶段：继续扩张，再找更短答案

之后右指针继续往右，
窗口会经历：

- 失效
- 再次覆盖
- 再次收缩

最后找到最短答案：

```python
"BANC"
```

## 为什么这题不能用“只看字符是否出现过”来做

因为题目要求的是**覆盖所有字符及其次数**。

比如：

```python
t = "AABC"
```

如果窗口里只有：

```python
"ABC"
```

那显然不够，
因为还少一个 `A`。

所以这里不能只用一个 `set` 去判断字符是否出现过，
必须用计数表记录频次。

## 复杂度分析

### 时间复杂度

左右指针都只会从左到右各走一遍，
不会反复横跳。

所以时间复杂度是：

```python
O(n + m)
```

其中：

- `m` 用来统计 `t`
- `n` 用来遍历 `s`

如果简单写，也可以记成：

```python
O(n)
```

因为主过程就是对 `s` 的线性扫描。

### 空间复杂度

用了两个哈希表来统计字符频次，
空间复杂度为：

```python
O(|Σ|)
```

这里的 `|Σ|` 表示字符集大小。

如果按输入规模宽松记，也常写作：

```python
O(m)
```

## 易错点总结

### 1. `have` 增加时要用 `==`

正确写法：

```python
if p_counter[item] == counter[item]:
    have += 1
```

不是 `>=`。

否则同一个字符超额出现时，
可能被重复统计为“又达标了一次”。

### 2. 收缩窗口后要判断是否跌破需求

正确写法：

```python
p_counter[s[left]] -= 1
if p_counter[s[left]] < counter[s[left]]:
    have -= 1
```

这一步是窗口从“合法”变回“不合法”的分界线。

### 3. 记录答案时要在窗口合法时进行

如果窗口还没覆盖完整目标串，
就去更新答案，
那得到的只会是“短”，不是“对”。

### 4. 返回结果时直接切片即可

字符串切片本身就返回字符串：

```python
s[left_res:right_res + 1]
```

不用再额外 `join` 一遍，
别把已经切好的面又剁成馅。

## 小结

这题表面上是在找“最短子串”，
本质上是在练一个更高级的滑动窗口套路：

> **用频次表维护窗口状态，用 `have / need` 在 O(1) 代价下判断窗口是否合法。**

整套流程可以记成三句话：

- 右指针不断扩张，把字符请进来
- `have == unique_char` 时，说明窗口已经覆盖
- 左指针趁机收缩，把合法窗口压到最短

如果只记一句口诀，那就是：

> **先扩张，后收缩；够覆盖，再压缩。**

Hot 100 刷到这里，滑动窗口已经不只是“防重复”那点小打小闹了，
开始进入“既要合法，又要最短”的进阶模式。
这题一旦吃透，后面很多窗口题都会顺手不少。🦐
