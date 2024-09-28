---
title: 'Dart 开发踩坑: ServerSocket.close();'
date: 2024-09-27T17:12:04+08:00
tags:
    - Dart
---
今天在写一个 ServerSocket 转发的时候，发现调用了 `close()` 方法，数据貌似还在传输：
![演示](https://apac-cloudflare-r2-img.1l1.icu/2024/09/27/66f67762f3db2.webp)
看起来很奇怪，然后去查了一下，发现了这个 Issue [dart-lang/sdk#54882](https://github.com/dart-lang/sdk/issues/54882)，官方成员的回复是：

> Closing listening socket does not affect connections already established

一不小心就踩坑了，这个居然不会影响现有连接，居然还要自己去实现，绝了
