---
title: Leetcode Hot 100 路径总和 III
published: 2026-04-06
description: "Leetcode Hot 100 二叉树与前缀和结合题：路径总和 III。本文用 DFS + 前缀和 + 哈希表讲清楚如何在线统计树中路径和等于 targetSum 的条数。"
image: "https://img.102465.xyz/file/1775478099357_path-sum-iii-cover.jpg"
tags: ["Leetcode", "Hot 100", "二叉树", "前缀和", "哈希表", "回溯", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 继续推进，这一题轮到二叉树里的“前缀和分支机构”：**路径总和 III**。

这题乍一看像树上暴力枚举：

- 以每个节点为起点
- 往下搜所有路径
- 统计路径和等于 `targetSum` 的条数

能做，但不够优雅。

真正顺手的写法，是把数组题里那套经典思路搬到树上来：

> **前缀和 + 哈希表 + DFS 回溯恢复现场**

一句话总结它的灵魂：

> **在从根走到当前节点的路径上，查一查有没有某个历史前缀和，刚好能和当前前缀和凑出 `targetSum`。**

## 题目链接

[LeetCode 437. 路径总和 III](https://leetcode.cn/problems/path-sum-iii/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给定一个二叉树的根节点 `root` 和一个整数 `targetSum`，求该二叉树里 **路径和等于 `targetSum` 的路径数量**。

这里的路径必须满足：

- 方向只能从父节点到子节点
- 不一定从根节点开始
- 也不一定在叶子节点结束

![路径总和 III 题目截图](https://img.102465.xyz/file/1775478099357_path-sum-iii-cover.jpg)

## 解题思路：DFS + 前缀和 + 哈希表

这题如果直接暴力做，思路通常是：

- 枚举每个节点作为起点
- 再从这个节点往下 DFS
- 累加路径和并统计答案

这样最坏情况下复杂度可能到 `O(n^2)`。

但如果你刷过 **和为 K 的子数组**，这题会有一种熟悉的味道。

因为它本质上也是：

> **找一段路径，它的和是否等于目标值。**

只不过数组里的“连续子数组”，换成了树里的“从祖先到后代的一段连续路径”。

### 先定义当前前缀和

我们用 `cur_sum` 表示：

> 从根节点一路走到当前节点，这条路径上的节点值总和。

假设之前某个祖先位置的前缀和是 `pre_sum`，
那么从那个祖先的下一个节点到当前节点，这一段路径和就是：

```python
cur_sum - pre_sum
```

如果题目要求这段路径和等于 `targetSum`，那么就有：

```python
cur_sum - pre_sum = targetSum
```

移项后得到：

```python
pre_sum = cur_sum - targetSum
```

这句话就是整题的钥匙：

> **当我们遍历到当前节点时，只要历史路径里出现过前缀和 `cur_sum - targetSum`，就说明存在若干条以当前节点为结尾的合法路径。**

## 为什么要用哈希表

问题到这里就变成了：

> 当前前缀和是 `cur_sum`，那么当前递归路径上，有多少个前缀和等于 `cur_sum - targetSum`？

这就非常适合用哈希表。

我们用 `record` 记录：

- 某个前缀和出现了多少次

在 DFS 过程中，每到一个节点：

1. 更新当前前缀和 `cur_sum += node.val`
2. 查询 `record[cur_sum - targetSum]`
3. 把这个次数加进答案
4. 再把当前前缀和加入哈希表
5. 递归左右子树
6. 返回父节点前，删除当前节点造成的影响，也就是**恢复现场**

## 为什么一定要“恢复现场”

这是这题最容易掉坑、也最有味道的一点。

因为 `record` 里存的不是“整棵树所有前缀和”，
而是：

> **当前这条递归路径上的前缀和统计。**

当我们从左子树返回父节点后，
左子树那条路径上的前缀和不应该再影响右子树。

不然就会出现这种离谱场面：

- 左边分支上的前缀和
- 去匹配右边分支上的当前路径

这俩压根不是同一条向下路径，硬凑就是乱点鸳鸯谱。

所以回溯时必须把当前层加入的前缀和计数减掉，保证哈希表始终只描述“从根到当前节点这一条路”。

一句话记忆：

> **进递归加进去，出递归减回来。**

## 代码实现

```python
class Solution(object):
    def pathSum(self, root, targetSum):
        """
        :type root: Optional[TreeNode]
        :type targetSum: int
        :rtype: int
        """
        self.record = {0: 1}
        self.ans = 0

        def dfs(node, cur_sum):
            if not node:
                return

            cur_sum += node.val
            self.ans += self.record.get(cur_sum - targetSum, 0)

            self.record[cur_sum] = self.record.get(cur_sum, 0) + 1

            dfs(node.left, cur_sum)
            dfs(node.right, cur_sum)

            # 恢复现场
            self.record[cur_sum] -= 1
            if self.record[cur_sum] == 0:
                del self.record[cur_sum]

        dfs(root, 0)
        return self.ans
```

## 代码解析

### 1. 为什么一开始要写 `record = {0: 1}`

```python
self.record = {0: 1}
```

它表示：

> 在还没走到任何节点之前，前缀和 `0` 已经出现过 1 次。

这一步非常关键。

因为如果某条合法路径刚好是从根开始，
那么当我们走到某个节点时：

```python
cur_sum == targetSum
```

此时需要靠 `record[0] = 1` 才能把这条路径统计进去。

### 2. 查询答案为什么是 `cur_sum - targetSum`

```python
self.ans += self.record.get(cur_sum - targetSum, 0)
```

因为我们要找的是：

```python
cur_sum - pre_sum = targetSum
```

也就是：

```python
pre_sum = cur_sum - targetSum
```

所以当前节点能贡献多少条合法路径，
取决于之前有多少个前缀和刚好等于 `cur_sum - targetSum`。

### 3. 为什么先查再记

正确顺序是：

```python
self.ans += self.record.get(cur_sum - targetSum, 0)
self.record[cur_sum] = self.record.get(cur_sum, 0) + 1
```

必须先查，再把当前前缀和放进哈希表。

不然就可能把“当前节点自己”拿去和自己配对，
造成统计错误。

### 4. 回溯时为什么要减掉

```python
self.record[cur_sum] -= 1
if self.record[cur_sum] == 0:
    del self.record[cur_sum]
```

DFS 左右子树走完后，当前节点对应的路径环境已经结束。

这时必须把这个前缀和从当前路径记录里移除，
不让它污染兄弟分支。

这一步，就是你刷题笔记里那句精华：

> **记得恢复现场。**

## 示例理解

假设当前递归走到某个节点时：

```python
cur_sum = 18
targetSum = 8
```

那么我们就去查：

```python
record[10]
```

如果 `record[10] = 2`，
就说明在当前这条从根到节点的路径上，
曾经有两个位置的前缀和都是 `10`。

于是从这两个位置之后到当前节点，
各自都能形成一条路径和为 `8` 的合法路径。

所以这一步应该把答案加 `2`。

## 复杂度分析

### 时间复杂度

每个节点只访问一次，
每次哈希表查询和插入平均都是 `O(1)`。

所以总时间复杂度为：

```python
O(n)
```

其中 `n` 是二叉树节点总数。

### 空间复杂度

哈希表里存的是当前路径上的前缀和，
递归栈也和树高有关。

最坏情况下，空间复杂度为：

```python
O(n)
```

## 易错点总结

### 1. 忘记初始化 `record[0] = 1`

这一漏，从根开始的合法路径就可能统计不到。

### 2. 把“整棵树前缀和”理解成“当前路径前缀和”

这题哈希表记录的范围很重要：

- 不是整棵树所有节点
- 而是当前 DFS 路径

路径一换分支，现场就得清。

### 3. 忘记回溯恢复现场

如果不减掉当前层的前缀和，
左右子树就会串台，答案当场跑偏。

### 4. 误以为这题只能暴力枚举起点

暴力当然能做，
但这题真正想考的就是：

> **能不能把数组里的前缀和思维迁移到树上。**

会了这题，说明你前缀和这把刀，已经开始学会上树砍人了。

## 小结

这题的核心其实就一句：

> **树上的一段向下路径和 = 两个根到节点前缀和之差。**

所以我们可以在 DFS 的同时：

- 维护当前前缀和
- 用哈希表记录路径上历史前缀和出现次数
- 查询 `cur_sum - targetSum` 出现过多少次
- 回溯时恢复现场

整套流程下来，
就把原本容易写成 `O(n^2)` 的题压到了 `O(n)`。

这题属于那种看着是二叉树，实则偷偷考你前缀和迁移能力的选手。
数组里它会算账，树上它也会记账。
只要记住一句——**hash + 前缀，记得恢复现场**，这题基本就稳了。🦐
