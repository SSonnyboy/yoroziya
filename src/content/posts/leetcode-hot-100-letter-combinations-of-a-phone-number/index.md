---
title: Leetcode Hot 100 电话号码的字母组合
published: 2026-04-09
description: "Leetcode Hot 100 经典回溯题：电话号码的字母组合。本文用映射表加回溯梳理多叉树 DFS 思路，并说明为什么这题的 join 不一定需要额外拷贝。"
image: "https://img.102465.xyz/file/1775725262359_phone-letter-cover.jpg"
tags: ["Leetcode", "Hot 100", "回溯", "字符串", "DFS", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 刷到这题，手机按键盘终于上场营业了：**电话号码的字母组合**。

这题的画风很像回溯经典模板，但它不是“选或不选”的二叉树，
而是更像一棵**多叉树**：

- 当前数字能映射几个字母
- 这一层就会分出几个分支

所以这题的核心思路可以浓缩成一句话：

> **先把数字映射成字母集合，再用回溯一位一位去拼字符串。**

## 题目链接

[LeetCode 17. 电话号码的字母组合](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给定一个仅包含数字 `2-9` 的字符串 `digits`，返回它能表示的所有字母组合。
答案可以按任意顺序返回。

数字到字母的映射与电话按键相同，但注意 `1` 不对应任何字母。

![电话号码的字母组合题目截图](https://img.102465.xyz/file/1775725262359_phone-letter-cover.jpg)

## 解题思路：映射表 + 回溯

这题要做的事其实很直白：

- 每个数字都有一组可选字母
- 从左到右处理每一位数字
- 每次从当前数字对应的字母集合里选一个字符
- 直到所有位都选完，就得到一个完整组合

如果输入是：

```python
digits = "23"
```

那么对应关系是：

- `2 -> abc`
- `3 -> def`

于是最终组合就是：

```python
["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]
```

看出来了吧，这其实就是：

> **每一层递归处理一位数字，每个数字对应的字母就是这一层的所有分支。**

## 映射表怎么构造

这题最方便的写法，就是直接用数组保存映射关系：

```python
MAPPING = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
```

这样：

```python
MAPPING[2] == "abc"
MAPPING[3] == "def"
MAPPING[7] == "pqrs"
```

如果当前处理的数字字符是：

```python
digits[i]
```

那它对应的目标字母集合就是：

```python
MAPPING[int(digits[i])]
```

这比写一堆 `if-elif` 清爽多了，查表即用，不绕弯。

## 代码实现

```python
MAPPING = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]

class Solution(object):
    def letterCombinations(self, digits):
        """
        :type digits: str
        :rtype: List[str]
        """
        n = len(digits)
        if n == 0:
            return []

        ans = []
        vals = []

        def dfs(i):
            if i == n:
                ans.append(''.join(vals))
                return

            target = MAPPING[int(digits[i])]
            for ch in target:
                vals.append(ch)
                dfs(i + 1)
                vals.pop()

        dfs(0)
        return ans
```

## 回溯过程怎么理解

定义：

```python
dfs(i)
```

表示：

> **当前正在处理第 `i` 位数字，要从它对应的字母集合里挑一个字符。**

### 终止条件

当：

```python
i == n
```

说明所有数字都已经处理完了。

这时 `vals` 中存着的，就是一个完整的字母组合，
直接拼成字符串后加入答案：

```python
ans.append(''.join(vals))
```

### 当前层要做什么

取出当前数字对应的字母集合：

```python
target = MAPPING[int(digits[i])]
```

然后枚举里面每一个字符：

```python
for ch in target:
    vals.append(ch)
    dfs(i + 1)
    vals.pop()
```

这就是标准回溯模板：

1. 做选择
2. 递归进入下一层
3. 撤销选择

区别只在于：

- 全排列是“从未使用元素里选一个”
- 子集是“选或不选”
- 这题则是“从当前数字对应的字符集合里选一个”

骨架没变，只是分支来源换了。

## 为什么这是多叉树 DFS

这题和子集题最大的不同，在于每层分支数不固定。

比如：

- 数字 `2` 有 3 个分支：`a`、`b`、`c`
- 数字 `7` 有 4 个分支：`p`、`q`、`r`、`s`

所以如果输入是：

```python
digits = "27"
```

那递归树第一层会分成 3 路，
第二层每条路又继续分成 4 路。

这就是典型的多叉树深度优先搜索。

## 举个例子

假设：

```python
digits = "23"
```

### 第 0 位：数字 `2`

可选字母：

```python
a, b, c
```

如果先选 `a`，当前路径变成：

```python
vals = ['a']
```

### 第 1 位：数字 `3`

可选字母：

```python
d, e, f
```

依次尝试：

- `a + d` -> `"ad"`
- `a + e` -> `"ae"`
- `a + f` -> `"af"`

然后回到上一层，再尝试以 `b`、`c` 开头的情况。

最终得到：

```python
["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]
```

## 为什么这里 `join` 不一定需要额外拷贝

你原本写的是：

```python
ans.append(''.join(vals[:]))
```

这样当然没错。

但这题其实可以直接写成：

```python
ans.append(''.join(vals))
```

原因在于：

- `vals` 是可变列表
- 但 `''.join(vals)` 会立刻生成一个新的字符串对象
- 字符串在 Python 中是不可变的

也就是说，哪怕后面继续 `append` / `pop` 修改 `vals`，
已经加入 `ans` 的字符串也不会被影响。

所以这题和“全排列 / 子集”不太一样：

- 那两题收集的是列表，需要拷贝
- 这题收集的是新生成的字符串，不拷贝也安全

真正必须恢复现场的，是：

```python
vals.pop()
```

## 一个容易忽略的边界情况

如果输入是空字符串：

```python
digits = ""
```

应该返回：

```python
[]
```

而不是：

```python
[""]
```

因为题目要求的是“电话号码能表示的字母组合”，
没有数字，自然也就没有组合。

所以一开始先特判：

```python
if n == 0:
    return []
```

这一步是必要的。

## 复杂度分析

设输入字符串长度为 `n`。

### 时间复杂度

每一位数字最多对应 4 个字母（数字 `7` 和 `9`）。

因此最坏情况下，递归树的叶子节点数量是：

```python
4^n
```

每次生成答案时，还要把路径拼接成长度为 `n` 的字符串，
所以总时间复杂度为：

```python
O(4^n × n)
```

### 空间复杂度

递归深度最大为 `n`，当前路径 `vals` 的长度也最多为 `n`，
所以额外空间复杂度为：

```python
O(n)
```

如果把答案也算上，那输出本身自然会更大，这属于题目天生体量，躲不掉。

## 这题的关键点

### 1. 先构造好数字到字母的映射

这是整题入口。

### 2. 每层递归处理一位数字

不是处理一个字符，而是处理“这一位有多少种字符可选”。

### 3. 回溯时要恢复现场

```python
vals.pop()
```

这一步漏了，组合就会串线。

### 4. 空字符串要特判

输入为空时，直接返回 `[]`。

## 小结

这道题是很典型的“映射表 + 回溯”模板题。

整体思路不复杂：

- 用映射表找到每个数字可选的字母
- 按顺序一位一位递归处理
- 当前位枚举所有可能字符
- 处理完全部数字后，收集答案

如果只记一句话，那就是：

> **电话号码的字母组合，本质上就是在每一位数字提供的字母集合里，做一次多叉回溯搜索。**

这题写顺了，回溯这套骨架就又熟一层。
后面不管是括号生成、分割字符串还是组合类题目，都会越来越有手感。🦐
