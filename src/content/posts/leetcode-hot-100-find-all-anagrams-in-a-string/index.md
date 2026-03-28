---
title: Leetcode Hot 100 找到字符串中所有字母异位词
published: 2026-03-28
description: "Leetcode Hot 100 滑动窗口板块第九题记录：找到字符串中所有字母异位词。本文用定长滑动窗口加 Counter 拆解如何在字符串 s 中找到所有与 p 互为异位词的子串起始位置。"
image: "https://img.102465.xyz/file/1774701507742_find-all-anagrams-in-a-string-cover.jpg"
tags: ["Leetcode", "Hot 100", "滑动窗口", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 第九篇，来到一道很适合拿来练“**定长滑动窗口 + Counter 比较**”的字符串题：**找到字符串中所有字母异位词**。

这题和前面的“字母异位词分组”算是亲戚，
但这次不是让你分组，
而是让你在一个长字符串 `s` 里，找出所有和 `p` 互为字母异位词的子串起点。

说白了，它在问：

> **在 `s` 里滑动一个长度固定为 `len(p)` 的窗口，哪些窗口里的字符组成，恰好和 `p` 一样？**

## 题目链接

[LeetCode 438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给定两个字符串 `s` 和 `p`，找到 `s` 中所有 `p` 的异位词子串，返回这些子串的起始索引。不考虑答案输出的顺序。

![找到字符串中所有字母异位词题目截图](https://img.102465.xyz/file/1774701507742_find-all-anagrams-in-a-string-cover.jpg)

## 解题思路：定长滑动窗口 + Counter

这题有两个非常明显的信号：

### 1. 要找的是“子串”

子串意味着：

- 必须连续

这通常就很适合滑动窗口。

### 2. 目标串 `p` 的长度固定

异位词要求：

- 用到的字符一样
- 每个字符出现次数也一样

所以如果一个子串想和 `p` 互为异位词，
它的长度就必须和 `p` 一样。

于是窗口长度其实已经被题目钉死了：

> **窗口长度固定为 `len(p)`。**

接下来要做的事就很明确了：

- 用 `Counter(p)` 记录目标串 `p` 的字符频次
- 再维护一个窗口内字符频次的 `Counter`
- 每次让窗口右移一格
- 如果窗口长度超过 `len(p)`，就把左边字符移出去
- 每次窗口长度合适时，比较两个 `Counter` 是否相等
- 相等就说明当前窗口是一个异位词

## 代码实现

```python
from collections import Counter

class Solution(object):
    def findAnagrams(self, s, p):
        """
        :type s: str
        :type p: str
        :rtype: List[int]
        """
        n = len(p)
        m = len(s)
        if m < n:
            return []

        counter = Counter(p)
        p_counter = Counter()
        left = 0
        ans = []

        for right in range(len(s)):
            p_counter[s[right]] += 1

            if right - left + 1 > n:
                p_counter[s[left]] -= 1
                if p_counter[s[left]] == 0:
                    del p_counter[s[left]]
                left += 1

            if p_counter == counter:
                ans.append(left)

        return ans
```

## 代码解析

### 1. 先处理不可能情况

```python
n = len(p)
m = len(s)
if m < n:
    return []
```

如果 `s` 比 `p` 还短，
那连一个长度为 `len(p)` 的窗口都凑不出来，
自然不可能存在异位词子串。

直接返回空列表。

### 2. 记录目标串 `p` 的字符频次

```python
counter = Counter(p)
```

比如：

```python
p = "abc"
```

那么：

```python
counter = {'a': 1, 'b': 1, 'c': 1}
```

这就是我们的目标模板。

后面窗口里的字符频次，只要和它完全一致，
就说明当前窗口和 `p` 是异位词关系。

### 3. 维护当前窗口的字符频次

```python
p_counter = Counter()
left = 0
ans = []
```

这里：

- `p_counter`：记录当前窗口的字符计数
- `left`：窗口左边界
- `ans`：保存所有满足条件的起始下标

### 4. 右指针不断扩张窗口

```python
for right in range(len(s)):
    p_counter[s[right]] += 1
```

每次把 `s[right]` 纳入窗口，
并更新当前窗口的字符计数。

### 5. 保持窗口长度固定为 `n`

```python
if right - left + 1 > n:
    p_counter[s[left]] -= 1
    if p_counter[s[left]] == 0:
        del p_counter[s[left]]
    left += 1
```

这是整题的关键之一。

因为我们只关心长度等于 `len(p)` 的窗口，
所以一旦窗口长度超过 `n`，
就必须把左边字符移出去。

顺序是：

1. 先把左边字符计数减一
2. 如果减到 `0`，把这个键删掉
3. 再移动 `left`

这里你提醒的这个细节非常关键：

> **计数减到 0 时，最好把键删掉。**

因为这样两个 `Counter` 在比较时会更干净。

比如：

```python
Counter({'a': 1, 'b': 0})
```

和：

```python
Counter({'a': 1})
```

虽然从“有效字符频次”角度看它们差不多，
但保留无意义的 `0` 键，会让状态显得不够利索。

删掉之后，窗口计数就保持得更清爽。

### 6. 比较窗口和目标是否一致

```python
if p_counter == counter:
    ans.append(left)
```

如果当前窗口的字符频次，和 `p` 的字符频次完全一样，
那就说明：

- 当前窗口长度等于 `len(p)`
- 字符种类和数量也都一致

所以当前窗口就是一个异位词子串。

把它的起始位置 `left` 记下来即可。

## 示例推演

来看经典样例：

```python
s = "cbaebabacd"
p = "abc"
```

目标频次：

```python
Counter({'a': 1, 'b': 1, 'c': 1})
```

窗口长度固定为 `3`。

### 窗口 `[0:2] = "cba"`

当前窗口计数：

```python
Counter({'c': 1, 'b': 1, 'a': 1})
```

和目标一致，所以记录起点：

```python
0
```

### 窗口继续右移

下一个窗口会依次变成：

- `"bae"`
- `"aeb"`
- `"eba"`
- `"bab"`
- `"aba"`
- `"bac"`
- `"acd"`

其中：

```python
"bac"
```

也是异位词，起始位置是：

```python
6
```

最终答案为：

```python
[0, 6]
```

## 为什么滑动窗口特别适合这题

因为这题的窗口长度是固定的。

这就意味着：

- 每次只需要让右边进一个字符
- 再让左边出一个字符
- 整个窗口平移即可

没必要每次都重新统计整个子串。

滑动窗口的妙处就在这里：

> **旧窗口的结果，不用推倒重来，只做增量更新。**

## 复杂度分析

### 时间复杂度

- `right` 从左到右遍历一次字符串 `s`
- `left` 也只会向右移动

整体是线性的，通常记为：

```python
O(m)
```

其中 `m` 是字符串 `s` 的长度。

如果把比较 `Counter` 的代价也考虑进字符集规模，
更严谨时可以写成和字符集大小相关。

但在一般刷题语境里，常记为：

```python
O(m)
```

### 空间复杂度

窗口计数和目标计数都需要额外哈希表，
所以空间复杂度通常记为：

```python
O(k)
```

其中 `k` 是字符集大小。

## 这种写法的关键点

### 1. 这是“定长窗口”，不是随便伸缩的窗口

窗口大小被 `len(p)` 固定住了。

所以思维重点不是“什么时候缩到合法”，
而是：

> **窗口一旦超长，就立刻把左边弹出去。**

### 2. 比较的是字符频次，不只是字符集合

比如：

- `"abb"`
- `"bab"`

它们是异位词；
但：

- `"ab"`
- `"abb"`

就不是。

所以只看字符种类不够，
必须看每个字符出现了多少次。

### 3. 删掉计数为 0 的键，会让状态更干净

这是你这版代码里很值得强调的细节。

窗口在滑动过程中，
有些字符可能刚好被移空。

这时把键删掉，能让 `Counter` 对比更清爽，
也更符合我们对“当前窗口里有哪些字符”的直觉理解。

## 小结

这题表面是在找异位词，
本质上是在练：

> **如何用一个固定长度的滑动窗口，持续维护字符频次状态。**

你的这版代码核心流程很清楚：

- 先统计 `p`
- 再维护 `s` 中定长窗口的计数
- 每次右扩一格
- 超长就左缩一格
- 比较两个 `Counter`
- 相等就记录答案

如果只记一句话，那就是：

> **窗口定长滑，计数实时改，频次一对上，起点就留下来。**

Hot 100 第九篇，继续推进。
这题不靠蛮力翻全串，靠的是窗口稳稳地滑、计数悄悄地改，等频次一拍即合，答案自然就冒出来了。🦐
