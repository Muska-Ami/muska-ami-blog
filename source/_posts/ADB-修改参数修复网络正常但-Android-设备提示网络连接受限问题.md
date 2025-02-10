---
title: ADB 修改参数修复网络正常但 Android 设备提示网络连接受限问题
date: 2025-02-10 17:08:44
tags:
    - Android
---
最近我的 Pixel 在连接国内网络的时候会出现这个问题，大概率是三网又把测试服务器地址 ban 了，以下是解决方案。

## 获取 ADB

首先需要获取 ADB，可以参考 AOSP 的文档下载配置

<https://source.android.google.cn/docs/setup/build/adb?hl=zh-cn>

## 修改测试服务器地址

首先删除原来的

```bash
adb shell settings delete global captive_portal_https_url
adb shell settings delete global captive_portal_http_url
```

然后重新添加

```bash
adb shell settings put global captive_portal_https_url https://g.cn/generate_204
adb shell settings put global captive_portal_http_url http://g.cn/generate_204
```

> 如果 Google 中国的服务器你也无法访问，可以尝试其他厂商的地址:
>
> - connectivitycheck.platform.hicloud.com/generate_204
> - connect.rom.miui.com/generate_204
> - wifi.vivo.com.cn/generate_204
>
> 或者你也可以自建一个，只要地址返回 204 No Content 即可。

修改完需要重新联网一下，不行就重启一下手机。
