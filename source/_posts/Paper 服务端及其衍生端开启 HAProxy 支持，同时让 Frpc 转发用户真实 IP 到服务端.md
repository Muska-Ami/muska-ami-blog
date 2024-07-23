---
title: Paper 服务端及其衍生端开启 HAProxy 支持，同时让 Frpc 转发用户真实 IP 到服务端
date: 2024-07-23T21:36:25+08:00
tags:
    - Minecraft
    - Frp
    - Paper
    - 教程
---
## Frpc 添加参数开启 HAProxy 转发

以下示例均为 `ini` 配置，其他配置请自行变通。

在 Frpc 配置文件对应隧道配置后加入：

```ini
proxy_protocol_version = v2
```

e.g.

```ini
[testTunnel]
privilege_mode = true
type = tcp
local_ip = 127.0.0.1
local_port = 25565
remote_port = 11451
use_encryption = 0
use_compression = 0
proxy_protocol_version = v2
```

重启 Frpc（如果正在运行）。

## Paper Global 配置开启 HAProxy 支持

将 `proxies.proxy-protocol` 设置为 `true` 。

```yaml
proxies:
  bungee-cord:
    online-mode: true
  proxy-protocol: true # <--- 这里
  velocity:
    enabled: false
    online-mode: true
    secret: ''
```

重启服务端（如果正在运行）。

## All done

如果你是按照教程配置的，那么现在加入服务器已经会显示客户端的实际 IP 。

```log
[21:23:54] [User Authenticator #0/INFO]: UUID of player Muska_Ami is <UUID>
[21:23:57] [Server thread/INFO]: Muska_Ami joined the game
[21:23:57] [Server thread/INFO]: Muska_Ami[/117.183.xxx.xxx:24884] logged in with entity id 25 at ([world]-0.5, 69.0, -3.5)
```
