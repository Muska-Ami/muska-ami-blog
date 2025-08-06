---
title: 中兴ZTE MyOS改用第三方启动器
date: 2024-08-12T19:28:21+08:00
tags:
    - 中兴
    - MyOS
---
该方法仅供学习交流，所有操作造成的后果由使用者自负！

## 准备

- ADB
- 一款第三方桌面软件

## 步骤

首先确保已经把手机导航方式切换为传统按键导航。
然后打开手机开发人员选项，打开 ADB 调试功能。

确保已经安装好第三方启动器。
博主使用的是 `微软桌面` ，当然你用别的也不是不可以。

### 方法一

ADB 连接到手机，使用命令设置默认主屏幕应用：

```shell
adb shell pm set-home-activity com.microsoft.launcher
```

### 方法二

ADB 连接到手机，执行以下命令先禁用中兴自带的桌面软件：

```shell
adb shell pm disable-user com.zte.mifavor.launcher
```

然后回到手机，此时返回桌面，会提示选择打开方式，选中自己安装的第三方桌面软件并勾选 `设为默认` 。
此时手势导航不能用，我们解除禁用中兴的桌面软件：

```shell
adb shell pm enable com.zte.mifavor.launcher
```

然后去设置里面把导航方式切换回原来的导航方式即可正常使用。
