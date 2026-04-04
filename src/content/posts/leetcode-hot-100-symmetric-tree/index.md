---
title: Leetcode Hot 100 对称二叉树
published: 2026-04-04
description: "Leetcode Hot 100 二叉树板块经典题：对称二叉树。本文用递归拆解如何判断一棵二叉树是否关于中心轴镜像对称。"
image: "https://img.102465.xyz/file/1775284067216_symmetric-tree-cover.jpg"
tags: ["Leetcode", "Hot 100", "二叉树", "递归", "算法"]
category: "Algorithm"
draft: false
lang: ""
---

Leetcode Hot 100 继续推进，这一题轮到二叉树里的“照镜子选手”：**对称二叉树**。

它问得很直白：

> 给你一棵二叉树，判断它是不是轴对称。

翻成人话就是：

- 左边看过去
- 和右边照镜子看回来
- 得长得一模一样

这题不靠花活，核心就是四个字：**镜像比较**。

## 题目链接

[LeetCode 101. 对称二叉树](https://leetcode.cn/problems/symmetric-tree/?envType=study-plan-v2&envId=top-100-liked)

## 题目描述

给你一个二叉树的根节点 `root`，检查它是否轴对称。

![对称二叉树题目截图](https://img.102465.xyz/file/1775284067216_symmetric-tree-cover.jpg)

## 解题思路：递归判断两棵树是否互为镜像

这题表面是在问“一棵树是否对称”，
其实更适合改写成另一个问题：

> **左子树和右子树，是否互为镜像？**

只要这个问题成立，整棵树就是对称的。

于是我们定义一个递归函数：

```python
dfs(q, p)
```

表示判断节点 `q` 和节点 `p` 这两棵子树，是否互为镜像。

## 镜像比较的规则

想判断两棵树是不是镜像，得同时满足下面几条：

### 1. 两个节点都为空

那当然对称。

### 2. 一个为空，一个不为空

那肯定不对称。

### 3. 两个节点值不同

也不对称。

### 4. 两个节点值相同，还要继续比较它们的孩子

注意这里不是“左对左、右对右”，
而是镜像关系，所以要交叉比较：

- `q.left` 和 `p.right`
- `q.right` 和 `p.left`

也就是说：

> **外侧对外侧，内侧对内侧。**

这才是真正的镜子逻辑。

## 代码实现

```python
class Solution(object):
    def isSymmetric(self, root):
        """
        :type root: Optional[TreeNode]
        :rtype: bool
        """
        def dfs(q, p):
            if q is None or p is None:
                return p is q
            if q.val != p.val:
                return False
            return dfs(q.right, p.left) and dfs(q.left, p.right)

        if root is None:
            return True
        return dfs(root.left, root.right)
```

## 代码解析

### 1. 空节点怎么处理

```python
if q is None or p is None:
    return p is q
```

这句写得很精炼。

它表示：

- 如果 `q` 和 `p` 中有一个为空
- 那么只有在 **两个都为空** 的情况下才返回 `True`

换句话说：

- `None` 对 `None`，算对称
- `None` 对 非空节点，直接淘汰

### 2. 节点值不同，立刻返回 `False`

```python
if q.val != p.val:
    return False
```

镜像不只是结构要对，数值也得对上。

如果当前这两个节点值都不一样，
那后面孩子再努力也救不回来，直接结束。

### 3. 递归比较左右子树的镜像位置

```python
return dfs(q.right, p.left) and dfs(q.left, p.right)
```

这是整题的灵魂。

很多人第一次写这题，容易顺手写成：

```python
dfs(q.left, p.left) and dfs(q.right, p.right)
```

但那样比较的是“是否相同”，
不是“是否镜像”。

镜像必须交叉着看：

- 左树的左边，要对右树的右边
- 左树的右边，要对右树的左边

代码里写成哪个在前其实都行，
关键是这两个配对必须交叉。

### 4. 为什么从 `root.left` 和 `root.right` 开始

```python
return dfs(root.left, root.right)
```

因为整棵树是否对称，
本质就是看根节点的左右两棵子树是不是互为镜像。

如果根节点本身就是空树：

```python
if root is None:
    return True
```

空树也算对称，这个别漏。

## 示例理解

比如这棵树：

```text
    1
   / \
  2   2
 / \ / \
3  4 4  3
```

它是对称的。

因为：

- 左边的 `2` 对右边的 `2`
- 左边的 `3` 对右边的 `3`
- 左边的 `4` 对右边的 `4`

而且位置也完全是镜像关系。

但如果是下面这样：

```text
    1
   / \
  2   2
   \   \
   3    3
```

它就不是对称的。

虽然两边都有 `3`，
但位置不对：

- 左边的 `3` 在右孩子位置
- 右边的 `3` 也在右孩子位置

这不是镜像，是“同向站队”，所以不行。

## 复杂度分析

### 时间复杂度

每个节点最多访问一次，所以时间复杂度是：

```python
O(n)
```

其中 `n` 是二叉树节点总数。

### 空间复杂度

递归调用会使用系统栈，空间复杂度取决于树高：

```python
O(h)
```

其中 `h` 是二叉树高度。

- 平衡树情况下约为 `O(log n)`
- 极端退化成链表时，最坏为 `O(n)`

## 易错点总结

### 1. 把镜像比较写成了相同结构比较

错法很常见：

```python
dfs(q.left, p.left) and dfs(q.right, p.right)
```

这不是镜像比较，这是“同步对账”。

真正要写的是：

```python
dfs(q.left, p.right) and dfs(q.right, p.left)
```

### 2. 空节点判断没写全

如果只判断：

```python
if q is None and p is None:
    return True
```

那还不够。

因为还要处理“一个空、一个不空”的情况。

你现在这句：

```python
if q is None or p is None:
    return p is q
```

写法很利索，属于短小精悍型。

### 3. 忘记处理空树

```python
if root is None:
    return True
```

空树也是对称树，别让它在门口被错杀。

## 小结

这题的核心其实就一句：

> **判断一棵树是否对称，就是判断它的左子树和右子树是否互为镜像。**

而镜像判断的关键，就是交叉递归比较：

- 左对右
- 右对左

写熟之后，这类“二叉树结构比较题”会顺很多。

这题不难，但很经典，属于面试里那种看着温柔、其实专查你递归基本功的题。
镜子一摆，左右一比，代码要稳，手别抖。🦐
