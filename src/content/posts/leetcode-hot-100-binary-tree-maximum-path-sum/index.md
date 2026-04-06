---
title: Leetcode Hot 100 二叉树中的最大路径和
published: 2026-04-06
description: "Leetcode Hot 100 二叉树板块高频难题：二叉树中的最大路径和。本文用递归拆解单链贡献与拐点更新，讲清楚为什么返回值不能分叉、答案却可以左右通吃。"
image: "https://img.102465.xyz/file/1775484326833_binary-tree-maximum-path-sum-cover.jpg"
tags: ["Leetcode", "Hot 100", "二叉树", "递归", "动态规划", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 继续推进，这一题轮到二叉树里的“高压线选手”：**二叉树中的最大路径和**。

这题看着像普通二叉树递归，
实际上很容易把人绕进去。

因为它的路径定义有几个关键特点：

- 路径不一定从根开始
- 路径不一定在叶子结束
- 路径上节点不能重复
- 但路径必须连续

也就是说，
它找的不是“从根往下的最大值”，
而是：

> **整棵树中任意一条合法路径的最大路径和。**

这题真正的难点，不在递归本身，
而在于你必须想明白：

> **递归返回值到底表示什么。**

## 题目链接

[LeetCode 124. 二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给你一个二叉树的根节点 `root`，返回其 **最大路径和**。

路径被定义为一条从树中任意节点出发，沿父子关系连接到任意节点的序列。
同一个节点在一条路径中至多出现一次。

路径至少包含一个节点。

![二叉树中的最大路径和题目截图](https://img.102465.xyz/file/1775484326833_binary-tree-maximum-path-sum-cover.jpg)

## 解题思路：递归 + 单链贡献

这题最核心的思想是：

> **更新全局答案时，可以把当前节点当成拐点；但递归返回给父节点时，只能返回一条单链。**

这句话是整题灵魂，必须背下来。

### 为什么返回值只能是“单链”

假设我们定义：

```python
dfs(node)
```

表示“从当前节点出发，向下延伸，所能得到的最大路径和”。

注意这里的路径，是要返回给父节点继续使用的。

那它就不能同时带上：

- 左子树一条路径
- 当前节点
- 右子树一条路径

因为如果这样返回给父节点，路径就分叉了。
而题目要求的路径必须是一条线，不能长成三叉路口。

所以 `dfs(node)` 返回的东西只能是下面三种之一：

- 只取当前节点 `node.val`
- 当前节点 + 左边单链
- 当前节点 + 右边单链

换句话说：

> **递归返回值表示的是“当前节点向下的一条最大单链贡献”。**

## 当前节点如何更新全局答案

虽然返回给父节点时不能左右都带着，
但在“当前节点本地结算”的时候，可以把当前节点当作一条路径的最高点。

这样它就可以同时连接：

- 左边一条向下链
- 当前节点
- 右边一条向下链

于是当前节点作为拐点时，能形成的路径和就是：

```python
left_val + node.val + right_val
```

这就是为什么这题要维护一个全局变量 `self.ans`。

它表示：

> **遍历到目前为止，整棵树里出现过的最大路径和。**

## 为什么负贡献要直接丢掉

如果某棵子树返回的是负数，
比如 `-5`，那把它接到当前节点上，只会拖后腿。

对于求最大路径和来说：

- 正贡献可以留
- 负贡献不如不要

所以我们在递归里会写：

```python
left_val = max(dfs(node.left), 0)
right_val = max(dfs(node.right), 0)
```

意思非常直接：

> **子树要是不给力，就让它原地待命，不许上桌。**

## 代码实现

```python
class Solution(object):
    def maxPathSum(self, root):
        """
        :type root: Optional[TreeNode]
        :rtype: int
        """
        self.ans = -float('inf')

        def dfs(node):
            if not node:
                return 0

            left_val = max(dfs(node.left), 0)
            right_val = max(dfs(node.right), 0)

            # 当前节点作为拐点
            self.ans = max(self.ans, left_val + node.val + right_val)

            # 返回给父节点的只能是一条单链
            return node.val + max(left_val, right_val)

        dfs(root)
        return self.ans
```

## 代码解析

### 1. 为什么空节点返回 0

```python
if not node:
    return 0
```

空节点没有贡献，
返回 `0` 就表示“这条路你可以不选”。

后面再配合：

```python
max(dfs(node.left), 0)
```

就能自然完成“负数贡献舍弃”的逻辑。

### 2. 先算左右子树的最大单链贡献

```python
left_val = max(dfs(node.left), 0)
right_val = max(dfs(node.right), 0)
```

这里的 `left_val`、`right_val` 表示的是：

- 左子树能给当前节点提供的最大单链收益
- 右子树能给当前节点提供的最大单链收益

如果收益是负数，直接按 `0` 处理。

### 3. 为什么更新答案时能左右都拿

```python
self.ans = max(self.ans, left_val + node.val + right_val)
```

因为此时我们是在“当前节点本地结算”，
把它看作一条路径的拐点。

左边过来一条链，
右边再出去一条链，
是合法的。

所以这一刻允许“左右通吃”。

### 4. 为什么返回给父节点时只能选一边

```python
return node.val + max(left_val, right_val)
```

因为父节点如果还要继续拼接路径，
当前节点只能提供一条向下的链。

要么带左边，
要么带右边，
不能左右都带着一起上交。

不然路径就分叉了，题目不认。

## 你的原始思路为什么也能做

你原来的写法是：

```python
self.ans = max(self.ans, left_val+node.val+right_val, left_val+node.val, right_val+node.val, node.val)
return max(left_val, right_val, 0) + node.val
```

这个逻辑本质上也是对的。

因为你在更新答案时，把可能情况都枚举了一遍：

- 只取自己
- 自己 + 左边
- 自己 + 右边
- 自己 + 左右两边

它能过，也没错。

只不过把负贡献提前裁掉之后，代码可以进一步压缩成标准写法：

```python
left_val = max(dfs(node.left), 0)
right_val = max(dfs(node.right), 0)
self.ans = max(self.ans, left_val + node.val + right_val)
return node.val + max(left_val, right_val)
```

这样更简洁，也更容易讲清楚。

## 示例理解

假设当前节点值是 `10`，
左右子树递归返回值分别是：

```python
left_val = 9
right_val = 15
```

那么：

### 当前节点作为拐点更新答案

```python
9 + 10 + 15 = 34
```

这表示一条完整路径：

- 左边单链
- 当前节点
- 右边单链

### 返回给父节点时

只能返回：

```python
10 + max(9, 15) = 25
```

因为要继续往上接，只能保留一边。

这就是“能拐弯更新答案，但不能拐弯返回父节点”的区别。

## 复杂度分析

### 时间复杂度

每个节点只访问一次，
所以时间复杂度为：

```python
O(n)
```

其中 `n` 是节点总数。

### 空间复杂度

递归栈深度取决于树高，
所以空间复杂度为：

```python
O(h)
```

其中 `h` 是树的高度。

最坏情况下树退化成链表，则为 `O(n)`。

## 易错点总结

### 1. 把返回值理解成“当前子树最大路径和”

这是最常见的误区。

`dfs(node)` 返回的不是：

> 当前整棵子树里的最大路径和

而是：

> 当前节点向下延伸的一条最大单链和

真正的“最大路径和”要靠全局变量 `self.ans` 维护。

### 2. 返回给父节点时把左右两边都加上

错误写法通常像这样：

```python
return left_val + node.val + right_val
```

这样会让路径分叉，不符合题意。

### 3. 没有处理负数贡献

如果不把负数裁掉，
就可能把一条本来不错的路径硬生生拖垮。

记住：

> **负贡献不如不要。**

### 4. 以为路径必须经过根节点

这题的最大路径完全可能出现在某棵子树内部，
根节点甚至可能只是个路人甲。

所以必须对每个节点都尝试“当一次拐点”。

## 小结

这题的核心其实就一句：

> **每个节点都尝试作为路径拐点更新答案；递归只向父节点返回最大单链贡献。**

也可以记成更顺口的一句：

> **更新答案时左右通吃，返回父节点时单边上交。**

把这层想清楚，
这题就不再是“最大路径和玄学”，
而是一道很标准的树形递归题。

它表面是在问最大路径，
实际上是在考你：

> **能不能分清“局部最优返回值”和“全局最优答案”不是一回事。**

会了这题，二叉树递归就算真的开始有点火候了。🦐
