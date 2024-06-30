---
title: CSS3中使元素居中的各种方式
date: 2024-06-30T14:31:40+08:00
tags:
    - CSS3
    - 教程
---
## margin 属性居中

```html
<!-- 为要居中的元素设置父级宽度 -->
<!-- 一定要有一个数值，才能正常居中 -->
<div class="box">
    <!-- 将要居中的元素内容 margin 属性设置为 auto 实现居中 -->
    <span class="sub">我是居中内容</span>
</div>
<style>
.box {
    width: 500px;
}
.sub {
    /* 横竖居中 */
    margin: auto;
    /* 仅横向
    margin: 0 auto; */
    /* 仅竖向
    margin: auto 0; */
}
</style>
```

## flex 布局居中

```html
<div class="flex">
    <span>我是居中内容</span>
    <div>盒子也能居中</div>
</div>
<style>
.flex {
    /* 设置 flex 布局 */
    display: flex;
    /* 内容居中 */
    justify-content: center;
    /* 设置居中方向 */
    flex-direction: column;
}
</style>
```

## 绝对宽度下对半分

如果是绝对宽度直接父组件宽高对半分就好了，不做演示了
