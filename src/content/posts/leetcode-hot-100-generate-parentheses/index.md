---
title: Leetcode Hot 100 括号生成
published: 2026-04-10
description: "Leetcode Hot 100 经典回溯剪枝题：括号生成。本文用左右括号数量约束讲清楚如何在构造过程中直接剪掉非法前缀。"
image: "https://img.102465.xyz/file/1775792593903_generate-parentheses-cover.jpg"
tags: ["Leetcode", "Hot 100", "回溯", "剪枝", "字符串", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 继续推进，这题轮到回溯家族里的经典节目：**括号生成**。

这题的关键，不是把所有括号串都列出来再挨个验尸，
而是：

> **在生成的过程中，就别让非法前缀活着走到下一层。**

也就是说，这题不是纯暴力，
而是带着规则意识的回溯剪枝。

一句话先定调：

> **边生成，边约束，边剪枝。**

这就是它最有味道的地方。

## 题目链接

[LeetCode 22. 括号生成](https://leetcode.cn/problems/generate-parentheses/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

数字 `n` 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 **有效的** 括号组合。

![括号生成题目截图](https://img.102465.xyz/file/1775792593903_generate-parentheses-cover.jpg)

## 解题思路：回溯 + 合法性约束

如果只看表面，这题像是在长度为 `2n` 的字符串里，每一位都填：

- `(`
- `)`

但如果真这么干，就会产生大量垃圾串。
比如：

```python
)))(((
())())
```

这些字符串要么一开头就崩了，
要么中途就已经非法，根本没必要让它们活着走完整个递归树。

所以更聪明的思路是：

> **在回溯过程中，始终保证当前前缀合法。**

这样搜出来的每一条路径，都是有希望成为答案的正经选手。

## 合法括号串的两个核心限制

假设当前已经放了：

- `left` 个左括号 `(`
- `right` 个右括号 `)`

那么递归过程中必须一直满足两个条件。

### 1. 左括号数量不能超过 `n`

因为总共就只有 `n` 个左括号配额。

也就是说，只有当：

```python
left < n
```

时，才能继续放左括号。

### 2. 右括号数量不能超过左括号数量

这是这题真正的灵魂约束。

如果某个时刻出现：

```python
right > left
```

说明右括号已经提前把左括号“关穿了”，
当前前缀立刻非法。

因此，只有当：

```python
right < left
```

时，才允许继续放右括号。

可以粗暴记成一句：

> **左括号别超额，右括号别抢跑。**

## 代码实现

```python
class Solution(object):
    def generateParenthesis(self, n):
        """
        :type n: int
        :rtype: List[str]
        """
        ans = []
        vals = []

        def dfs(left, right):
            if len(vals) == 2 * n:
                ans.append(''.join(vals))
                return

            if left < n:
                vals.append('(')
                dfs(left + 1, right)
                vals.pop()

            if right < left:
                vals.append(')')
                dfs(left, right + 1)
                vals.pop()

        dfs(0, 0)
        return ans
```

## 为什么这样写是对的

定义：

```python
dfs(left, right)
```

表示当前路径中已经使用了：

- `left` 个左括号
- `right` 个右括号

并且当前构造出的字符串保存在 `vals` 中。

### 什么时候得到一个完整答案

当：

```python
len(vals) == 2 * n
```

说明已经放满 `n` 对括号。

这时当前路径就是一个合法括号串，
直接加入答案：

```python
ans.append(''.join(vals))
```

### 当前层能做什么选择

#### 选择一：放左括号

前提是左括号还没用完：

