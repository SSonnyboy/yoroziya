---
title: Leetcode Hot 100 实现 Trie（前缀树）
published: 2026-04-09
description: "Leetcode Hot 100 字典树模板题：实现 Trie（前缀树）。本文整理节点设计、插入、查找、前缀判断三步走，顺手讲清楚 search 和 startsWith 的区别。"
image: "https://img.102465.xyz/file/1775721762648_trie-cover.jpg"
tags: ["Leetcode", "Hot 100", "Trie", "前缀树", "字符串", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 刷到这里，终于见到了这位字符串圈的老熟人：**Trie（前缀树）**。

这题本身不算难，甚至可以说有点“模板味”。
但它很适合拿来把 Trie 的骨架一次搭明白：

- 节点里到底存什么
- 插入单词时怎么一路往下走
- 查完整单词和查前缀，差别到底在哪

一句话先点题：

> **Trie 的核心不是存整个单词，而是按字符一层一层地存路径。**

## 题目链接

[LeetCode 208. 实现 Trie（前缀树）](https://leetcode.cn/problems/implement-trie-prefix-tree/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

请你实现 Trie 类，支持以下操作：

- `insert(word)`：向前缀树中插入字符串 `word`
- `search(word)`：如果字符串 `word` 在前缀树中，返回 `true`
- `startsWith(prefix)`：如果之前已经插入的字符串 `word` 的前缀之一为 `prefix`，返回 `true`

![实现 Trie（前缀树）题目截图](https://img.102465.xyz/file/1775721762648_trie-cover.jpg)

## 解题思路：设计 TrieNode 节点

Trie 本质上是一棵专门存字符串的树。

和普通二叉树不同，它不是每个节点只连左右两个孩子，
而是：

> **每个节点都可以根据不同字符，连向不同的子节点。**

所以一个节点最少需要维护两样东西：

### 1. `children`

用于记录当前节点有哪些子节点。

这里可以直接用字典：

```python
self.children = {}
```

含义就是：

- key：字符
- value：对应的下一个 TrieNode

比如当前节点后面可以接 `a`、`b`、`c`，
那它的 `children` 里就可能长这样：

```python
{
    'a': TrieNode(),
    'b': TrieNode(),
    'c': TrieNode()
}
```

### 2. `is_end`

用于标记：

> **当前节点是不是某个单词的结尾。**

这个布尔值非常关键。
因为前缀树里“路径存在”不等于“完整单词存在”。

比如我们插入了 `apple`：

- `a -> p -> p -> l -> e` 这条路径存在
- 但 `app` 是否算一个单词，要看第二个 `p` 对应节点的 `is_end` 是否为 `True`

所以节点定义如下：

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False
```

## Trie 类整体实现

有了节点之后，Trie 本体就简单了。

我们只需要维护一个根节点 `root`，后续所有操作都从根开始往下走。

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False


class Trie:

    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        cur = self.root
        for ch in word:
            if ch not in cur.children:
                cur.children[ch] = TrieNode()
            cur = cur.children[ch]
        cur.is_end = True

    def search(self, word: str) -> bool:
        cur = self.root
        for ch in word:
            if ch not in cur.children:
                return False
            cur = cur.children[ch]
        return cur.is_end

    def startsWith(self, prefix: str) -> bool:
        cur = self.root
        for ch in prefix:
            if ch not in cur.children:
                return False
            cur = cur.children[ch]
        return True
```

下面把三个操作拆开说。

## 1. 插入操作 `insert(word)`

插入一个单词时，我们从根节点出发，逐个处理字符。

如果当前字符对应的子节点不存在，就创建；
如果已经存在，就沿着已有路径继续往下走。

最后走到单词末尾时，把当前节点标记成单词结尾：

```python
cur.is_end = True
```

### 举个例子

插入 `apple` 时，路径会这样生长：

```text
root
 └── a
      └── p
           └── p
                └── l
                     └── e
```

然后在 `e` 对应的节点上打一个结束标记。

这一步的关键就一句话：

> **边走边建路，走到头了插旗。**

## 2. 查找完整单词 `search(word)`

查找时也是从根节点开始，逐个字符往下找。

### 如果中途某个字符不存在

说明这条路径压根没建出来，直接返回 `False`。

### 如果所有字符都存在

这时还不能立刻返回 `True`，
因为：

> **路径存在，只说明它是某个单词的前缀；不一定说明它本身就是单词。**

所以最后必须判断：

```python
return cur.is_end
```

### 为什么一定要看 `is_end`

比如插入了：

```python
apple
```

那么：

- `search("apple")` 应该返回 `True`
- `search("app")` 不一定返回 `True`

除非你之前真的插入过 `app`。

所以 `search` 查的是：

> **完整单词是否存在。**

不是“这条路是不是能走通”。

## 3. 判断前缀 `startsWith(prefix)`

这一步和 `search` 非常像，
区别只在最后一句。

对于前缀判断来说，只要这条路径存在，就够了。

也就是说：

- 只要每个字符都能往下找到
- 就说明存在某个单词以这个前缀开头

因此不用再判断 `is_end`，直接返回 `True`。

## `search` 和 `startsWith` 的区别

这题最值得记住的，其实就是这对兄弟的区别。

| 操作 | 要求 |
| --- | --- |
| `search(word)` | 路径存在，并且最后节点是单词结尾 |
| `startsWith(prefix)` | 只要路径存在即可 |

可以粗暴记成：

> **`search` 要验明正身，`startsWith` 只看你是不是路过。**

## 复杂度分析

设字符串长度为 `n`。

### 时间复杂度

- `insert(word)`：`O(n)`
- `search(word)`：`O(n)`
- `startsWith(prefix)`：`O(n)`

因为三种操作本质上都是沿着字符串走一遍。

### 空间复杂度

- 单次操作的额外空间复杂度可以视为 `O(1)`（不算新建节点时的存储）
- 整棵 Trie 的总空间复杂度为 `O(S)`

其中 `S` 是所有插入字符串的总长度。

毕竟字符存得越多，树就长得越大，这很合理，没毛病。

## 这题的关键点

虽然代码不长，但有两个地方最容易写偏：

### 1. 节点结构必须设计完整

不能只存子节点，还要存 `is_end`。

没有它，你就分不清：

- 一个完整单词
- 一个只是路过的前缀

### 2. `search` 和 `startsWith` 不能写成一样

如果你把 `search` 也写成“路径存在就返回 `True`”，
那 `app` 会被误判成存在于只插入了 `apple` 的 Trie 中。

这就是经典翻车点。

## 小结

这道题是标准 Trie 入门题，重点不在花活，而在把结构搭稳。

整个实现抓住三件事就行：

- 节点里要有 `children`
- 节点里要有 `is_end`
- `search` 和 `startsWith` 的判断标准不一样

如果只记一句话，那就是：

> **Trie 按字符存路径，`search` 看结尾，`startsWith` 看路径。**

模板题别嫌简单，简单题写扎实，后面遇到单词搜索、前缀统计、字典树剪枝，才不会一脸懵。

继续刷，树还很多，路也还长，但这棵前缀树，今天算是栽稳了。🦐
