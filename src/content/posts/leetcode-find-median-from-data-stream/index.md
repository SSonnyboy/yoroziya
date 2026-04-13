---
title: LeetCode 295 数据流的中位数
published: 2026-04-13
description: "这题的核心是双堆法：大顶堆维护较小的一半，小顶堆维护较大的一半，并始终保持大顶堆数量大于或等于小顶堆。"
image: "https://img.102465.xyz/file/1776068475746_cover.jpg"
tags: ["Leetcode", "堆", "数据流", "双堆", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

这题终于把“困难”两个字写到了该写的地方。
它不装，也不演，开门见山告诉你：

> 今天这把，得和双堆打交道。

题目要求设计一个数据结构，支持两种操作：

- `addNum(num)`：往数据流里加入一个数字
- `findMedian()`：返回当前所有数字的中位数

如果每次插入后都重新排序，那效率就太感人了。
所以这题的关键在于：

> **如何在动态插入的过程中，始终快速拿到中间位置附近的数。**

## 题目链接

[LeetCode 295. 数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

中位数是有序整数列表中的中间值。

- 如果列表长度是奇数，中位数就是中间那个数
- 如果列表长度是偶数，中位数就是中间两个数的平均值

实现 `MedianFinder` 类：

- `MedianFinder()` 初始化对象
- `addNum(int num)` 将数据流中的整数 `num` 添加到数据结构中
- `findMedian()` 返回到目前为止所有元素的中位数

![题目截图](https://img.102465.xyz/file/1776068475746_cover.jpg)

## 解法：双堆法

这题最经典的做法，就是使用两个堆：

- **大顶堆**：维护较小的一半元素
- **小顶堆**：维护较大的一半元素

这样一来：

- 左边最大的数可以快速拿到
- 右边最小的数也可以快速拿到

而中位数，恰好就只和这两个位置有关。

### 为什么左边用大顶堆

左边维护的是“较小的一半”。
但我们真正关心的是这部分里**最大的那个数**，因为它最靠近中位数。

所以左边适合用大顶堆。

不过 Python 的 `heapq` 只有小顶堆，没有原生大顶堆。
因此通常会用一个小技巧：

> **把数字取反后放进堆里，用负数模拟大顶堆。**

### 为什么右边用小顶堆

右边维护的是“较大的一半”。
我们最关心的是这部分里**最小的那个数**，因为它也最靠近中位数。

所以右边直接用小顶堆就正合适。

## 关键规则：大顶堆数量要大于或等于小顶堆

这题最重要的平衡条件有两个：

### 1. 大小关系要正确

也就是：

> 大顶堆中的所有元素，都要小于等于小顶堆中的所有元素

### 2. 数量关系要正确

也就是：

- 两个堆元素个数相等
- 或者大顶堆比小顶堆多一个

换句话说：

> **大顶堆的数量必须大于或等于小顶堆数量。**

这样设计有个很大的好处：

- 如果总元素个数是奇数，中位数直接就是大顶堆堆顶
- 如果总元素个数是偶数，中位数就是两个堆顶的平均值

## 代码实现

```python
import heapq

class MedianFinder(object):

    def __init__(self):
        # 双堆法
        self.max_heap = []
        self.min_heap = []

    def addNum(self, num):
        """
        :type num: int
        :rtype: None
        """
        heapq.heappush(self.max_heap, -num)
        heapq.heappush(self.min_heap, -heapq.heappop(self.max_heap))

        # 保证 max_heap 的数量 >= min_heap
        if len(self.max_heap) < len(self.min_heap):
            heapq.heappush(self.max_heap, -heapq.heappop(self.min_heap))

    def findMedian(self):
        """
        :rtype: float
        """
        if len(self.min_heap) == len(self.max_heap):
            return (self.min_heap[0] - self.max_heap[0]) / 2.0
        else:
            return -self.max_heap[0]
```

## `addNum()` 这三步到底在干嘛

这题模板的精华，几乎全在 `addNum()` 里。

### 第一步：先把新数放进大顶堆

```python
heapq.heappush(self.max_heap, -num)
```

先默认这个新数属于“左边较小的一半”。

### 第二步：把左边最大的数送到右边

```python
heapq.heappush(self.min_heap, -heapq.heappop(self.max_heap))
```

因为 `max_heap` 里存的是负数，所以弹出来的是最小负数，对应真实值里的最大值。

这一步的本质是：

> **把左边当前最大的那个数，送到右边去。**

这样做之后，就能自然保证：

> 左边所有数 <= 右边所有数

也就是两个堆的大小关系不乱套。

### 第三步：如果右边元素更多，就再挪回一个

```python
if len(self.max_heap) < len(self.min_heap):
    heapq.heappush(self.max_heap, -heapq.heappop(self.min_heap))
```

如果小顶堆数量反超了大顶堆，就不满足“左边数量 >= 右边数量”的规则了。

所以这一步是把右边最小的那个数再拿回来，补到左边。

于是最终就同时满足：

- 左边所有数不大于右边所有数
- 左边元素个数大于等于右边元素个数

这三步配合起来，代码不长，但味道很冲，属于双堆界的经典模板。

## `findMedian()` 为什么这样写

### 情况一：两个堆一样大

说明总元素个数是偶数。
这时候中位数就是：

- 左边最大值
- 右边最小值

的平均值。

左边最大值是：

```python
-self.max_heap[0]
```

右边最小值是：

```python
self.min_heap[0]
```

所以：

```python
(self.min_heap[0] - self.max_heap[0]) / 2.0
```

这里看起来是减法，其实是因为 `max_heap[0]` 本身就是负数。

### 情况二：大顶堆比小顶堆多一个

说明总元素个数是奇数。
这时候中位数就直接是左边堆顶：

```python
-self.max_heap[0]
```

## 结合样例走一遍

假设依次加入：

```python
1, 2, 3
```

### 加入 1

- 先入 `max_heap`
- 再送去 `min_heap`
- 发现右边多了，再挪回来

最终：

```python
max_heap = [-1]
min_heap = []
```

中位数就是：

```python
1
```

### 加入 2

最终平衡后：

```python
max_heap = [-1]
min_heap = [2]
```

中位数是：

```python
(1 + 2) / 2 = 1.5
```

### 加入 3

最终平衡后：

```python
max_heap = [-2, -1]
min_heap = [3]
```

中位数就是：

```python
2
```

完全符合预期。

## 复杂度分析

### `addNum(num)`

每次插入都只涉及常数次堆操作，单次堆操作复杂度是：

```python
O(log n)
```

所以：

```python
addNum = O(log n)
```

### `findMedian()`

只需要查看堆顶，不需要额外计算排序：

```python
O(1)
```

### 空间复杂度

所有加入的数据最终都会存进两个堆里，所以空间复杂度是：

```python
O(n)
```

## 这题最值得记住的点

这题看起来是在求中位数，实际上是在维护两个平衡的区间：

- 左边一半
- 右边一半

而最关键的不是堆本身，而是这两个规则：

1. **左边都要小于等于右边**
2. **左边数量要大于或等于右边**

只要这两件事稳住了，中位数就能很快拿出来。

## 小结

这题是双堆模板题，核心就一句：

> **左堆装较小的一半，右堆装较大的一半，左边数量始终不少于右边。**

这样一来：

- 奇数个元素时，中位数就是左堆堆顶
- 偶数个元素时，中位数就是两个堆顶平均值

题目看着凶，方法其实很工整。
理解清楚之后，你会发现它不是乱，而是很讲秩序。
堆一左一右，数在中间，秩序一立，中位数自己就浮上来了。🦐
