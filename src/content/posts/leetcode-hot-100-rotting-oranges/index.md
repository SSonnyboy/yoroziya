---
title: Leetcode Hot 100 腐烂的橘子
published: 2026-04-08
description: "Leetcode Hot 100 图论 / BFS 经典题：腐烂的橘子。把所有初始腐烂橘子同时作为起点，按层做多源广度优先搜索，每一层就代表过去 1 分钟。"
image: "https://img.102465.xyz/file/1775629830161_cover.jpg"
tags: ["Leetcode", "Hot 100", "BFS", "广度优先搜索", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 继续刷到这道很有味道的题：**腐烂的橘子**。

这题名字一出来，画面就已经有了：

- 新鲜橘子还在硬撑
- 腐烂橘子开始扩散
- 每过一分钟，味儿更重一点

题目问的是：**要多久，才能让所有能烂的橘子都烂掉？**

它的本质其实很清楚：

> **不是找一条路径，而是让多个起点同时向外一圈一圈扩散。**

这就是经典的 **多源 BFS（多源广度优先搜索）**。

## 题目链接

[LeetCode 994. 腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给定一个 `m x n` 的网格 `grid`，其中：

- `0` 代表空单元格
- `1` 代表新鲜橘子
- `2` 代表腐烂橘子

每分钟，腐烂橘子会让上下左右相邻的新鲜橘子也变腐烂。

请返回直到网格中没有新鲜橘子为止所必须经过的最少分钟数；如果不可能完成，返回 `-1`。

![腐烂的橘子题目截图](https://img.102465.xyz/file/1775629830161_cover.jpg)

## 思路：按层扩散的多源 BFS

这题最关键的一点是：

**所有初始腐烂橘子会同时扩散。**

所以不能只从某一个腐烂橘子开始搜，
而是应该把所有一开始就是 `2` 的位置全部放进队列里，统一做 BFS。

这样处理时：

- 队列中的当前一层，表示这一分钟正在扩散的腐烂橘子
- 这一层扩散结束后，时间加 `1`
- 下一层就是下一分钟新烂掉的橘子

换句话说：

> **BFS 每处理一层，就代表过去了 1 分钟。**

## 先统计两类信息

在正式 BFS 之前，先遍历一遍网格，拿到两样关键数据：

### 1. 新鲜橘子的数量 `fresh`

如果最后还有新鲜橘子没被感染，就说明答案一定是 `-1`。

### 2. 所有初始腐烂橘子的位置 `q`

这些点就是 BFS 的多个起点。

代码里这一段就是在做初始化：

```python
q = []
fresh, ans = 0, 0
n, m = len(grid), len(grid[0])
for r, row in enumerate(grid):
    for c, cell in enumerate(row):
        if cell == 1:
            fresh += 1
        elif cell == 2:
            q.append((r, c))
```

## 为什么循环条件写成 `while q and fresh`

这个条件很精髓：

```python
while q and fresh:
```

它同时表达了两件事：

### 情况一：`fresh == 0`

说明已经没有新鲜橘子了，任务完成，直接结束。

### 情况二：`q == []` 但 `fresh > 0`

说明虽然还有新鲜橘子，但已经没有腐烂橘子能继续扩散了。

这就意味着有些新鲜橘子永远碰不到腐烂源，最后必须返回 `-1`。

这条件写得很省话，逻辑却很完整，属于橘子不多，信息量挺浓。🍊

## 代码实现

先贴出这次题解使用的解法：

```python
class Solution(object):
    def orangesRotting(self, grid):
        """
        :type grid: List[List[int]]
        :rtype: int
        """
        # 广度优先搜索：
        # 1. 先获取必要信息：新鲜橘子数量，以及腐烂橘子位置
        q = []
        fresh, ans = 0, 0
        n, m = len(grid), len(grid[0])
        for r, row in enumerate(grid):
            for c, cell in enumerate(row):
                if cell == 1:
                    fresh += 1
                elif cell == 2:
                    q.append((r, c))

        # 2. BFS 按层扩散
        while q and fresh:
            tmp = q
            q = []
            for x, y in tmp:
                for a, b in (x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1):
                    if 0 <= a < n and 0 <= b < m and grid[a][b] == 1:
                        fresh -= 1
                        grid[a][b] = 2
                        q.append((a, b))
            ans += 1

        return -1 if fresh else ans
```

## 代码解析

### 1. 把所有腐烂橘子一起入队

```python
elif cell == 2:
    q.append((r, c))
```

这里不是普通单源 BFS，
而是把所有腐烂橘子一起塞进队列。

因为它们会在同一时刻同时开始扩散。

### 2. 一层一层处理，代表一分钟一分钟流逝

```python
tmp = q
q = []
```

这两句的作用是把“当前这一分钟会扩散的腐烂橘子”单独拿出来。

处理 `tmp` 时，所有被感染的新鲜橘子都会加入新的 `q`，
它们不会在当前分钟继续扩散，而是要等到下一轮。

这正好符合题意里的“每分钟同时发生”。

### 3. 遇到新鲜橘子就感染

```python
if 0 <= a < n and 0 <= b < m and grid[a][b] == 1:
    fresh -= 1
    grid[a][b] = 2
    q.append((a, b))
```

这段逻辑做了三件事：

- `fresh -= 1`：新鲜橘子数量减一
- `grid[a][b] = 2`：把它标记为腐烂，避免重复感染
- `q.append((a, b))`：把它放进下一层队列，表示它会在下一分钟继续传播

### 4. 每处理完一层，时间加一

```python
ans += 1
```

因为这一层表示当前这一分钟发生的全部扩散，
所以层处理完了，分钟数也该加一。

## 示例理解

以经典样例为例：

```python
grid = [[2,1,1],[1,1,0],[0,1,1]]
```

### 第 0 分钟

初始腐烂橘子位置：

```python
(0, 0)
```

### 第 1 分钟

`(0, 0)` 会感染它上下左右相邻的新鲜橘子，于是：

- `(0, 1)` 变腐烂
- `(1, 0)` 变腐烂

### 第 2 分钟

上一分钟新烂掉的橘子继续向外扩散：

- `(0, 2)` 变腐烂
- `(1, 1)` 变腐烂

### 第 3 分钟

继续扩散：

- `(2, 1)` 变腐烂

### 第 4 分钟

继续扩散：

- `(2, 2)` 变腐烂

此时已经没有新鲜橘子，答案就是：

```python
4
```

## 边界情况

这题有两个很常见的边界情况，博客里最好顺手点出来。

### 情况一：本来就没有新鲜橘子

例如：

```python
[[0, 2]]
```

这时 `fresh == 0`，循环根本不会进入，直接返回 `0`。

这是对的，因为根本不需要等待。

### 情况二：有新鲜橘子，但没有腐烂橘子

例如：

```python
[[1]]
```

这时队列为空，BFS 无法开始，最后 `fresh > 0`，返回 `-1`。

这也是对的，因为没有腐烂源，就没人开第一枪。

## 为什么这道题适合 BFS

因为题目里有两个特别显眼的信号：

- **最少分钟数**
- **每分钟向四周同时扩散**

只要看到这种“按轮扩散、按层推进”的描述，
一般就该往 BFS 身上想。

而这里又不是一个起点，而是多个起点同时出发，
所以是更具体的：

> **多源 BFS。**

## 时间复杂度分析

网格中的每个格子最多被访问、入队一次，所以：

### 时间复杂度

```python
O(m * n)
```

### 空间复杂度

最坏情况下队列中可能存下接近整个网格的元素，因此：

```python
O(m * n)
```

## 一个更“正统”的写法：`deque`

上面的代码用列表分层处理，已经完全没问题。

如果想让队列味儿更浓一点，也可以用 `collections.deque` 来写：

```python
from collections import deque

class Solution(object):
    def orangesRotting(self, grid):
        """
        :type grid: List[List[int]]
        :rtype: int
        """
        rows, cols = len(grid), len(grid[0])
        q = deque()
        fresh = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    fresh += 1
                elif grid[r][c] == 2:
                    q.append((r, c))

        minutes = 0
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        while q and fresh > 0:
            for _ in range(len(q)):
                x, y = q.popleft()
                for dx, dy in directions:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == 1:
                        grid[nx][ny] = 2
                        fresh -= 1
                        q.append((nx, ny))
            minutes += 1

        return -1 if fresh > 0 else minutes
```

这个版本和前面本质完全一样：

- 都是多源 BFS
- 都是按层统计分钟数
- 都是每个新鲜橘子只感染一次

只是 `deque` 在语义上更像标准队列，看起来更板正一些。

## 小结

这题的核心并不复杂，关键是把它看成：

> **所有腐烂橘子同时出发，按层向四周扩散。**

一旦把这个模型想明白，解法就自然出来了：

- 先统计新鲜橘子数量
- 把所有腐烂橘子一起入队
- 按层做 BFS
- 每层代表一分钟
- 最后看是否还有新鲜橘子残留

如果只记一句话，那就是：

> **这题不是“谁先烂”，而是“大家一起烂”，所以该用多源 BFS。**

Hot 100 又拿下一题。
这波不是橘子太脆，是 BFS 太会。🦐
