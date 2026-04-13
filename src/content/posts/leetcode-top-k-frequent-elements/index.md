---
title: LeetCode 347 前K个高频元素
published: 2026-04-13
description: "这题的核心是先统计频率，再用一个容量为 K 的小顶堆维护当前前 K 个高频元素。本文记录 Counter + 小顶堆的标准解法。"
image: "https://img.102465.xyz/file/1776065920268_cover.jpg"
tags: ["Leetcode", "数组", "堆", "哈希表", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

这题和前面的第 K 个最大元素有点像，都是在做“前 K 名”的维护。
只不过上一题比的是数值大小，这一题比的是出现频率。

题目要求返回数组中出现频率前 `k` 高的元素，顺序不限。
所以这题的关键不在排序数组，而在于：

> **先统计频率，再维护前 `k` 个高频元素。**

## 题目链接

[LeetCode 347. 前K个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给你一个整数数组 `nums` 和一个整数 `k`，请你返回其中出现频率前 `k` 高的元素。
你可以按任意顺序返回答案。

![题目截图](https://img.102465.xyz/file/1776065920268_cover.jpg)

## 解法：Counter + 小顶堆

这题最经典、也最顺手的写法，就是：

- 先用 `Counter` 统计每个元素出现的次数
- 再用一个大小不超过 `k` 的小顶堆，维护当前前 `k` 个高频元素

### 代码实现

```python
import heapq
from collections import Counter

class Solution(object):
    def topKFrequent(self, nums, k):
        """
        :type nums: List[int]
        :type k: int
        :rtype: List[int]
        """
        counter = Counter(nums)
        heap = []

        for item, freq in counter.items():
            heapq.heappush(heap, (freq, item))
            if len(heap) > k:
                heapq.heappop(heap)

        return [item for freq, item in heap]
```

## 第一步：先统计频率

这一步很直白：

```python
counter = Counter(nums)
```

比如：

```python
nums = [1, 1, 1, 2, 2, 3]
```

统计结果就是：

```python
{1: 3, 2: 2, 3: 1}
```

意思是：

- `1` 出现了 3 次
- `2` 出现了 2 次
- `3` 出现了 1 次

既然题目比较的是“谁更高频”，那就必须先把这个频率表做出来。

## 第二步：为什么用小顶堆

堆里存的不是单独的元素，而是：

```python
(频率, 元素值)
```

比如：

```python
(3, 1)
(2, 2)
(1, 3)
```

因为 Python 的 `heapq` 默认是**小顶堆**，所以堆顶永远是当前堆里频率最小的那个。

这正好适合这题。
因为我们想维护的是：

> **当前频率最高的前 `k` 个元素**

所以每来一个新元素：

- 先把它压入堆
- 如果堆的大小超过了 `k`
- 就把堆顶弹出去

被弹出去的，就是当前前 `k` 名里最不够格的那个。

## 为什么这样做一定对

因为整个过程中，堆始终只保留“目前见过的前 `k` 高频元素”。

- 如果一个新元素频率更高，它就会把低频元素挤掉
- 如果一个新元素频率不够高，它即使先进堆，也会很快被弹出去

等遍历结束后，堆里剩下的自然就是出现频率最高的前 `k` 个元素。

## 结合样例走一遍

比如：

```python
nums = [1, 1, 1, 2, 2, 3]
k = 2
```

先统计频率：

```python
counter = {
    1: 3,
    2: 2,
    3: 1
}
```

然后依次入堆。

### 放入 `(3, 1)`

```python
heap = [(3, 1)]
```

### 放入 `(2, 2)`

```python
heap = [(2, 2), (3, 1)]
```

### 放入 `(1, 3)`

```python
heap = [(1, 3), (3, 1), (2, 2)]
```

这时堆大小已经超过 `k = 2`，所以弹出堆顶：

```python
heapq.heappop(heap)
```

被弹出的就是：

```python
(1, 3)
```

剩下：

```python
[(2, 2), (3, 1)]
```

最后提取元素值，得到：

```python
[2, 1]
```

因为题目允许任意顺序返回，所以 `[1, 2]` 和 `[2, 1]` 都是正确答案。

## 复杂度分析

假设数组长度为 `n`，不同元素个数为 `m`。

### 时间复杂度

1. `Counter(nums)` 统计频率：`O(n)`
2. 遍历 `m` 个不同元素，维护小顶堆：每次堆操作是 `O(log k)`

所以总时间复杂度是：

```python
O(n + m log k)
```

很多时候也会简写成：

```python
O(n log k)
```

### 空间复杂度

- `Counter` 需要 `O(m)`
- 堆最多存 `k` 个元素，需要 `O(k)`

总空间复杂度可以记为：

```python
O(m)
```

## 这题和 215 的区别

这题和 LeetCode 215《数组中的第 K 个最大元素》很像，都是用堆维护“前 K 名”。

但两题维护的东西不一样：

### 215 题维护的是

```python
元素值本身
```

目标是：

> 维护最大的 `k` 个数

### 347 题维护的是

```python
(频率, 元素)
```

目标是：

> 维护频率最高的 `k` 个元素

一句话概括就是：

> **215 比大小，347 比人气。**

一个看战斗力，一个看出场率。
都用堆，但赛道不同。

## 补充：为什么不用直接排序频率表

当然也可以先统计频率，再把所有元素按频率排序。

比如：

```python
counter = Counter(nums)
sorted_items = sorted(counter.items(), key=lambda x: x[1], reverse=True)
return [item for item, freq in sorted_items[:k]]
```

这样也能做出来。

但它的时间复杂度通常是：

```python
O(m log m)
```

相比之下，小顶堆只需要维护 `k` 个元素，效率会更好，尤其是当 `k` 远小于不同元素个数 `m` 时，更有优势。

## 小结

这题真正的主线很清楚：

1. **先统计频率**
2. **再用小顶堆维护前 `k` 个高频元素**
3. **堆满了就弹出频率最小的那个**

如果只记一句话，那我建议记这个：

> **先数人头，再留前 K 名。**

这题不难，重点就是把“统计”和“维护前 K 名”这两步拆开想清楚。
想通了之后，代码就会写得很顺。🦐
