---
title: 给你的Redefine主题添加樱花效果
date: 2023-10-25T17:21:28+08:00
tags:
    - Hexo
    - Redefine
---
## 使用 jhammann/sakura

这是一个 GitHub 上的开源项目，用于添加樱花效果。本站樱花效果也是用是这个实现的。
[https://github.com/jhammann/sakura/](https://github.com/jhammann/sakura/)

### 扩展样式

由于这个项目生成的樱花会导致溢出，需要禁用横向溢出显示加载条。
在 `source` 目录下你喜欢的位置新建一个 CSS 样式文件，此处用 `extra.css` 命名。

填入以下内容：

```css
body {
    overflow-x: hidden;
}
```

### 导入JS/CSS

首先需要下载 `sakura.js`。
在项目 `dist` 目录下下载对应文件，建议使用 `min.js` 与 `min.css` 而不是未压缩的文件。
[https://github.com/jhammann/sakura/tree/master/dist](https://github.com/jhammann/sakura/tree/master/dist)
将文件放在 `source` 目录下你喜欢的位置。

假设我们存放 js 与 css 文件 的路径分别为 `/path/to/js` 与 `path/to/css`。
打开你的Redefine主题配置，找到inject部分，修改为：

```yaml
inject:
  enable: true # 启用Inject
  head: # 插入头部
    - |-
      <link rel="stylesheet" href="/path/to/css/extra.css">
      <script src="/path/to/js/sakura.min.js"></script>
      <link rel="stylesheet" href="/path/to/css/sakura.min.css">
      <script>
        // 定义成变量方便调用JSAPI，也可以直接new调用
        // 第一个变量为花瓣要放在哪个容器内，本脚本没使用canvas
        var sakura = new Sakura('body');
      </script>
```

### JSAPI

```js
sakura.start(); // 开始播放，默认是开始状态，如已经开始后还调用会报错
sakura.stop(); // 停止播放，如已经停止后还调用会报错
```

## 使用 Quaint 的樱花脚本

这是原作者发的文章：[https://www.cnblogs.com/quaint/p/12291936.html](https://www.cnblogs.com/quaint/p/12291936.html)
打开Redefine主题配置，找到inject部分，修改为：

```yaml
inject:
  enable: true # 启用Inject
  head: # 插入头部
    - |-
      <script src="https://files.cnblogs.com/files/quaint/sakuraPlus.js"></script>
```

也可以下载这个 js 放到 `source` 目录下引用。

> 注：这个脚本把樱花图像转为 `base64/png` 存在脚本里，不如上面的用 css 样式实现文件体积那么小。
> 如果觉得内嵌不好可以下载原图后手动修改脚本 `img.src = "<url>"` 的属性，替换为自己的图片链接即可。
> 原图：![sakura](https://pan.amaicat.work/f/5eXTJ/sakura.png)

### JSAPI

```js
startSakura(); // 开始播放，默认会在img.onload后调用
stopp(); // 停止播放
```

## 使用紫月蓝风的脚本

这个原作者似乎没有公开，但是 Quaint 的脚本是基于这个的，干脆也写一下。

打开Redefine主题配置，找到inject部分，修改为：

```yaml
inject:
  enable: true # 启用Inject
  head: # 插入头部
    - |-
      <script src="https://blog-static.cnblogs.com/files/izbw/yinghua.js"></script>
```

也可以下载这个 js 放到 `source` 目录下引用。

> 注：这个脚本把樱花图像转为 `base64/png` 存在脚本里，不如上面的用 css 样式实现文件体积那么小。
> 如果觉得内嵌不好可以下载原图后手动修改脚本 `img.src = "<url>"` 的属性，替换为自己的图片链接即可。
> 原图：![sakura](https://pan.amaicat.work/f/5eXTJ/sakura.png)

### JSAPI

```js
startSakura(); // 开始播放，默认会在img.onload后调用
stopp(); // 停止播放
```
