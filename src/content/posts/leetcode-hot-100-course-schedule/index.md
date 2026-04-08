---
title: Leetcode Hot 100 课程表
published: 2026-04-08
description: "Leetcode Hot 100 图论经典题：课程表。把课程依赖关系建成有向图，用入度统计配合 BFS 实现拓扑排序，判断是否能学完全部课程。"
image: "https://img.102465.xyz/file/1775639136372_cover.jpg"
tags: ["Leetcode", "Hot 100", "图论", "拓扑排序", "BFS", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 刷到这题，终于轮到图论里那位老熟人登场：**课程表**。

题目表面在问“课程能不能学完”，
本质上问的是另一句更图论的话：

> **这张有向图里，有没有环？**

如果有环，说明几门课互相卡脖子：

- 你要先学我
- 我又要先学你
- 大家谁都别毕业

如果没有环，就能找到一种学习顺序，把所有课程安排明白。

这题的标准做法就是：

> **拓扑排序 + 入度统计 + BFS。**

## 题目链接

[LeetCode 207. 课程表](https://leetcode.cn/problems/course-schedule/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

你这个学期必须选修 `numCourses` 门课程，记为 `0` 到 `numCourses - 1`。

给你一个数组 `prerequisites`，其中 `prerequisites[i] = [a, b]` 表示：

- 如果想学课程 `a`
- 必须先学课程 `b`

请你判断：是否可能完成所有课程的学习？

![课程表题目截图](https://img.102465.xyz/file/1775639136372_cover.jpg)

## 先把题目翻译成图

这一题如果直接盯着“课程”“先修课”这些词，很容易绕。

其实翻译成图以后，结构就非常干净。

如果：

```python
[a, b]
```

表示学 `a` 之前必须先学 `b`，
那么就连一条有向边：

```python
b -> a
```

也就是说：

- `b` 是前置课程
- `a` 依赖 `b`

于是整道题就变成：

> **给定一张有向图，判断它能不能完成拓扑排序。**

- 如果能完成，说明图中没有环，返回 `True`
- 如果不能完成，说明图中存在环，返回 `False`

## 这题为什么是拓扑排序

拓扑排序适用于：

- 有依赖顺序
- 要找一个合法处理顺序
- 或者判断是否存在环

而课程依赖关系，正好完美符合这个模型。

比如：

- 学 `1` 前要先学 `0`
- 学 `2` 前要先学 `1`

那顺序就只能是：

```python
0 -> 1 -> 2
```

这种“先做谁，再做谁”的题，十有八九都和拓扑排序有点血缘关系。

## 用什么数据结构来做

这份解法用了两个核心结构：

### 1. 邻接表 `adj`

```python
adj = [[] for _ in range(numCourses)]
```

这里存的是：

- 某门课学完之后
- 它能解锁哪些后续课程

注意，这里是**邻接表**，不是邻接矩阵。

因为：

```python
adj[pre].append(course)
```

表示的是给每个节点挂一个列表，记录它指向哪些节点。

如果是邻接矩阵，通常会写成：

```python
adj = [[0] * numCourses for _ in range(numCourses)]
```

所以题解里别把术语写串了，不然容易被图论警察现场拦下。🦐

### 2. 入度数组 `indegree`

```python
indegree = [0] * numCourses
```

`indegree[i]` 表示课程 `i` 当前还有多少门前置课没完成。

如果某门课入度为 `0`，说明：

- 它原本就没有前置要求
- 或者它的前置课程已经都被处理掉了

那它现在就可以学。

## 建图过程

根据题意：

```python
[a, b]
```

意味着：

```python
b -> a
```

所以建图时应该写：

```python
for course, pre in prerequisites:
    adj[pre].append(course)
    indegree[course] += 1
```

这里做了两件事：

- `adj[pre].append(course)`：记录 `pre` 学完后能解锁 `course`
- `indegree[course] += 1`：说明 `course` 多了一个前置条件

边的方向千万别反。

这题最容易翻车的地方之一，就是一不小心写成 `course -> pre`，那整个图就会长歪。

## BFS 是怎么跑起来的

### 第一步：把所有入度为 0 的课程入队

```python
q = deque([i for i in range(numCourses) if indegree[i] == 0])
```

这些课程就是“现在立刻就能学”的课。

它们没有任何前置依赖，属于开局就能开课的幸运儿。

### 第二步：不断弹出队首课程

```python
cur = q.popleft()
learned_course += 1
```

弹出一门课，就表示这门课已经顺利学完了。

顺手把已学课程数 `learned_course` 加一。

### 第三步：削减它对后续课程的限制

```python
for neighbor in adj[cur]:
    indegree[neighbor] -= 1
    if indegree[neighbor] == 0:
        q.append(neighbor)
```

意思是：

- 当前课程 `cur` 学完了
- 那么所有依赖它的课程，都少了一个前置条件
- 如果某门课的入度减到了 `0`
- 它就解锁成功，可以入队等待学习

这就是整个拓扑排序 BFS 的推进方式。

## 代码实现

```python
from collections import deque

class Solution(object):
    def canFinish(self, numCourses, prerequisites):
        """
        :type numCourses: int
        :type prerequisites: List[List[int]]
        :rtype: bool
        """
        # BFS + 入度统计（拓扑排序）
        adj = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses

        for course, pre in prerequisites:
            adj[pre].append(course)
            indegree[course] += 1

        q = deque([i for i in range(numCourses) if indegree[i] == 0])
        learned_course = 0

        while q:
            cur = q.popleft()
            learned_course += 1
            for neighbor in adj[cur]:
                indegree[neighbor] -= 1
                if indegree[neighbor] == 0:
                    q.append(neighbor)

        return learned_course == numCourses
```

## 为什么最后判断 `learned_course == numCourses`

这是整题的验收口。

如果最后：

```python
learned_course == numCourses
```

说明所有课程都能被拓扑排序处理到，
也就说明图中没有环。

反过来，如果：

```python
learned_course < numCourses
```

说明还有一些课程永远进不了队列。

为什么进不了？

因为它们的入度始终降不到 `0`。

那就意味着这些课程之间互相依赖，形成了环。

所以：

- 能处理完所有课程：`True`
- 处理不完：`False`

## 示例理解

### 示例一

```python
numCourses = 2
prerequisites = [[1, 0]]
```

表示：

- 学 `1` 之前要先学 `0`
- 图就是：`0 -> 1`

初始入度：

- `0` 的入度是 `0`
- `1` 的入度是 `1`

于是：

1. 先把 `0` 入队
2. 学完 `0`
3. `1` 的入度减为 `0`
4. 再学 `1`

最后两门课都能学完，返回：

```python
True
```

### 示例二

```python
numCourses = 2
prerequisites = [[1, 0], [0, 1]]
```

图变成：

- `0 -> 1`
- `1 -> 0`

这时候：

- `0` 入度不是 `0`
- `1` 入度也不是 `0`

队列一开始就是空的。

也就是说，谁都上不了第一节课。

最后学完课程数是 `0`，显然不等于 `2`，返回：

```python
False
```

这正是有环的表现。

## 复杂度分析

设：

- 课程数为 `V`
- 先修关系数为 `E`

### 时间复杂度

建图需要遍历所有先修关系：

```python
O(E)
```

拓扑排序过程中，每个点和每条边最多处理一次：

```python
O(V + E)
```

总时间复杂度为：

```python
O(V + E)
```

### 空间复杂度

主要来自：

- 邻接表
- 入度数组
- 队列

所以空间复杂度为：

```python
O(V + E)
```

## 易错点

### 1. 邻接表不是邻接矩阵

你这份代码用的是：

```python
adj = [[] for _ in range(numCourses)]
```

这是邻接表。

别在题解里写成“邻接矩阵”，不然术语会跑偏。

### 2. 边的方向别建反

题目里 `[a, b]` 表示：

- 学 `a` 前先学 `b`

所以边应该是：

```python
b -> a
```

也就是：

```python
adj[pre].append(course)
```

### 3. 这题表面是 BFS，本质是拓扑排序

虽然确实用了队列，
但它不是普通的“从起点到终点搜一遍”。

这里真正做的是：

> **基于入度为 0 的节点，按拓扑顺序一层层处理整张图。**

所以在题解里，最好叫它：

- BFS 实现的拓扑排序
- 或 入度法拓扑排序

这样会更准确。

## 小结

这题本质并不是排课程表，
而是在问：

> **课程依赖关系这张图，有没有环。**

只要把题目抽象成有向图，思路就会很顺：

- 用邻接表建图
- 用入度数组统计每门课还差几个前置条件
- 把所有入度为 `0` 的课程入队
- 用 BFS 做拓扑排序
- 最后判断能否处理完全部课程

如果只记一句话，那就是：

> **能拓扑排序到底，就能毕业；排到一半卡住了，多半是课程们自己内斗成环。**

Hot 100 又下一城。
这题表面是上课，骨子里是查环；看懂这一层，课程表就不再像教务系统那样阴间了。🦐
