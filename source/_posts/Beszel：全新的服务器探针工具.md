---
title: Beszel：全新的服务器探针工具
date: 2024-08-31T06:41:47+08:00
tags:
    - Beszel
    - 探针
cover: https://apac-cloudflare-r2.img.1l1.icu/2024/08/31/66d24b2ac847e.webp
---
## 关于 Beszel

一个轻量级的服务器资源监控，官方描述：

> A lightweight server resource monitoring hub with historical data, docker stats, and alerts.

正如介绍所言，而且不但轻量，UI 界面也美观。

### 一点关于博主更换 Beszel 的经历

博主曾经使用哪吒监控，但它并不好用，以下是原因：

1. 哪吒监控的前端并不好看
2. 哪吒监控的前端对移动端适配很差，能用但是很糟心
3. 哪吒监控的前端代码和处理逻辑非常糟糕，博主曾自制过主题
4. 哪吒监控的后台没有搜索功能，有人可能会说 `Ctrl + F`，但其实服务器多了并没有自带搜索直观

出于种种原因，我最终更换了 Beszel 作为服务器探针。

## 部署 Hub

Hub 就是 Beszel 的控制端，很简单，使用 Docker 就可以轻松部署。
我这里选择使用 Compose 部署，示例如下：

```yaml
services:
  beszel:
    image: 'henrygd/beszel'
    container_name: 'beszel'
    restart: unless-stopped
    volumes:
      - ./data:/beszel_data
    ports:
        - "8090:8090"
```

将这个配置写到你喜欢的地方，比如 `/opt/beszel`
然后：

```shell
cd /opt/beszel
docker-compose up -d
```

现在访问 `http://<服务器地址>:8090` 即可进入 Beszel 后台，在这里配置完管理员信息就完成了。

## 部署 Agent

Agent 同样可以使用 Docker Compose 部署。
在 Hub 的右上角点击 `Add System`，点击 `Copy docker compose` 即可复制 Agent 部署用的 `docker-compose.yml` 模板，参考上方 Hub 的部署方法，正常部署然后在 Hub 完成信息填写并添加即可。

### Watchtower 自动更新 Agent

Beszel 不会自动更新 Agent，可以通过配置 Watchtower 实现容器自动更新：

```shell
docker run -d --name watchtower -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower beszel-agent
```
