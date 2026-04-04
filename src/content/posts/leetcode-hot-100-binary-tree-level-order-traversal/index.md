---
title: Leetcode Hot 100 二叉树层序遍历
published: 2026-04-04
description: "Leetcode Hot 100 二叉树板块经典题：二叉树层序遍历。本文用队列与 BFS 拆解如何一层一层地从左到右遍历整棵二叉树。"
image: "https://img.102465.xyz/file/1775295331910_binary-tree-level-order-traversal-cover.jpg"
tags: ["Leetcode", "Hot 100", "二叉树", "BFS", "队列", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 继续在二叉树这片林子里穿梭，这一题轮到 BFS 的门面担当：**二叉树层序遍历**。

这题可以说是二叉树广度优先搜索的标准模板题，
看起来是在“遍历树”，
实际上是在考你会不会用队列把节点**一层一层地端上来**。

一句话概括它的气质：

> **当前层处理完，再去处理下一层。**

这就很 BFS，很排队，也很讲秩序。

## 题目链接

[LeetCode 102. 二叉树层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给你二叉树的根节点 `root`，返回其节点值的 **层序遍历**。

也就是说，要按照：

- 从上到下
- 每层从左到右

的顺序，返回所有节点值。

最终结果是一个二维数组。

![二叉树层序遍历题目截图](https://img.102465.xyz/file/1775295331910_binary-tree-level-order-traversal-cover.jpg)

## 解题思路：队列 + BFS

这题最适合用 **队列**。

因为队列是：

> **先进先出**

而层序遍历的访问顺序刚好也是：

- 先处理当前层
- 再处理下一层

这两者简直像是提前对过剧本。

所以我们的做法是：

1. 先把根节点放进队列
2. 每次取出当前层所有节点
3. 记录这一层的值
4. 再把这些节点的左右孩子加入队列
5. 循环直到队列为空

这样就能一层层扫完整棵树。

## 代码实现

```python
from collections import deque

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        ans = []
        if root is None:
            return []

        myque = deque([root])

        while myque:
            vals = []
            for _ in range(len(myque)):
                cur_node = myque.popleft()
                vals.append(cur_node.val)
                if cur_node.left:
                    myque.append(cur_node.left)
                if cur_node.right:
                    myque.append(cur_node.right)
            ans.append(vals)

        return ans
```

## 代码解析

### 1. 空树直接返回空数组

```python
if root is None:
    return []
```

如果根节点都没有，那就没什么可遍历的，
直接返回空数组就行。

这一步别漏，属于 BFS 开门前先看看屋里有没有树。

### 2. 用 `deque` 作为队列

```python
myque = deque([root])
```

我们先把根节点塞进队列，
表示第一层已经准备就绪。

这里用 `deque` 而不是普通列表，
是因为它在队头弹出元素时效率更高：

```python
popleft()
```

这个动作是 BFS 的常驻嘉宾。

### 3. `while myque` 控制按层推进

```python
while myque:
```

只要队列里还有节点，
就说明还有层没有处理完。

每次进入 `while`，
我们都准备清点当前这一层。

### 4. 为什么要写 `for _ in range(len(myque))`

```python
for _ in range(len(myque)):
```

这是整题最关键的一步。

它的含义是：

> **先记住当前层一共有多少个节点，这一轮只处理这么多个。**

为什么必须这样？

因为我们在遍历当前层节点时，
会不断把下一层节点加入队列。

如果不先固定长度，
那下一层节点也会被你在同一轮里一起处理掉，
层级边界就当场塌房。

所以这里的套路是：

- `len(myque)` 是当前层节点数
- 本轮 `for` 只处理当前层
- 新加入队列的孩子节点，留到下一轮再处理

这样每一层才能分得清清楚楚。

### 5. 取出节点并记录当前层值

```python
cur_node = myque.popleft()
vals.append(cur_node.val)
```

先从队头弹出当前节点，
再把它的值记录到 `vals` 里。

这里的 `vals` 就是：

> **当前这一层的所有节点值**

等本层遍历结束后，再统一追加到答案里。

### 6. 把下一层节点加入队列

```python
if cur_node.left:
    myque.append(cur_node.left)
if cur_node.right:
    myque.append(cur_node.right)
```

当前节点处理完之后，
把它的左右孩子按顺序加入队列。

注意顺序是：

- 先左
- 后右

所以最终每一层的输出也是从左到右，
正好符合题意。

### 7. 一层结束后，把这一层加入答案

```python
ans.append(vals)
```

每完成一轮 `for`，
说明当前层已经全部处理完了。

这时把这一层的结果加入 `ans` 即可。

最后得到的就是二维数组。

## 示例理解

比如这棵树：

```text
    3
   / \
  9  20
    /  \
   15   7
```

### 初始状态

队列里只有根节点：

```python
[3]
```

### 第一轮

当前层节点数是 `1`，
所以只处理一个节点：

- 弹出 `3`
- 记录 `3`
- 把 `9` 和 `20` 加入队列

这一层结果：

```python
[3]
```

队列变成：

```python
[9, 20]
```

### 第二轮

当前层节点数是 `2`，
所以这一轮处理：

- `9`
- `20`

记录结果：

```python
[9, 20]
```

同时把 `20` 的左右孩子 `15` 和 `7` 加入队列。

队列变成：

```python
[15, 7]
```

### 第三轮

当前层节点数还是 `2`，
处理完 `15` 和 `7` 后，
队列为空。

这一层结果：

```python
[15, 7]
```

最终答案为：

```python
[[3], [9, 20], [15, 7]]
```

## 复杂度分析

### 时间复杂度

每个节点只会进队一次、出队一次，
所以时间复杂度为：

```python
O(n)
```

其中 `n` 是二叉树节点总数。

### 空间复杂度

队列在最坏情况下可能会存储一整层的所有节点，
所以空间复杂度为：

```python
O(n)
```

## 易错点总结

### 1. 误以为这是“两个数组来回倒”

你这份代码其实不是两个数组轮流搬运，
而是：

> **一个双端队列 + 按层固定长度的 BFS 写法。**

这是更标准、更常用的写法，
题解里直接这么讲就行，不用硬说成“两数组倒腾”。

### 2. 没有固定当前层长度

如果你直接一路 `popleft()`，
那你只能完成普通 BFS，
却很难准确区分每一层的边界。

所以：

```python
for _ in range(len(myque)):
```

这句是层序遍历的分层关键。

### 3. 把答案写成一维数组

题目要的是：

```python
[[3], [9, 20], [15, 7]]
```

不是：

```python
[3, 9, 20, 15, 7]
```

所以每一层都要单独准备一个 `vals`。

### 4. 忘记导入 `deque`

别光顾着 BFS 起飞，
结果起飞前忘了装引擎：

```python
from collections import deque
```

这句要记得写。

## 小结

这题的核心其实就一句：

> **用队列做 BFS，并用当前层节点数切分每一层。**

整套流程非常模板化：

- 根节点入队
- 每次固定当前层大小
- 弹出当前层节点并记录值
- 把下一层节点加入队列
- 一层一层推进直到结束

这是二叉树 BFS 的基本功，后面很多题都要从它这里长枝发芽。
像什么锯齿层序遍历、右视图、每层最大值，骨架都差不多。
这题打牢了，后面就是换皮不换骨。🦐
