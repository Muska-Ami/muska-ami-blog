---
title: 在 Windows 环境为 rEFInd 配置安全启动
date: 2025-06-23T04:20:49+08:00
tags:
  - rEFInd
  - Secure Boot
  - Windows
---
## 准备工作

1. 下载微软签名的 `PreLoader.efi` `HashTool.efi` [https://blog.hansenpartnership.com/linux-foundation-secure-boot-system-released/](https://blog.hansenpartnership.com/linux-foundation-secure-boot-system-released/)
2. 准备一个可以读写 EFI 分区的软件（此处为 DiskGenius）
3. 确认你的磁盘格式支持安全启动
4. 一点耐心

## 操作步骤

### 将 PreLoader 和 HashTool 复制到 rEFInd 可启动项的目录

根据你实际放置的位置来，我的是 `\EFI\refind`，将这两个文件拷到里面即可。

![效果](https://apac-cloudflare-r2-img.1l1.icu/2025/06/23/6858674a75107.webp)

### 复制 rEFInd 的可启动项文件

复制一份 rEFInd 的可启动项文件，比如我的是 `refind_x64.efi`，复制成 `loader.efi`。

![效果](https://apac-cloudflare-r2-img.1l1.icu/2025/06/23/685867a356642.webp)

### 添加 UEFI BIOS 启动项

DiskGenius 菜单栏，`工具` -> `设置UEFI BIOS启动项` 添加一个新的启动项，路径为刚才复制过去的 `PreLoader.efi`。
将启动项移动到最顶上（第一个启动的），保存。

![效果](https://apac-cloudflare-r2-img.1l1.icu/2025/06/23/68586819c57a3.webp)

### 重启设备，进入 BIOS 设置

进入你的主板 BIOS 设置，如果你不知道怎么按键盘进入那在上一步勾上下面 `下次启动时直接进入UEFI BIOS设置界面（仅一次）`，然后点击 `立即重启`。

在 安全（Security）设置找到 安全启动（Secure Boot）设置，改为 开启（Enabled）。
在最后一个选项卡保存并重启（Save & Reset(有的是 Save & Restart)）。

### 使用 HashTool 导入 Hash

这个时候你应该会看到一个蓝色的屏幕，并显示如下：

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                            Failed to start loader                            │
│                                                                              │
│          It should be called loader.efi (in the current directory)           │
│                     Please enrol its hash and try again                      │
│                                                                              │
│                I will now execute HashTool for you to do this                │
│                                                                              │
│                                                                              │
│                                     ┌────┐                                   │
│                                     │ OK │                                   │
│                                     └────┘                                   │  
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

此时按回车，显示如下：

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                                Select Binary                                 │
│                                                                              │
│               The Selected Binary will have its hash Enrolled                │
│            This means it will Subsequently Boot with no prompting            │
│    Remember to make sure it is a genuine binary before Enroling its hash     │
│                                                                              │
│                                                                              │
│                            ┌─────────────────────┐                           │
│                            │     Enroll Hash     │                           │
│                            │ Reboot to UEFI Menu │                           │
│                            │    Reboot System    │                           │
│                            │        Exit         │                           │
│                            └─────────────────────┘                           │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

使用键盘上的上下按键，切换到 `Enroll Hash`，回车。
此时应该显示为：

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                                Select Binary                                 │
│                                                                              │
│               The Selected Binary will have its hash Enrolled                │
│            This means it will Subsequently Boot with no prompting            │
│    Remember to make sure it is a genuine binary before Enroling its hash     │
│                                                                              │
│                                                                              │
│                                ┌──────────────┐                              │
│                                │     EFI/     │                              │
│                                │    (More)    │                              │
│                                └──────────────┘                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

选择你要导入的启动项，我们这里要选择导入我们刚刚复制的 `loader.efi`，使用上下按键和回车来操作确认。
如果选择了文件应该会显示：

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                      Enroll this hash into MOK database?                     │
│                                                                              │
│                         File: \EFI\rEFInd\loader.efi                         │
│     Hash: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX   │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                     ┌─────┐                                  │
│                                     │ No  │                                  │
│                                     │ Yes │                                  │
│                                     └─────┘                                  │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

选择 Yes，回车。
等待导入完毕后，还要同样的操作导入其他 rEFInd 下引导的可启动项，然后重启电脑，你应该就可以正常进入了。
