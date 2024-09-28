---
title: OpenWrt全局转发流量到ZeroTier
date: 2024-01-27T18:49:03+08:00
tags:
    - OpenWrt
    - ZeroTier
    - 软路由
    - 组网
---
本教程全程使用LuCi界面演示，测试可与PassWall共存

## 前置条件

安装了ZeroTier

## 创建网络接口

前往 `网络`-> `接口` -> `添加新接口...`

- 名称 任意，如 `ztlan`
- 协议 `不配置协议`
- 设备 以 `zt` 开头的设备，为你的ZeroTier接口设备

![P](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328ec27ab53.webp)
![P](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328ec0af6d7.webp)

## 设置转发规则

前往 `网络` -> `防火墙`
前往 `常规设置`

新建一个防火墙区域

- 名称 任意，如 `ztlan`
- 转发 接受
- 涵盖的网络 `lan` , `ztlan`
- 允许转发到目标区域 `wan`
- 允许来自源的区域 `lan`

修改 `lan` 区域规则

- 允许转发到目标区域 `ztlan`

![P](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328ec0c731a.webp)

前往 `NAT规则`

新建一个规则

- 名称 任意，如 `ZTNAT`
- 出站区域 `ztlan`
- 操作 `MASQUERADE - 自动重写源地址为出站接口 IP`

![P](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328ebc9967b.webp)

大功告成

![P](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328ec0235fa.webp)
