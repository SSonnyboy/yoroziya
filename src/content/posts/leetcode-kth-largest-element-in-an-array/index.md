---
title: LeetCode 215 数组中的第K个最大元素
published: 2026-04-13
description: "这题可以直接排序，也可以用容量为 K 的最小堆，更进阶的做法是快速选择。本文重点记录最小堆与快速选择的思路和易错点。"
image: "https://img.102465.xyz/file/1776063808069_cover.jpg"
tags: ["Leetcode", "数组", "堆", "快速选择", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

这题比上一道 KMP 老实不少。
它写着中等，做起来也确实像中等，没有“简单题外表，专题题灵魂”的反差攻击。

题目要求找出数组中第 `k` 个最大的元素。
注意，这里找的是**第 `k` 大**，不是去重后的第 `k` 个不同元素。

比如：

```python
nums = [3, 2, 1, 5, 6, 4]
k = 2
```

答案是 `5`，因为按从大到小排：

```python
[6, 5, 4, 3, 2, 1]
```

排第二的就是它。

## 题目链接

[LeetCode 215. 数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给定整数数组 `nums` 和整数 `k`，请返回数组中第 `k` 个最大的元素。

请注意，你需要找的是数组排序后的第 `k` 个最大的元素，而不是第 `k` 个不同的元素。

![题目截图](https://img.102465.xyz/file/1776063808069_cover.jpg)

## 解法一：排序

最直接的思路，就是先排序。

```python
class Solution(object):
    def findKthLargest(self, nums, k):
        nums.sort()
        return nums[-k]
```

### 思路解析

把数组从小到大排好序后：

- 最后一个元素是第 `1` 大
- 倒数第二个元素是第 `2` 大
- 倒数第 `k` 个元素就是第 `k` 大

所以直接返回：

```python
nums[-k]
```

### 复杂度分析

- **时间复杂度：** `O(n log n)`
- **空间复杂度：** 取决于排序实现

这个方法简单直接，考试里也很稳。
但它把整个数组都排了，其实有点“为了找一个人，把全村人都叫出来站队”。

## 解法二：维护容量为 K 的最小堆

这题更经典的做法，是维护一个大小不超过 `k` 的**最小堆**。

核心想法是：

> **堆里始终只保留当前最大的 `k` 个元素。**

由于这是最小堆：

- 堆顶是这 `k` 个元素里最小的那个
- 那它刚好就是整个数组里的**第 `k` 大元素**

### 代码实现

```python
import heapq

class Solution(object):
    def findKthLargest(self, nums, k):
        """
        :type nums: List[int]
        :type k: int
        :rtype: int
        """
        heap = []
        for num in nums:
            heapq.heappush(heap, num)
            if len(heap) > k:
                heapq.heappop(heap)
        return heap[0]
```

### 思路解析

比如：

```python
nums = [3, 2, 1, 5, 6, 4]
k = 2
```

我们的目标是保留最大的 2 个元素。

遍历过程大概是：

- 放入 `3`，堆里是 `[3]`
- 放入 `2`，堆里是 `[2, 3]`
- 放入 `1`，堆里变成 `[1, 3, 2]`，大小超过 `2`，弹出最小值 `1`
- 放入 `5`，再弹出最小值
- 放入 `6`，再弹出最小值
- 放入 `4`，再弹出最小值

最后堆里只会剩下最大的两个数：

```python
[5, 6]
```

因为最小堆堆顶是其中较小的那个，所以答案就是：

```python
5
```

### 为什么一定是最小堆

这题要求找第 `k` 大，本质上就是：

> **维护最大的 `k` 个数。**

如果堆里放的就是这 `k` 个最大数，那么其中最小的那个，正好排在第 `k` 名。
所以用最小堆最顺手。

### 复杂度分析

- **时间复杂度：** `O(n log k)`
- **空间复杂度：** `O(k)`

相比直接排序的 `O(n log n)`，当 `k` 远小于 `n` 时，这种做法更划算。

## 解法三：快速选择

如果想继续优化时间复杂度，可以使用**快速选择（Quick Select）**。

这题要求找第 `k` 大元素，而快速选择更方便找“第几个最小”。
所以通常先做一个转换：

```python
target = n - k
```

也就是说：

> 第 `k` 大元素 = 升序排序后下标为 `n-k` 的元素

举个例子：

```python
nums = [3, 2, 1, 5, 6, 4]
k = 2
```

升序后：

```python
[1, 2, 3, 4, 5, 6]
```

第 `2` 大是 `5`，它的下标是：

```python
6 - 2 = 4
```

所以问题就转成了：

> 找下标为 `4` 的那个数。

### 代码实现

```python
import random

class Solution(object):
    def findKthLargest(self, nums, k):
        """
        :type nums: List[int]
        :type k: int
        :rtype: int
        """
        n = len(nums)
        target = n - k

        def quickk(l, r, t):
            if l == r:
                return nums[l]

            pivot = random.randint(l, r)
            pivot_val = nums[pivot]

            # three partition
            lt, i, rt = l, l, r
            while i <= rt:
                if nums[i] < pivot_val:
                    nums[lt], nums[i] = nums[i], nums[lt]
                    lt += 1
                    i += 1
                elif nums[i] > pivot_val:
                    nums[rt], nums[i] = nums[i], nums[rt]
                    rt -= 1
                else:
                    i += 1

            if t < lt:
                return quickk(l, lt - 1, t)
            elif t > rt:
                return quickk(rt + 1, r, t)
            else:
                return pivot_val

        return quickk(0, n - 1, target)
```

## 三路划分在干嘛

这段代码的核心，是把当前区间分成三块：

- 小于 `pivot_val`
- 等于 `pivot_val`
- 大于 `pivot_val`

也就是：

```python
nums[l:lt] < pivot_val
nums[lt:rt+1] == pivot_val
nums[rt+1:r+1] > pivot_val
```

分完之后再看目标下标 `t` 落在哪一段：

- 如果 `t < lt`，说明目标在左边那一段
- 如果 `t > rt`，说明目标在右边那一段
- 否则，说明目标就在中间这段里，直接返回 `pivot_val`

这样就不用像快速排序那样两边都递归，只需要进入目标所在的一边，所以效率更高。

## 这题最容易踩的坑

快速选择里有一个特别容易写错的点，就是这段：

```python
elif nums[i] > pivot_val:
    nums[rt], nums[i] = nums[i], nums[rt]
    rt -= 1
```

这里**不能**在交换后立刻写：

```python
i += 1
```

### 为什么不能加 `i += 1`

因为从右边换过来的这个新值，你还没检查过。

当前发生的是：

- `nums[i] > pivot_val`
- 所以把它和 `nums[rt]` 交换
- 交换后，`i` 位置来了一个新的元素

而这个新元素可能：

- 小于 `pivot_val`
- 等于 `pivot_val`
- 大于 `pivot_val`

你都还不知道。
所以必须让它留在当前位置继续判断，不能直接跳过。

这个地方如果手一抖多写了个 `i += 1`，代码大概率就会悄悄跑偏，然后你开始怀疑人生、怀疑数组、怀疑堆，最后怀疑自己是不是不适合和下标做朋友。

### 复杂度分析

- **平均时间复杂度：** `O(n)`
- **最坏时间复杂度：** `O(n^2)`
- **空间复杂度：** 递归栈平均 `O(log n)`

虽然最坏情况不太体面，但平均表现很好，所以它通常被当作这题的进阶解法。

## 三种解法对比

| 解法 | 时间复杂度 | 空间复杂度 | 特点 |
| --- | --- | --- | --- |
| 排序 | `O(n log n)` | 视实现而定 | 最简单，最好写 |
| 最小堆 | `O(n log k)` | `O(k)` | 标准做法，适合维护前 `k` 大 |
| 快速选择 | 平均 `O(n)` | 平均 `O(log n)` | 进阶写法，更考验分区细节 |

## 小结

这题最重要的，不是死记某一个模板，而是搞清楚它的本质：

> **找第 `k` 大，不一定非要把整个数组排完。**

- 想写得最省心，直接排序
- 想写得更高效，用最小堆
- 想冲进阶，就上快速选择

如果只记一句话，我建议记这个：

> **堆是维护前 `k` 名，快速选择是定位目标下标。**

两种思路，两个流派。
一个稳，一个快。
写题时按场景选，不必逞强，但也别怕上强度。🦐
