---
title: Leetcode Hot 100 LRU 缓存
published: 2026-04-03
description: "Leetcode Hot 100 设计题经典选手：LRU 缓存。本文先用 Python OrderedDict 快速实现，再用哈希表加手写双向链表拆解标准解法。"
image: "https://img.102465.xyz/file/1775195340330_lru-cache-cover.jpg"
tags: ["Leetcode", "Hot 100", "设计题", "哈希表", "双向链表", "OrderedDict", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 继续刷题，这次轮到缓存界老江湖：**LRU Cache**。

这题的气质很典型：

- 功能不复杂
- 条件很明确
- 但时间复杂度卡得很死

题目要求 `get` 和 `put` 的平均时间复杂度都得是 **O(1)**。

这就意味着：

> **你不能只会查，还得会在 O(1) 时间里调整“谁最近用过、谁最久没用过”。**

所以这题不是单纯字典题，
而是经典组合拳：

- **哈希表**负责快速查找
- **双向链表**负责快速调整顺序

当然，Python 选手有点幸福，`OrderedDict` 可以直接抄近道。
今天这篇就把两种做法一起端上来：

1. `OrderedDict` 快速版
2. 手写双向链表标准版

## 题目链接

[LeetCode 146. LRU 缓存](https://leetcode.cn/problems/lru-cache/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

请你设计并实现一个满足 **LRU（最近最少使用）缓存机制** 的数据结构。

实现 `LRUCache` 类：

- `LRUCache(int capacity)`：以正整数作为容量 `capacity` 初始化 LRU 缓存
- `int get(int key)`：如果关键字 `key` 存在于缓存中，则返回关键字的值，否则返回 `-1`
- `void put(int key, int value)`：如果关键字已经存在，则变更其数据值；如果不存在，则向缓存中插入该组 `key-value`。如果插入操作导致关键字数量超过 `capacity`，则应该逐出 **最近最少使用** 的关键字。

要求：

- `get`
- `put`

都必须是平均 **O(1)** 时间复杂度。

![LRU 缓存题目截图](https://img.102465.xyz/file/1775195340330_lru-cache-cover.jpg)

## 先说结论：为什么普通字典不够用

如果只用普通字典，我们能做到：

- 很快判断 key 在不在
- 很快取值 / 改值

但问题是：

> **LRU 不是只要存值，还要维护“使用顺序”。**

也就是说，每次：

- `get(key)` 成功时，这个 key 要变成“最近使用”
- `put(key, value)` 时，这个 key 也要变成“最近使用”
- 超出容量时，要删掉“最久没被用过”的那个 key

仅靠哈希表，找得到人；
但谁站前排、谁坐冷板凳，它记不住。

所以顺序结构是必须的。

---

## 解法一：`OrderedDict`

Python 自带的 `OrderedDict` 非常适合这题。

它的本质思路可以理解为：

- 字典维护 key 到 value 的映射
- 同时维护元素顺序
- 支持 `move_to_end()`，可以在 O(1) 时间调整位置

于是我们可以规定：

- **最前面**表示最近使用
- **最后面**表示最近最少使用

### 代码实现

```python
from collections import OrderedDict

class LRUCache:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key, last=False)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        self.cache[key] = value
        self.cache.move_to_end(key, last=False)
        if len(self.cache) > self.capacity:
            self.cache.popitem()
```

## `OrderedDict` 做法怎么理解

### 1. `get`

```python
if key not in self.cache:
    return -1
self.cache.move_to_end(key, last=False)
return self.cache[key]
```

如果 key 不存在，直接返回 `-1`。

如果存在：

- 先把它移到开头
- 再返回它的值

因为它刚被访问过，理应升级成“最近使用”。

这里：

```python
move_to_end(key, last=False)
```

表示把该元素移动到**最前面**。

### 2. `put`

```python
self.cache[key] = value
self.cache.move_to_end(key, last=False)
```

无论：

- 是新插入
- 还是更新已有 key

都应该把它当作“最近使用”。

所以统一移到开头。

### 3. 超容量时淘汰谁

```python
if len(self.cache) > self.capacity:
    self.cache.popitem()
```

因为我们规定：

- 前面 = 最近使用
- 后面 = 最久未使用

所以直接删最后一个就行。

这就很像食堂排队：
新打饭的站前面，
最久没被叫号的从后门请出去。🦐

## 解法一复杂度

### 时间复杂度

- `get`：`O(1)`
- `put`：`O(1)`

### 空间复杂度

```python
O(capacity)
```

## 解法一优缺点

### 优点

- 写法短
- 容易过题
- 很适合 Python

### 缺点

- 更像“调用现成能力”
- 如果面试官追问底层实现，就还得回到双向链表 + 哈希表

所以如果是刷题，`OrderedDict` 很香；
如果是讲原理，还是得上标准版。

---

## 解法二：哈希表 + 手写双向链表

这才是 LRU 的经典正解。

核心思路还是两部分：

### 1. 哈希表 `cache`

作用：

- `key -> 对应链表节点`
- 这样就能 O(1) 找到某个 key 的节点

### 2. 双向链表

作用：

- 维护访问顺序
- 支持 O(1) 删除节点
- 支持 O(1) 插入节点

我们约定：

- 靠近 `head` 的节点：最久未使用
- 靠近 `tail` 的节点：最近使用

于是：

- `get` 成功 → 该节点移到尾部
- `put` 更新 / 插入 → 节点移到尾部
- 超容量 → 删除 `head.next`

这就是完整的 LRU 逻辑。

## 为什么必须是双向链表

如果你用单链表，也能维护顺序，
但删除一个节点时会很难受。

因为你得先找到它前一个节点，
而这一步可能退化成 O(n)。

双向链表就舒服多了：

- 每个节点都有 `pre`
- 删除时直接改前后指针
- 插入时直接挂到尾巴

动作干净，复杂度在线。

## 代码实现

```python
class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.val = value
        self.next = None
        self.pre = None

class LRUCache(object):

    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.tail = Node()
        self.head = Node()
        self.head.next = self.tail
        self.tail.pre = self.head 

    def remove_node(self, node):
        last = node.pre
        nxt = node.next
        last.next = nxt
        nxt.pre = last

    def add2tail(self, node):
        last = self.tail.pre
        last.next = node
        node.next = self.tail
        node.pre = last
        self.tail.pre = node

    def get(self, key):
        if key not in self.cache:
            return -1
        self.remove_node(self.cache[key])
        self.add2tail(self.cache[key])
        return self.cache[key].val

    def put(self, key, value):
        if key in self.cache:
            self.cache[key].val = value
            self.remove_node(self.cache[key])
            self.add2tail(self.cache[key])
        else:
            new_node = Node(key=key, value=value)
            self.cache[key] = new_node
            last = self.tail.pre
            last.next = new_node
            new_node.pre = last
            new_node.next = self.tail
            self.tail.pre = new_node
            if len(self.cache) > self.capacity:
                need2del = self.head.next
                nxt = need2del.next
                self.head.next = nxt
                nxt.pre = self.head

                delkey = need2del.key
                del self.cache[delkey]
```

---

## 代码拆解

### 1. 节点结构

```python
class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.val = value
        self.next = None
        self.pre = None
```

每个节点保存：

- `key`
- `value`
- 前驱指针 `pre`
- 后继指针 `next`

这里把 `key` 也存进去非常重要，
因为淘汰节点时，不仅要删链表，
还要顺手从哈希表里把对应 key 删除。

### 2. 哨兵节点

```python
self.head = Node()
self.tail = Node()
self.head.next = self.tail
self.tail.pre = self.head
```

这里用了两个空节点作为**哨兵**。

好处是：

- 插入时不用判断“链表是不是空的”
- 删除时不用单独处理头尾边界

哨兵节点的作用，就是把很多 if-else 都赶走。

代码立刻清爽一截。

### 3. 删除节点

```python
def remove_node(self, node):
    last = node.pre
    nxt = node.next
    last.next = nxt
    nxt.pre = last
```

删除一个节点，本质就是把它的前后节点接起来。

因为是双向链表，这一步不需要遍历，直接 O(1)。

### 4. 把节点放到尾部

```python
def add2tail(self, node):
    last = self.tail.pre
    last.next = node
    node.next = self.tail
    node.pre = last
    self.tail.pre = node
```

尾部表示“最近使用”。

所以每当一个节点刚刚被访问或更新，
都应该被挂到尾巴前面。

### 5. `get`

```python
if key not in self.cache:
    return -1
self.remove_node(self.cache[key])
self.add2tail(self.cache[key])
return self.cache[key].val
```

如果 key 不存在，返回 `-1`。

如果存在：

1. 从原位置摘下来
2. 放到尾部
3. 返回 value

这表示：

> 它刚刚被访问过，现在是最新鲜的缓存成员。

### 6. `put`：key 已存在

```python
if key in self.cache:
    self.cache[key].val = value
    self.remove_node(self.cache[key])
    self.add2tail(self.cache[key])
```

如果 key 已经在缓存里：

- 更新值
- 再移动到尾部

因为更新操作本身也算一次使用。

### 7. `put`：key 不存在

```python
new_node = Node(key=key, value=value)
self.cache[key] = new_node
```

先创建新节点，并加入哈希表。

然后把它插入链表尾部。

你这份代码这里是手动展开写的：

```python
last = self.tail.pre
last.next = new_node
new_node.pre = last
new_node.next = self.tail
self.tail.pre = new_node
```

逻辑没问题。

如果想更统一一点，也可以直接复用：

```python
self.add2tail(new_node)
```

功能完全一样，只是代码更整洁。

### 8. 超容量时淘汰头部节点

```python
if len(self.cache) > self.capacity:
    need2del = self.head.next
```

`head.next` 就是链表里最老的那个节点，
也就是最近最少使用的节点。

删除它后，再从字典里把对应 key 删掉：

```python
delkey = need2del.key
del self.cache[delkey]
```

这样链表和哈希表的数据就同步了。

---

## 这份手写代码有哪些亮点

你这版代码整体是对的，而且已经非常接近标准模板。

亮点主要有三处：

### 1. 哈希表存的是节点，不是值

这是关键中的关键。

如果哈希表只存值，
那你虽然能查到结果，
但没法 O(1) 找到链表里的那个节点位置。

而存节点之后：

- 查节点 O(1)
- 删节点 O(1)
- 挪节点 O(1)

整套闭环就成了。

### 2. 哨兵节点用得对

很多人第一次手写双向链表，
会在空链表、头节点、尾节点上疯狂翻车。

你用了 `head` 和 `tail` 作为哨兵，
这能少掉一堆边界判断，属于正路子。

### 3. `get` / `put` 都会刷新最近使用状态

这点很多人会漏。

LRU 里不只是 `get` 算使用，
`put` 更新已有节点也算使用。

你这版已经处理到了。

---

## 这份代码还能怎么小优化

你这版能过，但有两点可以让代码更工整。

### 优化 1：新增节点时复用 `add2tail`

现在你在 `put` 的 `else` 分支里，
是手动把 `new_node` 挂到尾部。

其实可以写成：

```python
new_node = Node(key=key, value=value)
self.cache[key] = new_node
self.add2tail(new_node)
```

这样链表尾插逻辑就统一了。

### 优化 2：淘汰节点时也复用 `remove_node`

现在你淘汰最旧节点时也是手动改指针。

可以统一成：

```python
need2del = self.head.next
self.remove_node(need2del)
del self.cache[need2del.key]
```

这样代码更像“搭积木”，
模块感更强，不容易写岔。

## 优化后版本

```python
class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.val = value
        self.next = None
        self.pre = None

class LRUCache(object):

    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.pre = self.head

    def remove_node(self, node):
        prev = node.pre
        nxt = node.next
        prev.next = nxt
        nxt.pre = prev

    def add2tail(self, node):
        prev = self.tail.pre
        prev.next = node
        node.pre = prev
        node.next = self.tail
        self.tail.pre = node

    def get(self, key):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self.remove_node(node)
        self.add2tail(node)
        return node.val

    def put(self, key, value):
        if key in self.cache:
            node = self.cache[key]
            node.val = value
            self.remove_node(node)
            self.add2tail(node)
        else:
            node = Node(key, value)
            self.cache[key] = node
            self.add2tail(node)

            if len(self.cache) > self.capacity:
                need2del = self.head.next
                self.remove_node(need2del)
                del self.cache[need2del.key]
```

这版本质和你的一样，
只是更像模板，后面复习也更顺手。

---

## 示例理解一下

假设容量是 `2`：

```python
put(1, 1)
put(2, 2)
get(1)
put(3, 3)
get(2)
```

执行过程：

### 第一步

```python
put(1, 1)
```

缓存：

```text
1
```

### 第二步

```python
put(2, 2)
```

缓存顺序：

```text
1 -> 2
```

其中 `2` 是最近使用。

### 第三步

```python
get(1)
```

访问了 `1`，于是它要变成最近使用：

```text
2 -> 1
```

返回：

```python
1
```

### 第四步

```python
put(3, 3)
```

容量超了，要删掉最久未使用的 `2`：

```text
1 -> 3
```

### 第五步

```python
get(2)
```

因为 `2` 已经被淘汰，所以返回：

```python
-1
```

这就是完整的 LRU 行为。

---

## 两种做法怎么选

### 如果是刷题

优先用：

- `OrderedDict`

理由：

- 代码短
- 不容易写炸
- 一眼能过

### 如果是面试 / 原理题 / 想练数据结构

优先用：

- 哈希表 + 双向链表

因为这是标准实现。

很多时候面试官真正想听的不是“Python 有个容器”，
而是：

> **你知不知道为什么 LRU 必须把“查找”和“顺序维护”拆给两个结构一起做。**

---

## 复杂度分析

无论是 `OrderedDict` 版，还是手写双向链表版：

### 时间复杂度

- `get`：`O(1)`
- `put`：`O(1)`

### 空间复杂度

```python
O(capacity)
```

---

## 小结

这题的核心其实就一句：

> **要想在 O(1) 时间里既能查 key，又能维护最近使用顺序，就得把“查找”和“顺序”分工处理。**

所以标准答案就是：

- 哈希表负责定位节点
- 双向链表负责维护新旧顺序

而 Python 里：

- `OrderedDict` 相当于把这套活打包好了

所以这题非常适合两层理解：

### 第一层：会做

知道 `OrderedDict` 怎么写，能快速过题。

### 第二层：懂原理

知道为什么是哈希表 + 双向链表，
知道为什么必须 O(1) 删除和插入节点。

这题不算最难，
但很经典。
属于那种面试官看见你写顺了，
会默默觉得：

> 嗯，这人缓存这块，不是光会嘴炮。🦐
