---
title: "Muska_Ami's ServerScript: 服务器一键配置脚本"
date: 2024-02-10T18:52:25+08:00
tags:
    - 服务器
    - Shell
    - 工具
---
## 一键配置服务器

- 安装基本工具（为精简版系统准备）
- 设置清华源
- Neo/Fast/Hyfetch
- Tailscale组网
- 1Panel安装
- 哪吒监控Agent安装（自动使用 `https://proxy-gh.1l1.icu` 镜像）
- 更多功能...

```sh
#apt update
#apt install curl -y
curl https://install.1l1.icu/linux_setup.sh -o setup && bash setup
```
