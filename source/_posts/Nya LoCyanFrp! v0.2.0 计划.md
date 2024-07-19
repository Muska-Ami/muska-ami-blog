---
title: Nya LoCyanFrp! v0.2.0 计划
date: 2024-07-19T17:29:34+08:00
tags:
    - Nya LoCyanFrp!
    - LoCyanFrp
    - 乐青映射
---
## 关于该计划

由于当前启动器的代码体量并不小，为了便于维护，打算进一步模块化。
同时避免重复代码，将 `nyalcf_core` 完全分离，以便开发新的命令行版本（原定是用 Terminal UI 实现，但是后面还是决定直接用 CLI 了）。

## 项目目录树

- nyalcf_core - 核心模块
- nyalcf_inject - 通讯模块
- nyalcf_gui - 图形化版本
  - nyalcf_ui - 用户界面模块
  - nyalcf_core_extend - 核心扩展模块
  - nyalcf_inject_extend - 通讯扩展模块
- nyalcf_cli - 命令行版本

由于命令行版本刚起步，模块信息可能日后会有变动。

## 关于核心改动

从 `nyalcf_core` 里面提取了小部分的代码，这些代码与 `nyalcf_ui` 深度绑定导致无法移除，所以统一提取到 `nyalcf_core_extend` 来解决这个问题。
同时 `nyalcf_inject` 本身也有部分与 `nyalcf_ui` 代码存在绑定关系，同样提取到了 `nyalcf_inject_extend` 以便去除 Flutter 依赖使得可以直接在命令行版本中使用 `nyalcf_inject` 。

## 其他改动

- 现在窗口可以缩放的更小了
- 优化了开源许可证页面的展示
- 窗口默认大小变的更大了
- 深度链接集成

更多改动在实际开发中可能会产生，最终结果请以往后 Releases 发布内容为准。
如果你有兴趣来维护这个项目，欢迎提交 PR 。贡献相关请查阅 <https://github.com/Muska-Ami/NyaLCF?tab=readme-ov-file#how-to-contribute>
