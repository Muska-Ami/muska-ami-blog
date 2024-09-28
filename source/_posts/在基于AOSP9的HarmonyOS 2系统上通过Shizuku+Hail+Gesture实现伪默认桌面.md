---
title: 在基于AOSP9的HarmonyOS 2系统上通过Shizuku+Hail+Gesture实现伪默认桌面
date: 2024-05-12T00:55:30+08:00
tags:
    - HarmonyOS
    - 教程
cover: https://apac-cloudflare-r2-img.1l1.icu/2024/05/12/664032af86c08.webp
---
默认的华为桌面是真的不好用 又不给改，难受得很
新版系统可以通过安装含BUG的手机管家切换，但我的设备是基于AOSP9的HarmonyOS 2系统，无法安装
故研究了这个方法来替代华为桌面

## 前置条件

- 安装Shizuku
- 安装Hail
- 安装Gesture

## 授权Shizuku

ADB连接到手机，执行：

```bash
adb shell sh /storage/emulated/0/Android/data/moe.shizuku.privileged.api/start.sh
```

此时手机上的Shizuku应该显示正在运行
![Shizuku状态](https://apac-cloudflare-r2-img.1l1.icu/2024/05/12/663fa45b2ae05.webp)

## 设置Gesture

按照Gesture提示完成设置，并将所有手势带 `HOME键` 的修改为打开应用，目标应用为你的桌面应用

## 冻结华为桌面

打开Hail，设置中工作模式改为 `Shizuku - 停用`
应用筛选器选到 `系统` ，勾选 `华为桌面`
![Hail 华为桌面](https://apac-cloudflare-r2-img.1l1.icu/2024/05/12/663fa4e720530.webp)
返回首页，点击右下角冻结华为桌面

## 个人体验

基本上能替代华为的构思桌面，但是重启后需要重新激活，所以不适合作为主力使用
目前用的是Pixel 7 Pro做主力机，华为的自己修好了基本上没用过，当个备用机使
