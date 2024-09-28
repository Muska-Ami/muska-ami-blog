---
title: 搭建自己的GitHub加速：GHProxy和GitHub Mirror使用教程
date: 2024-01-24T17:01:55+08:00
tags:
    - GitHub
    - 镜像
    - 教程
---
## 准备

- 一台能够正常访问GitHub服务的服务器（带宽要足够）
- 命令行知识
- 手和脑子

本文假设服务器为Debian 12系统。

## 搭建GitHub下载镜像

GitHub在大陆直连效果一言难尽。。。所以想到自己搭建镜像，但是直接反代GitHub又不是很好控制，故找到了这样一个项目：GHProxy。
关于这个项目的介绍请转到 `README.md` 阅读，此处不再介绍。
[https://github.com/hunshcn/gh-proxy](https://github.com/hunshcn/gh-proxy)

### 部署

此处采用的是Docker部署，若需要其他方式请自行研究。

#### 安装Docker

Docker官方安装文档
[https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
如果你安装了旧版的Docker，请先卸载：

```sh
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

添加Docker仓库

```sh
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

安装Docker

```sh
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

```sh
root@twlite2-20231223163612543197:~# docker -v
Docker version 24.0.7, build afdd53b
```

#### 启动

直接运行：
-p 指定端口映射，请根据需要修改第二个 `80` 。

```sh
docker run -d --name="gh-proxy-py" \
  -p 0.0.0.0:80:80 \
  --restart=always \
  hunsh/gh-proxy-py:latest
```

浏览器打开 `http://服务器IP:端口` 即可查看效果。
![P](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328ae3d2999.webp)

## 搭建GitHub API镜像

不知道是什么时候开始GitHub API也受到干扰了，部分地区无法正常访问。
由于对GitHub API有需求，所以也做一个镜像。
但是GitHub API有IP小时访问次数限制，直接反代容易超限。
故此处采用 `Github Mirror` 这个项目来做镜像。
[https://github.com/app-sre/github-mirror](https://github.com/app-sre/github-mirror)

此处采用的是Docker部署，若需要其他方式请自行研究。

### 部署

依然采用Docker部署。

#### 安装Docker

Docker官方安装文档
[https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
如果你安装了旧版的Docker，请先卸载：

```sh
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

添加Docker仓库

```sh
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

安装Docker

```sh
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

```sh
root@twlite2-20231223163612543197:~# docker -v
Docker version 24.0.7, build afdd53b
```

#### 启动

直接运行：
同样根据需要修改第二个 `8080` 。

```sh
docker run --rm -it -p 8080:8080 quay.io/app-sre/github-mirror
```

## Openresty本地反代载入SSL证书

此处反代主要是添加SSL证书和更多高级功能，我这里用的是[1Panel](https://1panel.cn)管理。
假设此处已安装Openresty。

确认已经部署好了服务。
左侧面板打开 `网站` -> `网站` ，点击 `创建网站` 。点击右上反向代理。
根据实际情况填写相关信息。然后 `创建` 。
添加相关DNS记录，完成。

### 添加SSL证书

找到刚刚创建的网站，点击 `操作` 中的 `配置` 。
点击 `HTTPS` ，打开HTTPS开关。
根据实际选择SSL证书。
