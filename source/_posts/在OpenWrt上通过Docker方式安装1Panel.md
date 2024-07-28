---
title: 在OpenWrt上通过Docker方式安装1Panel
date: 2024-04-29T13:12:36+08:00
tags:
    - OpenWrt
    - 1Panel
cover: https://apac-cloudflare-r2.img.1l1.icu/2024/05/02/66328a0c5b904.webp
---
## 安装Docker

请先在OpenWrt上安装Docker，此处不做演示

## 部署1Panel

请将 `<DOCKER_INSTALL_DIR>` 替换为你的Docker安装路径，如我的iStoreOS默认安装在 `/overlay/upper/docker`

```bash
docker run -d \
    --name 1panel \
    --restart always \
    --network host \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v <DOCKER_INSTALL_DIR>/volumes:/var/lib/docker/volumes \
    -v /opt:/opt \
    -v /root:/root \
    -e TZ=Asia/Shanghai \
    moelin/1panel:latest
```

### 获取登录信息

进入容器终端

```bash
docker exec -it 1panel /bin/sh
```

使用 `1pctl` 命令行获取登录信息

```bash
1pctl user-info
```

![Shell](https://apac-cloudflare-r2.img.1l1.icu/2024/05/02/66328a0d16b59.webp)

## 通过 Docker Compose 部署方便挂载和升级

安装 Docker Compose
前往 [此处](https://github.com/docker/compose/releases) 查看当前 Docker Compose 最新版，将下文的 `<VERSION>` 改为最新版 Docker Compose 版本，`<ARCH>` 改为 当前系统架构

```sh
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v<VERSION>/docker-compose-linux-<ARCH> -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
docker compose version
```

### （可选）添加命令别名

OpenWrt 上要用 `docker compose` 不太符合我的习惯，直接写个 alias
在 `/etc/profile` 末尾加入：

```sh
alias docker-compose="docker compose"
```

```sh
source /etc/profile
docker-compose version # Docker Compose version v2.29.1
```

### Docker Compose 文件

请将 `<DOCKER_INSTALL_DIR>` 替换为你的Docker安装路径，如我的iStoreOS默认安装在 `/overlay/upper/docker`

```yml
services:
  1panel:
    image: moelin/1panel:latest
    container_name: 1panel
    restart: always
    network_mode: host
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - <DOCKER_INSTALL_DIR>/volumes:/var/lib/docker/volumes
      - /opt:/opt
      - /root:/root
    environment:
      - TZ=Asia/Shanghai
```

启动

```yml
docker compose up -d
```
