---
title: HUAWEI nova 3通过开启深色模式
date: 2024-08-10T04:56:51+08:00
tags:
  - HarmonyOS
---
nova 3这台机子更新了HarmonyOS 2，但是却是基于AOSP9的版本，导致很多功能遗失，比如这个深色模式
~~HUAWEI nova 3 简直就是 wuawei 弃子~~

可以通过 ADB 设置属性开启 Android 9 中的深色模式，不过系统本身没有适配，只有应用会适配

```pwsh
adb shell settings put secure ui_night_mode 2
```

如果你像我的一样安装了 GMS 框架，但是发现设置了之后Google家的一些应用还一样浅色模式显示，得手动到应用的设置设成深色
