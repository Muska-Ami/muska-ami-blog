---
title: NetMount：挂盘小工具，挂载 AList 到本地
date: 2024-07-15T00:31:53+08:00
tags:
    - NetMount
    - 磁盘
    - AList
    - Rclone
cover: https://apac-cloudflare-r2.img.1l1.icu/2024/07/15/6693fe14574d8.webp
---
## 什么是 NetMount

官网介绍：

> 统一管理和挂载云存储设施

其实是一个基于 AList 和 Rclone 的开源网络盘挂载工具（个人感觉管理功能偏少），支持挂载为本地盘，而且无需付费。
前端基于 Tauri 开发。

## 使用 NetMount 挂载自家 AList

我在自己家部署了 MinIO 和 AList，用来做 NAS，但是一直没找到好的挂载软件。
NetMount 很好的解决了我挂载的问题：无需修改注册表直接挂载 HTTP 协议的 WebDAV 存储，异步传输（防止卡死文件资源管理器，这个问题真的是 Windows 系统直接挂网络盘的最大槽点），以及突破最大文件传输大小限制。

![效果](https://apac-cloudflare-r2.img.1l1.icu/2024/07/15/6694002798d00.webp)

### 安装 WinFsp

挂载到文件资源管理器上需要安装 WinFsp，打开软件在挂载时会提示是否安装，直接安装即可。
安装重启后主界面可能卡住，直接退出重开就行了。

### 添加存储

`存储` -> `管理` -> `添加`，选择对应的平台，我们挂载 AList 选 WebDAV。
点击 `下一步`

按实际填写自己 AList 的 WebDAV 信息。
![填写内容](https://apac-cloudflare-r2.img.1l1.icu/2024/07/15/669401f848f2a.webp)

然后会回到 `存储` -> `管理`，点击存储旁边的 `挂载` 配置挂载。

![挂载](https://apac-cloudflare-r2.img.1l1.icu/2024/07/15/6694028a7239e.webp)

按自己需要挂载到指定位置，像我则挂为网络驱动器（显示所有选项，`挂载为网络驱动器`）。
点击 `挂载`，完成。

如果没有配置错误，那么现在你已经能在文件资源管理器看到自己的网络存储了。
