---
title: rEFInd+rEFInd-minimal主题进一步美化
date: 2024-03-31T17:23:42+08:00
tags:
    - rEFInd
    - UEFI
---
## 设置指南

### rEFInd 显示比例问题修复

我电脑屏幕比例 16:9 的，但是默认貌似当成 4:3 的了，通过 rEFInd 的 `resolution` 选项可以手动指定分辨率，举例1080P：

```conf
# Set the screen's video resolution. Pass this option one of the following:
#  * two integer values, corresponding to the X and Y resolutions
#  * one integer value, corresponding to a GOP (UEFI) video mode
#  * the string "max", which sets the maximum available resolution
# Note that not all resolutions are supported. On UEFI systems, passing
# an incorrect value results in a message being shown on the screen to
# that effect, along with a list of supported modes. On EFI 1.x systems
# (e.g., Macintoshes), setting an incorrect mode silently fails. On both
# types of systems, setting an incorrect resolution results in the default
# resolution being used. A resolution of 1024x768 usually works, but higher
# values often don't.
# Default is "0 0" (use the system default resolution, usually 800x600).
#
#resolution 1024 768
#resolution 1440 900
#resolution 3
#resolution max
resolution 1920 1080
```

### rEFInd-minimal 主题修改背景图

默认背景图位于 `<主题位置>/background.png` ，将这个背景图替换为自己的即可

### rEFInd + HackBGRT 兼容

由于添加 HackBGRT 导致一共有 3 个引导启动 Windows 的选项，实际上根本不需要这么多，通过以下方式配置解决：

```conf
# 手动创建 Windows 启动项
menuentry "Windows" {
    icon \EFI\refind\themes\rEFInd-minimal\icons\os_win.png # 设置显示 rEFInd-minimal 主题 Windows 图标
    loader \EFI\HackBGRT\loader.efi # 你的HackBGRT loader.efi 位置
}

# 屏蔽一些启动项
dont_scan_dirs \EFI\Boot,\EFI\Microsoft\Boot,\EFI\HackBGRT
dont_scan_volumes Windows
```

## 效果

![效果](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328cca03751.webp)
