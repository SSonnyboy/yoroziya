---
title: Leetcode Hot 100 接雨水
published: 2026-03-27
description: "Leetcode Hot 100 双指针板块第七题记录：接雨水。本文先用前缀最大值和后缀最大值拆解每一列能接多少水，再解释为什么核心不是求和，而是找左右两侧的最高挡板。"
image: "https://img.102465.xyz/file/1774701532420_trapping-rain-water-cover.jpg"
tags: ["Leetcode", "Hot 100", "前后缀", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 第七篇，来到这道名字很形象、思路也很有画面感的经典题：**接雨水**。

这题第一次看，很多人脑子里会自动出现一个问题：

- 这一格能不能存水？
- 如果能，能存多少？

而真正的关键并不是“雨下了多少”，
而是：

> **这一列左边最高能挡到哪，右边最高又能挡到哪。**

只要左右两边有挡板，中间低下去的地方，就有机会蓄水。

## 题目链接

[LeetCode 42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给定 `n` 个非负整数表示每个宽度为 `1` 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

![接雨水题目截图](https://img.102465.xyz/file/1774701532420_trapping-rain-water-cover.jpg)

## 先想明白：一列水能装多少？

对于任意位置 `i`，它上面能存多少水，不取决于自己有多高，
而取决于：

- 它左边最高的柱子有多高
- 它右边最高的柱子有多高

因为最终水位，受较低的那一边限制。

所以位置 `i` 的接水量公式是：

```python
min(left_max[i], right_max[i]) - height[i]
```

其中：

- `left_max[i]`：位置 `i` 左边及自身的最高柱子
- `right_max[i]`：位置 `i` 右边及自身的最高柱子

如果这个值大于 `0`，说明这里能接水；
如果等于 `0`，说明这里存不住。

一句话总结：

> **能接多少水，看左右挡板里更矮的那块，再减去自己本来的高度。**

## 你的思路其实不是“前后缀和”，而是“前后缀最大值”

先给你这版代码正个名。

你写的是：

- 从左往右，维护到当前位置为止的最大高度
- 从右往左，维护到当前位置为止的最大高度
- 再逐位计算可接雨水

这不是前后缀和，
而是更准确的：

> **前缀最大值 + 后缀最大值**

而且这不是“效率有点慢”的偏门写法，
它其实就是这题非常经典、非常标准的一种正解。

- 时间复杂度：`O(n)`
- 空间复杂度：`O(n)`

完全拿得出手。

## 代码实现

```python
class Solution(object):
    def get_sufsum(self, nums):
        ans = []
        for idx, i in enumerate(nums):
            if idx == 0:
                ans.append(nums[0])
            else:
                ans.append(max(nums[idx], ans[-1]))
        return ans

    def trap(self, height):
        """
        :type height: List[int]
        :rtype: int
        """
        # 实际上这里处理的是前缀最大值和后缀最大值
        list1 = self.get_sufsum(height)
        list2 = list(reversed(self.get_sufsum(list(reversed(height)))))
        list_ref = [min(i, j) - h for (i, j, h) in zip(list1, list2, height)]
        return sum(list_ref)
```

## 稍微整理一下的等价写法

为了博客里更直观一点，我把这个思路写成名字更清楚的版本：

```python
class Solution(object):
    def trap(self, height):
        """
        :type height: List[int]
        :rtype: int
        """
        n = len(height)
        if n == 0:
            return 0

        left_max = [0] * n
        right_max = [0] * n

        left_max[0] = height[0]
        for i in range(1, n):
            left_max[i] = max(left_max[i - 1], height[i])

        right_max[n - 1] = height[n - 1]
        for i in range(n - 2, -1, -1):
            right_max[i] = max(right_max[i + 1], height[i])

        ans = 0
        for i in range(n):
            ans += min(left_max[i], right_max[i]) - height[i]

        return ans
```

这和你原来的思路完全一样，
只是把函数名和变量名换得更容易一眼看懂。

## 代码解析

### 1. 先求每个位置左边的最高挡板

```python
left_max[0] = height[0]
for i in range(1, n):
    left_max[i] = max(left_max[i - 1], height[i])
```

这个数组表示：

- 到当前位置为止
- 左边出现过的最高柱子是多少

比如：

```python
height = [0,1,0,2]
```

那么 `left_max` 会是：

```python
[0,1,1,2]
```

意思是：

- 第 0 位左边最高是 0
- 第 1 位左边最高是 1
- 第 2 位左边最高还是 1
- 第 3 位左边最高变成 2

### 2. 再求每个位置右边的最高挡板

```python
right_max[n - 1] = height[n - 1]
for i in range(n - 2, -1, -1):
    right_max[i] = max(right_max[i + 1], height[i])
```

这个数组表示：

- 从当前位置往右看
- 能遇到的最高柱子是多少

继续上面的例子：

```python
height = [0,1,0,2]
```

那么 `right_max` 会是：

```python
[2,2,2,2]
```

### 3. 逐格计算能接多少水

```python
ans += min(left_max[i], right_max[i]) - height[i]
```

这一步就是整题的结算公式。

为什么要取 `min(left_max[i], right_max[i])`？

因为水位不能超过较低的那一边。

比如某格：

- 左边最高是 `5`
- 右边最高是 `3`

那这格最多只能存到高度 `3`。

左边再高也没用，
右边矮了，水还是会从右边漏掉。

## 示例推演

来看题目经典样例：

```python
height = [0,1,0,2,1,0,1,3,2,1,2,1]
```

这题的答案是：

```python
6
```

我们不把整张表全展开，先抓几个关键位置看。

### 位置 2，高度为 0

- 左边最高：1
- 右边最高：3

所以这里能接的水是：

```python
min(1, 3) - 0 = 1
```

### 位置 5，高度为 0

- 左边最高：2
- 右边最高：3

所以这里能接的水是：

```python
min(2, 3) - 0 = 2
```

### 位置 6，高度为 1

- 左边最高：2
- 右边最高：3

所以这里能接的水是：

```python
min(2, 3) - 1 = 1
```

把所有位置能接的水加起来，总和就是：

```python
6
```

## 为什么这个方法正确

因为每一格是否能蓄水，本质上只看两件事：

- 左边有没有足够高的墙
- 右边有没有足够高的墙

而这两个条件恰好可以通过：

- 前缀最大值数组
- 后缀最大值数组

直接一次性预处理出来。

之后每个位置都能在 `O(1)` 时间内得出答案。

所以整题就从“看起来每格都要往左右搜索”，
变成了“先把左右最高值备好，再统一结算”。

这就是预处理的威力。

## 复杂度分析

### 时间复杂度

- 构造 `left_max`：`O(n)`
- 构造 `right_max`：`O(n)`
- 再遍历一次求总和：`O(n)`

总时间复杂度：

```python
O(n)
```

### 空间复杂度

额外使用了两个长度为 `n` 的数组：

```python
O(n)
```

## 解法二：相向双指针

如果想继续优化空间，这题还可以写成**相向双指针**。

核心思路是：

- 用 `left` 和 `right` 分别从两端向中间收缩
- 同时维护当前左侧最高值 `left_max`
- 和当前右侧最高值 `right_max`
- 每次只处理较矮的一侧

为什么可以这样做？

因为哪一边更矮，当前这一格的接水上限，就先由那一边决定。

也就是说：

- 如果 `height[left] < height[right]`
- 那么左边这格最终能接多少水，只需要看 `left_max`
- 这时右边再高，暂时也不会成为限制问题

这就是双指针版背后的“短板效应”。

### 代码实现

```python
class Solution(object):
    def trap(self, height):
        """
        :type height: List[int]
        :rtype: int
        """
        n = len(height)
        left, right = 0, n - 1
        ans = 0
        left_max, right_max = 0, 0

        while left < right:
            if height[left] < height[right]:
                if height[left] > left_max:
                    left_max = height[left]
                else:
                    ans += left_max - height[left]
                left += 1
            else:
                if height[right] > right_max:
                    right_max = height[right]
                else:
                    ans += right_max - height[right]
                right -= 1

        return ans
```

### 思路解析

双指针版最核心的判断就是：

```python
if height[left] < height[right]:
```

#### 情况一：左边更矮

说明当前左边这一格，未来能接多少水，
取决于左边历史最高挡板 `left_max`。

- 如果 `height[left] > left_max`，那就更新左侧最高墙
- 否则这里就能接：

```python
left_max - height[left]
```

然后左指针右移。

#### 情况二：右边更矮或相等

同理，右边这格能接多少水，
就由右边历史最高挡板 `right_max` 决定。

- 如果 `height[right] > right_max`，更新 `right_max`
- 否则这里就能接：

```python
right_max - height[right]
```

然后右指针左移。

### 为什么双指针版能成立

因为当我们发现：

```python
height[left] < height[right]
```

就说明当前左边这格至少已经有一个不低于它的右挡板存在。

此时左边这格到底能装多少水，
关键就看左边历史最高挡板 `left_max` 能把它托到多高。

右边既然已经不比它矮，
那这一步就可以放心结算左边。

另一侧同理。

这也是为什么双指针版不需要真的把整个 `left_max` 和 `right_max` 数组存下来，
只需要边走边维护两个最大值就够了。

## 两种解法对比

| 解法 | 时间复杂度 | 空间复杂度 | 特点 |
| --- | --- | --- | --- |
| 前缀最大值 + 后缀最大值 | `O(n)` | `O(n)` | 更直观，适合先把题想明白 |
| 相向双指针 | `O(n)` | `O(1)` | 更省空间，属于进一步优化 |

所以如果从“空间效率”角度看，
双指针版会更省。

但这不代表前后缀版差。

恰恰相反：

> **前后缀最大值版更直观，更适合先把这题想明白；双指针版则是在此基础上的空间优化。**

## 这种写法的关键点

### 1. 不是前后缀和，而是前后缀最大值

别被“前缀/后缀”这几个字带偏。

这里不是在累加，
而是在记录“到这里为止最高有多高”。

### 2. 每格水位由左右较低挡板决定

这就是整题唯一核心公式的来源。

### 3. 预处理不是多余，而是在换时间思路

如果每个位置都临时往左右扫，效率会很差。
先预处理好左右最高值，后面就轻松很多。

## 小结

这题表面是在问“总共能接多少雨水”，
本质上是在考：

> **你能不能把每一列的局部条件先算清，再汇总出整体答案。**

而你这版思路的核心，就是：

- 左边最高先备好
- 右边最高也备好
- 每一列按公式结算

如果只记一句话，那就是：

> **接雨水不看天意，看左右挡板谁先卡水位。**

Hot 100 第七篇，继续推进。
这题虽然名字很湿，但思路其实很干脆：先把墙摸清，再算水有多少，逻辑一滴都不浪费。🦐
