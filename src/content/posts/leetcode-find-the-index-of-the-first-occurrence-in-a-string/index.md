---
title: LeetCode 28 找出字符串中第一个匹配项的下标
published: 2026-04-13
description: "一道表面简单、实则把 KMP 请上桌的字符串匹配题。本文记录暴力解法与 KMP 模板，并把 next 数组的核心逻辑拆成人话。"
image: "https://img.102465.xyz/file/1776052867887_cover.jpg"
tags: ["Leetcode", "字符串", "KMP", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

这题的名字很朴素，内容也很朴素：

> 在 `haystack` 中找到 `needle` 第一次出现的位置。

但它的题解区一点都不朴素。
明明是道简单题，结果一抬头，满屏都是 KMP，仿佛你不是来做题，是来参加字符串宗门入门考核。

说句实在话：**这题用暴力匹配就能过。**
KMP 当然能做，而且很强，但这题最让人发怵的，不是题目本身，而是 KMP 模板自带的压迫感。

## 题目链接

[LeetCode 28. 找出字符串中第一个匹配项的下标](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/description/)

## 题目描述

给你两个字符串 `haystack` 和 `needle`，请你在 `haystack` 字符串中找出 `needle` 字符串的第一个匹配项的下标。
如果 `needle` 不是 `haystack` 的一部分，则返回 `-1`。

![题目截图](https://img.102465.xyz/file/1776052867887_cover.jpg)

## 解法一：暴力匹配

这题最符合“简单题身份”的做法，其实就是暴力匹配。

思路非常直接：

- 枚举 `haystack` 中每一个可能作为起点的位置
- 从这个位置开始，逐个字符和 `needle` 对比
- 如果整个 `needle` 都匹配上了，就返回当前起点
- 如果试完所有起点还没匹配成功，就返回 `-1`

### 代码实现

```python
class Solution(object):
    def strStr(self, haystack, needle):
        n, m = len(haystack), len(needle)

        for i in range(n - m + 1):
            j = 0
            while j < m and haystack[i + j] == needle[j]:
                j += 1
            if j == m:
                return i
        return -1
```

### 思路解析

比如：

```python
haystack = "sadbutsad"
needle = "sad"
```

从 `i = 0` 开始匹配：

- `haystack[0] == needle[0]`
- `haystack[1] == needle[1]`
- `haystack[2] == needle[2]`

全部匹配成功，所以直接返回 `0`。

如果某个位置中途不相等，就说明这个起点不行，换下一个起点继续试。

### 复杂度分析

- **时间复杂度：** 最坏情况下是 `O(n * m)`
- **空间复杂度：** `O(1)`

这复杂度看着不够优雅，但在这题的数据范围下完全够用。
所以要是你第一次刷到这题，直接写暴力，没毛病。

## 解法二：KMP 算法

如果想把这题优化到线性时间复杂度，就要请出字符串匹配界的老演员：**KMP**。

KMP 的核心思想就一句话：

> **匹配失败时，不要把模式串完全挪回起点，而是利用已经匹配过的信息，跳到一个合理的位置继续匹配。**

它的关键在于先构造一个 `next` 数组。

## `next` 数组是什么

`next[i]` 表示：

> 在 `needle[0:i+1]` 这个子串中，
> **最长相等前缀和后缀的长度**。

听起来有点绕，翻译成人话就是：

- 看当前这一段字符串
- 前面和后面有没有一截长得一样
- 如果有，最长有多长

比如：

```python
needle = "aabaa"
```

对应的 `next` 数组是：

```python
[0, 1, 0, 1, 2]
```

其中：

- `next[0] = 0`：只有一个字符，不可能有相等前后缀
- `next[1] = 1`：`"aa"` 的前缀 `"a"` 和后缀 `"a"` 相同
- `next[4] = 2`：`"aabaa"` 的最长相等前后缀是 `"aa"`

这个数组的作用，就是让我们在失配时知道：

> 之前已经匹配成功的那一段里，有多少字符可以不用重头再比。

## 为什么 `getNext` 从 1 开始遍历

因为：

- `next[0]` 一定是 `0`
- 单个字符不可能同时有“真前缀”和“真后缀”相等

所以构造 `next` 时，从下标 `1` 开始就行：

```python
for i in range(1, n):
```

这个点很容易记：

> **第 0 位不用算，从第 1 位开抡。**

## KMP 模板代码

```python
class Solution(object):
    def getNext(self, needle):
        n = len(needle)
        nextLs = [0] * n
        j = 0
        for i in range(1, n):
            while j > 0 and needle[j] != needle[i]:
                j = nextLs[j - 1]
            if needle[j] == needle[i]:
                j += 1
            nextLs[i] = j
        return nextLs

    def strStr(self, haystack, needle):
        """
        :type haystack: str
        :type needle: str
        :rtype: int
        """
        nextLs = self.getNext(needle)
        n, m = len(haystack), len(needle)
        j = 0
        for i in range(n):
            while j > 0 and haystack[i] != needle[j]:
                j = nextLs[j - 1]
            if haystack[i] == needle[j]:
                j += 1
            if j == m:
                return i - m + 1
        return -1
```

## 这两段 while + if，其实是同一个灵魂

KMP 最容易让人看晕的，就是下面这段：

```python
while j > 0 and needle[j] != needle[i]:
    j = nextLs[j - 1]
if needle[j] == needle[i]:
    j += 1
nextLs[i] = j
```

以及匹配主串时这段：

```python
while j > 0 and haystack[i] != needle[j]:
    j = nextLs[j - 1]
if haystack[i] == needle[j]:
    j += 1
```

表面看是在两个地方写了两套逻辑，实际上它们是一回事。

### 在 `getNext()` 里

是在拿：

- `needle[i]`
- 和 `needle[j]`

做比较。

本质上是：

> **模式串自己和自己匹配，看看最长相等前后缀能延续到哪里。**

### 在 `strStr()` 里

是在拿：

- `haystack[i]`
- 和 `needle[j]`

做比较。

本质上是：

> **主串和模式串匹配，看看当前已经匹配到模式串的哪里。**

所以你完全可以把 KMP 理解成：

> **同一套推进逻辑，写了两遍。**
>
> 一遍用来生成 `next`，一遍用来正式匹配。

## `j = nextLs[j - 1]` 到底在干嘛

这是 KMP 的核心动作。

假设当前已经匹配了 `j` 个字符，结果下一个字符失配了。
如果用暴力法，就只能把模式串整个往后挪一位，从头再来。

但 KMP 会说：

> 等一下，前面这段已经匹配成功的内容，可能有一部分前后缀是重合的。
> 既然重合，那就没必要从头再比。

于是直接：

```python
j = nextLs[j - 1]
```

意思就是：

> 把 `j` 回退到“上一段可复用的最长相等前后缀长度”那里，再继续试。

这一步不是重开，而是复活点续关。

## 复杂度分析

- **时间复杂度：** `O(n + m)`
- **空间复杂度：** `O(m)`

为什么能做到线性时间？
因为主串指针 `i` 不会回头，模式串指针 `j` 虽然会回退，但每次回退都不是白退，整体回退次数也是有限的。

## 这题到底难不难

我的评价是：

- **按题目要求看：简单题**
- **按 KMP 解法看：不简单**
- **按第一次学 KMP 时的精神压力看：能把人看出字符串 PTSD**

所以你觉得它不像简单题，这种直觉一点都不离谱。
不是题目在演你，是 KMP 在给你上强度。

## 两种解法怎么选

如果只是为了通过这题：

- 直接写 **暴力匹配** 就够了
- 简单直接，还符合题目定位

如果是为了学字符串专题：

- 就顺便把 **KMP 模板** 啃下来
- 以后碰到模式匹配类题目会很有用

## 小结

这题最值得记住的，不是“必须用 KMP”，而是：

1. **这题暴力就能过，不必一上来就自我加压**
2. `getNext()` 和正式匹配那段代码，本质上是同一套逻辑
3. `next` 数组的作用，就是让失配时不用从头开始

如果只留一句压轴总结，那就是：

> **题目是简单题，KMP 不是。**
>
> 这题像小绵羊，题解像藏獒。

刷题路上别被它的题解阵仗吓住。
先会暴力，再学 KMP，节奏就对了。🦐
