---
title: LoCyanFrp 3 更新日志
date: 2025-07-05T23:21:57+08:00
tags:
    - LoCyanFrp
---
本次更新，我们重构了整个前后端，故花费了较长的时间，感谢各位的耐心等待。

## 项目架构更新

第三代乐青映射的技术栈为：

- 前端
  - Nuxt.js
  - Vue.js
- 后端
  - Spring Boot
  - Spring Cloud

### 网页面板

- 使用 Nuxt.js 框架进行了重写
- 从 CSR 切换到了 SSG，加载面板更快，性能更好
- 经过重新设计的 UI/UX，带来更方便的操作，更人性化的体验
- 彻底移除了 Axios，使用 ofetch 作为网络请求库

### 后端

- 完全重写，并规范了命名空间
- 几乎全部使用 Kotlin，增加开发效率，并减少空指针导致可能的异常
- 使用 Gradle Version Catalog 进行依赖管理，减少可能的依赖问题
- 引入了 Spring Cloud Eureka 微服务架构，为集群化部署进行了适配
- 对后端进行了模块化

### 数据库

- 从 MySQL 更换为了 PostgreSQL + TimescaleDB
- 对数据库结构进行了完全的重新设计，完全抛弃 Sakura Panel 的数据库格式

## 软件更新

- 将 Frp 从 0.51.3 版本更新到了 0.62.1 版本
- 将 Controller 移植到了非 Linux 客户端

## 其他更新

- 支持了港澳台证件进行身份认证
- 对用户组功能进行了重新设计
- 暂时移除了没有任何用的联机功能，后续会重新加入
- 加入了 TOML、YAML、JSON 配置的支持，移除了 INI 配置
- 引入了 Umami 统计

## 计划中（未完成更新）

- 通行密钥登录
- HTTP2HTTPS 自动配置

更多未列出事项，可以在 GitHub Issue Tracker 查看。

[LoCyanFrpFrontend#1](https://github.com/LoCyan-Team/LoCyanFrpFrontend/issues/1)
