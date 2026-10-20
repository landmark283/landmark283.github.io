---
date: 2026-09-15
slug: git-guide
tags: 工具
summary: 从安装配置到分支、回退、.gitignore，写给刚开始用 Git 管学习资料和习题代码的人。
---

# Git 使用说明 —— 大学生编程学习版

> 适用于：上传学习资料、习题代码到 GitHub，管理编程学习过程中的版本变更

---

## 目录

1. [什么是 Git？](#1-什么是-git)
2. [安装与配置](#2-安装与配置)
3. [创建仓库](#3-创建仓库)
4. [基础操作 —— 日常三连](#4-基础操作--日常三连)
5. [远程仓库 —— 连接 GitHub](#5-远程仓库--连接-github)
6. [分支管理](#6-分支管理)
7. [忽略文件（.gitignore）](#7-忽略文件gitignore)
8. [查看历史与回退](#8-查看历史与回退)
9. [学习场景实战流程](#9-学习场景实战流程)
10. [常见问题与技巧](#10-常见问题与技巧)

---

## 1. 什么是 Git？

**Git** 是一个**版本控制系统**，就像编程的"后悔药"和"时光机"：

- 📸 **拍照存档**：每次修改代码都可以"拍照"（提交/commit），随时回到任意历史版本
- 🌿 **分支实验**：可以开"平行宇宙"（分支/branch）尝试新想法，不影响主版本
- ☁️ **云端备份**：通过 GitHub 把代码存到云端，换电脑也能继续写

### 核心概念先了解

| 概念       | 通俗理解          | 命令           |
| -------- | ------------- | ------------ |
| **工作区**  | 你正在编辑的文件夹     | —            |
| **暂存区**  | 待提交的"候车室"     | `git add`    |
| **本地仓库** | 已经存档的历史记录     | `git commit` |
| **远程仓库** | GitHub 上的云端备份 | `git push`   |

---

## 2. 安装与配置

### 2.1 安装 Git

- **Windows**：从 [git-scm.com](https://git-scm.com) 下载安装包，一路默认即可
- **macOS**：终端执行 `brew install git` 或安装 Xcode Command Line Tools
- **Linux**：`sudo apt install git`（Debian/Ubuntu）或 `sudo dnf install git`（Fedora）

安装后打开终端（Windows 上叫 Git Bash 或 PowerShell），验证：

```bash
git --version
# 输出类似：git version 2.40.0
```

### 2.2 配置用户名和邮箱

**这是第一次使用 Git 必做的配置**——每次提交都会记录你是谁。

```bash
git config --global user.name "你的 GitHub 用户名"
git config --global user.email "你的 GitHub 邮箱"
```

配置 SSH（推荐，免密码推送）：

```bash
ssh-keygen -t ed25519 -C "你的邮箱"
# 一路回车，生成密钥
cat ~/.ssh/id_ed25519.pub
# 复制输出的内容
```

复制后去 GitHub → Settings → SSH and GPG keys → New SSH key，粘贴保存。

---

## 3. 创建仓库

### 方式一：从零开始（本地新建）

```bash
# 进入你的学习资料文件夹
cd D:\lg\note

# 初始化 Git 仓库
git init
```

### 方式二：从 GitHub 克隆已有仓库

```bash
git clone git@github.com:你的用户名/仓库名.git
```

---

## 4. 基础操作 —— 日常三连

这是你**每次写完代码后**的常规操作：

```bash
# 第一步：查看当前状态（养成习惯）
git status

# 第二步：把改动加入暂存区
# 添加所有文件（常用）
git add .
# 或只添加特定文件
git add 文件名.py
git add 文件名.md

# 第三步：提交，记录这次改动
git commit -m "简要说明改了什么"
```

### commit message 写法建议

| 类型  | 示例                  |
| --- | ------------------- |
| 新增  | `feat: 完成第三章习题`     |
| 修复  | `fix: 修改冒泡排序索引越界`   |
| 学习  | `learn: 笔记-数组与链表对比` |
| 作业  | `hw: 数据结构作业-栈的实现`   |

---

## 5. 远程仓库 —— 连接 GitHub

### 5.1 在 GitHub 上创建空仓库

1. 登录 GitHub，点击右上角 `+` → **New repository**
2. 填写仓库名（如 `learning-notes`）
3. 选 **Public**（公开）或 **Private**（私有）
4. **不要勾选** README、.gitignore（你已经有了）
5. 点击 **Create repository**

### 5.2 关联远程仓库并推送

```bash
# 关联远程仓库（SSH 方式）
git remote add origin git@github.com:你的用户名/仓库名.git

# 推送代码到 GitHub
git push -u origin main
```

> `-u` 的意思是建立追踪关系，之后只需 `git push` 即可。

### 5.3 日常推送流程

```bash
git add .
git commit -m "feat: 完成今日编程练习"
git push
```

---

## 6. 分支管理

### 为什么要用分支？

你的主分支（`main`）保持"稳定可运行"，新想法在分支上开发：

```bash
# 查看当前分支
git branch

# 创建并切换到新分支
git checkout -b 实验-链表优化

# 切换回主分支
git checkout main

# 合并分支（把实验成果合并到主分支）
git merge 实验-链表优化

# 删除已完成的分支
git branch -d 实验-链表优化
```

### 学习场景：分支应用

```
main ──A────B────D────E──→  (稳定版本)
         ↘              ↙
          C────C2────C3     (实验新写法 / 重写某个模块)
```

- 在 `main` 上写通过的习题
- 有重构想法时切分支尝试
- 搞砸了？删分支回到 `main`，毫无影响 ✅

---

## 7. 忽略文件（.gitignore）

有些文件不需要传到 GitHub（编译产物、临时文件、隐私配置）：

在仓库根目录创建 `.gitignore` 文件：

```
# 编译产物
*.exe
*.o
*.class
__pycache__/

# IDE 配置
.vscode/
.idea/

# 系统文件
.DS_Store
Thumbs.db

# 隐私
.env
*.env.local
```

---

## 8. 查看历史与回退

```bash
# 查看提交历史
git log
git log --oneline    # 简洁版
git log --graph      # 图形化查看分支

# 查看某次改了什么
git show 提交ID前几位

# 回到上一个版本（--soft 保留改动，--hard 丢弃改动）
git reset --soft HEAD~1     # 撤销最近一次commit，但保留代码改动
git reset --hard HEAD~1     # 撤销最近一次commit，也丢弃改动

# 如果你 push 了想撤回：
git revert HEAD            # 安全撤销：生成一个新提交"反做"上一次
```

---

## 9. 学习场景实战流程

### 场景：第一次上传学习资料

```bash
# 1. 在你的学习文件夹初始化
cd D:\lg\note
git init

# 2. 配置（如果还没配过）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 3. 创建 .gitignore
echo "*.log" >> .gitignore
echo ".vscode/" >> .gitignore

# 4. 添加并提交
git add .
git commit -m "init: 初始化学习笔记仓库"

# 5. GitHub 上建好空仓库后关联
git remote add origin git@github.com:你的用户名/learning-notes.git
git push -u origin main
```

### 场景：日常写习题

```bash
# 开始新任务前先同步
git pull

# 写代码... 写完：
git status                          # 看看改了哪些
git diff                             # 看看具体改了什么
git add .
git commit -m "hw: 完成动态规划习题3道"
git push
```

### 场景：文件夹分类建议

```
D:\lg\note/
├── 笔记/              # 课程笔记 (Markdown)
├── C语言/             # C语言习题代码
├── Python/            # Python练习
├── 数据结构/           # 数据结构实现
└── 项目/              # 大作业/小项目
```

你可以每个大科目建一个 GitHub 仓库，也可以都放在一个仓库的不同文件夹里——建议**按科目分仓库**，每个仓库独立版本管理。

---

## 10. 常见问题与技巧

### ❓ push 时要求输入密码？

→ 你还没配置 SSH。按上面 [2.2 节](#22-配置用户名和邮箱) 配置 SSH 即可。

### ❓ 不小心提交了敏感信息？

```bash
git rm --cached 敏感文件
# 然后在 .gitignore 里加上它
```

### ❓ 想把多个 commit 合并成一个？

```bash
git rebase -i HEAD~3   # 合并最近3个commit
```

### ❓ 想放弃所有未提交的改动？

```bash
git checkout -- .
```

### ✅ 养成好习惯

1. **勤 commit** —— 完成一个小功能就 commit，方便回退
2. **写清楚 message** —— 一个月后看 `git log` 就知道当时改了啥
3. **push 前先 pull** —— 防止多人协作时冲突（自己一个仓库也建议养成习惯）
4. **不要 push 编译产物** —— 用 `.gitignore` 挡掉

---

## 11.submodule子模块

当项目当中还使用了其他项目的代码的时候，我们不应该把所有的代码全部用一个仓库来管理。最简单的操作是直接忽略其他项目代码和依赖的代码，但是如果我们修改了依赖的代码，要怎样才能让别人也知道我们修改了哪些依赖呢？

在这种场景下就可以使用子模块来解决问题了：子模块会跟踪一个仓库，并且记录这个仓库的git 哈希标记，别人git clone了你的代码之后，再执行

```git
git submodule update --init --recursive
```

就可以自动拉取所有需要的子仓库了，并且拉取的版本是正确的。

普通的嵌套 Git 仓库（gitlink）存在一个问题：主仓库只记录了子仓库的某个 commit ID，但**不知道它的 URL 地址**。其他人克隆主仓库时，子仓库文件夹是空的，无法获取内容[](https://stackoverflow.com/feeds/question/54897439#1)。

而 Submodule 会在主仓库根目录生成一个 `.gitmodules` 文件，里面记录了每个子仓库的**路径和 URL**，这样就能实现自动拉取[](https://github.com/liyijuan/gitSubModule#1)[](https://guosy.blog.csdn.net/article/details/148177054)。

### 关键配置步骤

#### 1. 正确添加子仓库

在主仓库根目录执行：

```bash
git submodule add <子仓库的URL> <存放路径>
```

例如：

```bash
git submodule add https://github.com/user/libfoo.git libs/libfoo
```

执行后会产生两个变化[](https://github.com/liyijuan/gitSubModule#1)：

- 在 `libs/libfoo` 目录下拉取子仓库的代码

- 在根目录生成 `.gitmodules` 文件，记录路径和 URL

提交并推送主仓库，让子模块配置生效。

#### 2. 提供“一键安装”的命令

针对你的需求，有两种使用场景：

**场景 A：用户首次克隆主仓库（一键获得所有代码）**

直接让用户使用 `--recurse-submodules` 参数，Git 会自动递归拉取所有子模块[](https://coreui.io/answers/how-to-clone-repository-with-submodules-in-git/)[](https://cloud.tencent.com.cn/developer/article/2143377?from=15425#1#1)：

```bash
git clone --recurse-submodules <主仓库URL>
```

**场景 B：用户已经克隆了主仓库，但子仓库是空的**

提供以下命令给用户，在主仓库根目录执行即可补全所有子仓库[](https://coreui.io/answers/how-to-clone-repository-with-submodules-in-git/)[](https://guosy.blog.csdn.net/article/details/148177054)：

```bash
git submodule update --init --recursive
```

这个命令的作用是：初始化 `.gitmodules` 中定义的子模块，然后递归拉取所有嵌套的子模块。

---

# Git Worktree 使用总结

## 一、核心概念

Git Worktree 让你在**同一个仓库**上拥有**多个工作目录**，每个目录检出不同的分支。

- **共享**：`.git` 对象库、分支引用、提交历史（只有一份）

- **独立**：各工作区文件、暂存区、HEAD 位置

不是物理复制项目，只是多检出几份工作区文件。

---

## 二、基本命令

### 创建 worktree

```bash
# 创建新分支并检出

git worktree add ../project-agent1 -b agent1/feature

# 检出已存在的分支

git worktree add ../project-agent2 agent2/existing-branch

# 基于某次提交创建（detached HEAD，常用于只读查看）

git worktree add ../project-review HEAD~3

# 从远程分支创建并跟踪

git worktree add ../project-fix origin/fix-branch
```

### 查看

```bash
git worktree list

# 输出：

# /code/myproject          abc1234 [main]

# /code/myproject-agent1   def5678 [agent1/feature]

# /code/myproject-agent2   ghi9012 [agent2/fix]
```

### 删除

```bash
# 规范删除（要求工作区干净）

git worktree remove ../project-agent1

# 强制删除（有未提交改动时）

git worktree remove --force ../project-agent1

# 目录已被手动 rm，清理残留元数据

git worktree prune
```

### 移动

```bash
git worktree move ../old-path ../new-path
```

---

## 三、日常工作流

```bash
# 1. 主仓库创建 worktree

cd /code/myproject
git worktree add ../myproject-agent1 -b agent1/feature
git worktree add ../myproject-agent2 -b agent2/fix

# 2. 在各 worktree 里独立开发

cd ../myproject-agent1

# ... 编辑、测试、提交 ...

git add .
git commit -m "feature done"
cd ../myproject-agent2

# ... 编辑、测试、提交 ...

git commit -am "fix done"

# 3. 回到主仓库合并

cd /code/myproject
git merge agent1/feature
git merge agent2/fix

# 4. 清理

git worktree remove ../myproject-agent1
git worktree remove ../myproject-agent2
```

---

## 四、共享与隔离对照表

| 内容         | 共享？ | 说明                             |
| ---------- | --- | ------------------------------ |
| `.git` 对象库 | ✅   | 只有一份，提交立即可见                    |
| 分支引用       | ✅   | 一份，所有 worktree 看到相同分支列表        |
| 提交历史       | ✅   | 在主仓库可 `git log agent1/feature` |
| 工作区文件      | ❌   | 各一份，互不影响                       |
| 暂存区 index  | ❌   | 各自独立                           |
| HEAD       | ❌   | 各指向自己检出的分支                     |
| 远程操作       | ✅   | push/fetch 影响同一仓库              |

---

## 五、关键规则与坑

**1. 同一分支不能在两个 worktree 同时检出**

```bash
fatal: 'main' is already checked out at '/code/myproject'
```

每个 worktree 必须对应不同分支（或 detached HEAD）。

**2. 提交不会自动同步到其他工作区文件**

Agent 提交后，主工作区文件**不变**。要看到改动必须 `merge` 或 `checkout`。

- 能查历史：`git log agent1/feature`、`git diff main agent1/feature`

- 要改文件：`git merge agent1/feature` 或 `git checkout agent1/feature`

**3. 未提交的改动不会跨 worktree 可见**

共享的是已提交对象，不是工作区实时状态。合并前必须先 commit。

**4. 删除 worktree 不会丢提交**

分支和提交留在共享数据库里，可随时重新检出或合并。

**5. 别用 `rm -rf` 删 worktree 目录**

会留下元数据垃圾，虽可用 `git worktree prune` 清理，但不如规范操作省事。

**6. submodule 需在每个 worktree 单独初始化**

```bash
git submodule update --init --recursive
```

**7. 依赖需在每个 worktree 单独安装**

`node_modules`、`venv` 等不共享，各装各的。

---

## 六、多 Agent 并行开发场景

```text
/code/
├── myproject/          # 主工作树（main），最终合并处
├── agent1-worktree/    # Agent 1 改登录
├── agent2-worktree/    # Agent 2 修安全
└── agent3-worktree/    # Agent 3 写文档
```

每个 Agent 看到完整项目，正常编辑、跑测试、提交。它们改的是各自独立的工作区文件，底层共享同一 Git 历史。最后在主仓库 `git merge` 逐个合并。

**收益**：不用 stash、不用切分支、不用等别人、改动互不污染。

---

## 七、速查表

| 需求                | 命令                                      |
| ----------------- | --------------------------------------- |
| 新建 worktree + 新分支 | `git worktree add <path> -b <branch>`   |
| 检出已有分支            | `git worktree add <path> <branch>`      |
| 列出所有              | `git worktree list`                     |
| 删除                | `git worktree remove <path>`            |
| 强制删除              | `git worktree remove --force <path>`    |
| 清理残留              | `git worktree prune`                    |
| 移动                | `git worktree move <old> <new>`         |
| 查看某分支历史           | `git log <branch>`（任意 worktree 中均可）     |
| 合并                | `git merge <branch>`（普通本地分支合并，无需 fetch） |

## 速查卡片

```bash
git init                    # 初始化仓库
git clone <地址>             # 克隆远程仓库
git status                  # 查看状态
git add .                   # 暂存所有改动
git commit -m "消息"        # 提交
git push                    # 推送到 GitHub
git pull                    # 从 GitHub 拉取最新
git log --oneline --graph   # 看历史
git branch                  # 看分支
git checkout -b <分支名>     # 新建并切换分支
git merge <分支名>           # 合并分支
```

---

> **最后的建议**：Git 只需要学会上面 10 个命令就能应付 90% 的学习场景。刚开始不用追求理解所有概念，**多用几次就熟了**。遇到记不住的命令，打开这份说明查一下就好。
> 
> 💡 提示：可以用 `git --help` 或 `git 命令 --help` 在终端查看帮助
