---
title: 不使用tailscale_enabler的方法在OpenWrt上安装最新版Tailscale
date: 2024-07-30T14:15:48+08:00
tags:
    - OpenWrt
    - Tailscale
---
## 为什么不使用 tailscale_enabler ?

1. tailscale_enabler 每次启动都要重新下载 Tailscale，我认为这是非常愚蠢的设计。
2. tailscale_enabler 部分资源使用 GitHub 下载，国内访问不畅通。

## 正文

### 下载安装最新版 Tailscale 的 ipk

访问 <https://pkgs.org/download/tailscale>，往下找到 OpenWrt，选择合适架构的 ipk 文件，点击进入，往下滑找到 `Download` 进入，有一个下载链接，下载并使用 opkg 安装。
我使用的是基于 OpenWrt 22 的系统，能正常使用，虽然这个是 OpenWrt 23 源中的文件。

安装好了之后，此时正常接入内网会显示不是最新版，先别着急，我们执行新版 Tailscale 带有的 `update` 命令：

```sh
tailscale update
```

执行完毕后，你就会发现 Tailscale 已经正常升级到最新版。
![Result](https://apac-cloudflare-r2-img.1l1.icu/2024/07/30/66a887140ec84.webp)
