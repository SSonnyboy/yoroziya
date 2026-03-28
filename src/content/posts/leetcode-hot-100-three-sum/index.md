---
title: Leetcode Hot 100 三数之和
published: 2026-03-27
description: "Leetcode Hot 100 双指针板块第六题记录：三数之和。本文用排序加双指针拆解如何固定一个数后在剩余区间寻找两数之和，同时处理重复元素，避免得到重复三元组。"
image: "https://img.102465.xyz/file/1774701523354_three-sum-cover.jpg"
tags: ["Leetcode", "Hot 100", "双指针", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 第六篇，来到双指针题库里一位相当有名的老面孔：**三数之和**。

这题不难看出和“两数之和”是亲戚，
但它比两数之和更烦一点的地方在于：

- 不是找两个数，而是找三个数
- 不是找一组答案，而是找所有不重复答案
- 不是只要能做出来，还得把**重复结果去干净**

所以这题真正的难点，不只是“双指针”，
而是：

> **排序之后，如何一边找答案，一边优雅地去重。**

## 题目链接

[LeetCode 15. 三数之和](https://leetcode.cn/problems/3sum/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给你一个整数数组 `nums`，判断是否存在三元组 `[nums[i], nums[j], nums[k]]` 满足：

- `i != j`
- `i != k`
- `j != k`
- `nums[i] + nums[j] + nums[k] == 0`

请你返回所有和为 `0` 且**不重复**的三元组。

注意：答案中不可以包含重复的三元组。

![三数之和题目截图](https://img.102465.xyz/file/1774701523354_three-sum-cover.jpg)

## 解题思路：排序 + 固定一个数 + 左右双指针

这题最经典的做法，就是先排序。

排序之后，我们可以把问题拆成两层：

1. 先固定第一个数 `nums[idx]`
2. 再在它右边的区间里，用双指针去找两个数，使它们的和等于 `-nums[idx]`

这样一来，原本的“三数之和”问题，
就被我们拆成了一个外层枚举 + 一个内层“两数之和”问题。

### 为什么排序是关键？

因为排序之后：

- 才能使用左右双指针
- 才能方便处理重复元素
- 才能做一些提前剪枝优化

没有排序，这题会很乱；
排好序之后，很多逻辑都会顺下来。

## 核心思路拆开说

假设排序后数组是：

```python
nums = [-4, -1, -1, 0, 1, 2]
```

我们先固定第一个数，比如固定 `-1`。

那问题就变成：

> 在它后面的区间里，找两个数，它们的和等于 `1`。

这时候就可以用双指针：

- `left` 从固定点右边开始
- `right` 从数组末尾开始

如果：

- `nums[left] + nums[right] < target`，说明和太小，`left += 1`
- `nums[left] + nums[right] > target`，说明和太大，`right -= 1`
- 相等，就记录答案，然后继续去重

## 代码实现

```python
class Solution(object):
    def threeSum(self, nums):
        """
        :type nums: List[int]
        :rtype: List[List[int]]
        """
        nums.sort()
        n = len(nums)
        ans = []

        for idx, i in enumerate(nums):
            if idx > n - 3:
                break

            # 跳过重复的第一个数
            if idx > 0 and i == nums[idx - 1]:
                continue

            # 最小三数之和都大于 0，后面不可能再有答案
            if i + nums[idx + 1] + nums[idx + 2] > 0:
                break

            # 最大三数之和仍小于 0，当前这个 i 不可能组成答案
            if i + nums[n - 2] + nums[n - 1] < 0:
                continue

            target = -i
            left, right = idx + 1, n - 1

            while left < right:
                x = nums[left] + nums[right]
                if x < target:
                    left += 1
                elif x > target:
                    right -= 1
                else:
                    ans.append([i, nums[left], nums[right]])

                    left += 1
                    while left < right and nums[left] == nums[left - 1]:
                        left += 1

                    right -= 1
                    while left < right and nums[right] == nums[right + 1]:
                        right -= 1

        return ans
```

## 代码解析

### 1. 先排序

```python
nums.sort()
```

排序之后，数组从小到大排列。

这一步有两个作用：

- 方便双指针根据大小关系移动
- 方便识别并跳过重复元素

### 2. 枚举第一个数

```python
for idx, i in enumerate(nums):
```

这里的 `i` 表示三元组里的第一个数。

一旦它固定下来，剩下的问题就是：

> 在 `idx + 1` 到 `n - 1` 之间，找两个数，它们的和等于 `-i`。

### 3. 枚举边界

```python
if idx > n - 3:
    break
```

因为至少还要留两个位置给另外两个数，
所以当 `idx` 已经走到倒数第二个位置以后，就不用继续了。

### 4. 第一次去重：跳过重复的第一个数

```python
if idx > 0 and i == nums[idx - 1]:
    continue
```

如果当前固定的数，和前一个固定过的数相同，
那后面找到的组合很可能会重复。

所以：

- 前一个 `-1` 已经试过了
- 后一个 `-1` 就没必要再来一遍

这是**第一层去重**。

### 5. 剪枝优化

```python
if i + nums[idx + 1] + nums[idx + 2] > 0:
    break
```

因为数组已经排序，
如果当前 `i` 加上后面最小的两个数，和都已经大于 `0`，
那后面只会更大，不可能再凑出 `0`，直接结束。

再看另一句：

```python
if i + nums[n - 2] + nums[n - 1] < 0:
    continue
```

如果当前 `i` 加上数组里最大的两个数，和仍然小于 `0`，
说明当前这个 `i` 太小了，根本带不动，
那就跳过它，继续看下一个更大的数。

### 6. 目标转化

```python
target = -i
```

固定了第一个数 `i` 以后，
剩下两个数之和必须等于 `-i`。

于是问题就从“三数之和”变成了“有序数组里的两数之和”。

### 7. 左右双指针查找

```python
left, right = idx + 1, n - 1
```

- `left` 从固定点右边开始
- `right` 从数组末尾开始

然后：

```python
x = nums[left] + nums[right]
```

- 如果 `x < target`，说明和太小，左指针右移
- 如果 `x > target`，说明和太大，右指针左移
- 如果相等，说明找到一个合法三元组

### 8. 记录答案后继续去重

```python
ans.append([i, nums[left], nums[right]])
```

找到答案后，不能立刻结束，
因为还可能有别的组合也能和为 `0`。

但继续移动之前，一定要处理重复值。

#### 第二层去重：左指针去重

```python
left += 1
while left < right and nums[left] == nums[left - 1]:
    left += 1
```

#### 第三层去重：右指针去重

```python
right -= 1
while left < right and nums[right] == nums[right + 1]:
    right -= 1
```

这样就能避免把相同的三元组重复加入答案。

## 示例推演

假设输入：

```python
nums = [-1, 0, 1, 2, -1, -4]
```

先排序：

```python
[-4, -1, -1, 0, 1, 2]
```

### 第一轮：固定 `-4`

目标是找两个数和为 `4`。

- `left = 1`，值为 `-1`
- `right = 5`，值为 `2`

两数之和分别尝试后，找不到满足条件的组合。

### 第二轮：固定 `-1`（下标 1）

目标是找两个数和为 `1`。

- `left = 2`，值为 `-1`
- `right = 5`，值为 `2`

得到：

```python
-1 + (-1) + 2 = 0
```

记录答案：

```python
[-1, -1, 2]
```

继续移动去重后：

- `left` 来到 `0`
- `right` 可能来到 `1`

再检查一次，可以得到：

```python
-1 + 0 + 1 = 0
```

记录答案：

```python
[-1, 0, 1]
```

### 第三轮：固定第二个 `-1`

因为和前一个相同，所以跳过。

最终答案为：

```python
[[-1, -1, 2], [-1, 0, 1]]
```

## 为什么去重一定要做三层

这题最容易翻车的地方，不是双指针本身，
而是**重复答案**。

去重不完整，就会把同一个三元组塞进结果多次。

所以通常要记住这三层：

### 第一层：固定数去重

避免从相同的起点重复开局。

### 第二层：左指针去重

找到答案后，跳过相同的左值。

### 第三层：右指针去重

找到答案后，跳过相同的右值。

三层都做好，答案才会干净。

## 复杂度分析

### 时间复杂度

- 排序：`O(n log n)`
- 外层枚举每个数：`O(n)`
- 每次枚举内部双指针扫描：`O(n)`

所以总时间复杂度为：

```python
O(n^2)
```

### 空间复杂度

如果不算结果数组，额外空间主要来自排序实现。

通常记作：

```python
O(log n)
```

在很多刷题语境下，也常简单记为：

```python
O(1)
```

但严格一点，排序栈空间通常不完全算零。

## 你这版思路的亮点

你给的代码主线其实很完整：

- 先排序
- 固定第一个数
- 双指针找剩下两个数
- 找到答案后左右都去重
- 还加了上下界剪枝优化

这已经是比较成熟的写法了。

其中这两句尤其值得保留：

```python
if i + nums[idx + 1] + nums[idx + 2] > 0:
    break
```

和：

```python
if i + nums[n - 2] + nums[n - 1] < 0:
    continue
```

它们能帮助我们在明显不可能时提前结束或跳过，
让代码更利索一些。

## 小结

这题表面上是在考三数之和，
本质上是在考你会不会把复杂问题拆成：

> **排序 + 固定一个数 + 有序区间双指针查两数之和。**

而真正让它从“能做出来”升级到“做得漂亮”的关键，
就在去重。

如果只记一句话，那就是：

> **先排序定基调，再双指针逼近，最后把重复答案统统请出门。**

Hot 100 第六篇，继续推进。
这题属于面试里那种常客级选手，碰到它别慌，先排个序，再把重复值看牢，场子就稳了。🦐
