---
title: Docker 禁止将容器端口映射到公网
date: 2024-10-11T04:30:18+08:00
tags:
    - Docker
---
Docker 会直接绕过 ufw 之类的防火墙软件，将服务发布到公网，存在一定安全隐患，所以折腾了一下研究了几个办法阻止 Docker 把端口映射到公网上

## ufw-docker

<https://github.com/chaifeng/ufw-docker>

一键安装:

```bash
sudo wget -O /usr/local/bin/ufw-docker \
  https://github.com/chaifeng/ufw-docker/raw/master/ufw-docker
chmod +x /usr/local/bin/ufw-docker

# 写入 ufw 规则
ufw-docker install
```

开放端口:

```bash
ufw-docker allow <容器名> <容器内端口>
```

其他操作参考 README

### 已知的一些缺点

- 不能指定外部端口映射，只能映射到同一个端口上
- 貌似没法开放 UDP 端口？(至少它把我邮件服务器干了)

## 绑定到指定 IP

将容器开放端口绑定到指定 IP 上，其他 IP 无法访问
要禁止外部网络访问，直接绑定到 `127.0.0.1` 或者其他代表本地的 IP，外网就无法访问了

### Docker Compose

```yaml
services:
    exmaple:
        # ...
        ports:
            - 127.0.0.1:8080:80
            # - <本地IP>:<本地端口>:容器内端口
        # ...
```

### Docker

启动的时候带上 `--ip=127.0.0.1` 参数即可
也可以修改 `daemon.json` 使默认 `bridge` 网络无法外网访问：

```json
{
    // 要绑定的 IP
    "ip": "127.0.0.1"
}
```
