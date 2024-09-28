---
title: 使用ZBProxy实现Minecraft Java版服务器地区分流
date: 2024-03-08T12:18:14+08:00
tags:
  - 教程
  - Minecraft
---
## 场景

本文主要来自SPCraftMC的实践，为亚太和北美地区提供加速的技术细节

## 准备工作

- 支持按地区解析的DNS（此处演示为DNSPod）
- ZBProxy
- 能够很好的与源服务器进行连接的分流服务器

## 部署ZBProxy

官方文档：[https://launium.com/doc/ZBProxy](https://launium.com/doc/ZBProxy)

演示环境：
- 源：中国香港的Velocity服务
- 分流：日本优质线路服务器 + Debian 10系统

```bash
root@ser5858914386:~# ./tcping 47.xxx.xxx.xxx 25565
Host is: 47.xxx.xxx.xxx:25565
Reply from 47.xxx.xxx.xxx (47.xxx.xxx.xxx) on port 25565 TCP_conn=1 time=50.90ms
Reply from 47.xxx.xxx.xxx (47.xxx.xxx.xxx) on port 25565 TCP_conn=2 time=50.42ms
Reply from 47.xxx.xxx.xxx (47.xxx.xxx.xxx) on port 25565 TCP_conn=3 time=50.47ms
Sent= 3, Success= 3, Failed= 0(0% Fail)
Minimum= 50.42ms, Maximum= 50.90ms, Average= 50.60ms

Port: 25565 is Opening...
```

### 下载，配置

ZBProxy需要在GitHub Actions下载（需要登录）
[https://github.com/layou233/ZBProxy/actions](https://github.com/layou233/ZBProxy/actions)

将下载的ZBProxy上传到服务器，此处我上传的位置为 `/opt/zbproxy`

```bash
root@ser5858914386:/opt/zbproxy# ls
ZBProxy.json  ZBProxy-linux-amd64-v1
```

首先生成配置文件

```bash
chmod +x ZBProxy-linux-amd64-v1  # 赋予ZBProxy执行权限，此处改成你的文件
./ZBProxy-linux-amd64-v1  # 同上
```

此时同级目录已经生成了一个名为 `ZBProxy.json` 的文件
执行完毕后会自动进入运行状态，直接 `Ctrl+C` 结束，进入下一步配置

```json
{
    "Services": [
        {
            "Name": "XXX",  // 服务名称，随意
            "TargetAddress": "47.xxx.xxx.xxx",  // 要代理的目标地址，填写源地址
            "TargetPort": 25565,  // 要代理的目标端口
            "Listen": 25565,  // 监听端口
            "Flow": "auto",
            "IPAccess": {
                "Mode": ""
            },
            "Minecraft": {
                "EnableHostnameRewrite": true,
                "EnableHostnameAccess": false,
                "OnlineCount": {
                    "Max": -1,
                    "Online": -1,
                    "EnableMaxLimit": false
                },
                "NameAccess": {
                    "Mode": ""
                },
                "AnyDestSettings": {},
                "PingMode": "",
                "MotdFavicon": "", // 覆盖上游图标
                "MotdDescription": "" // 覆盖上游MOTD
            },
            "TLSSniffing": {
                "RejectNonTLS": false
            },
            "Outbound": {
                "Type": ""
            }
        }
    ],
    "Lists": {}
}
```

关于SLP返回覆盖的内容，经询问作者回答：

> 留空 MotdFavicon 和 MotdDescription 即可。也可以直接删除 Minecraft 模块使其作为端口转发。
> 以上两种方式皆会使 PingMode 失效，并使服务器列表显示玩家到游戏服务器的真实延迟。

### 写入服务

此处演示systemd版本

```bash
vim /usr/lib/systemd/system/zbproxy.service
```

```ini
[Unit]
After=network.target
Wants=network.target

[Service]
WorkingDirectory=/opt/zbproxy
ExecStart=/opt/zbproxy/ZBProxy-linux-amd64-v1
Restart=always
RestartSec=5s
KillMode=mixed
StandardError=syslog

[Install]
WantedBy=multi-user.target
```

立即启用

```bash
systemctl enable --now zbproxy.service
```

## DNS分流

登录DNSPod，找到自己域名，添加对应记录并修改 `线路类型`
e.g.

![Record](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328c738bcd0.webp)
