---
title: 修复使用部分js框架时网页上的电子邮件地址显示[email protected]的问题
date: 2024-01-27T22:36:06+08:00
tags:
    - 电子邮件混淆
---
这个问题多半是由于CDN提供商的电子邮件混淆（加密）功能导致的，关掉就好了（
比如Cloudflare这个电子邮件混淆会导致我博客的邮件地址渲染不正常

[https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/)
![P](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328daff2ec7.webp)

关闭方法为打开Cloudflare仪表板，选择自己的问题域名，前往 `Scrape Shield` 中关闭该功能（或者你只想对特定域名关闭，可以通过Cloudflare的 `配置规则` 实现）
