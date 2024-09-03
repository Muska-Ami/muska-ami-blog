---
title: 自建Tailscale DERP服务教程
date: 2024-04-08T11:14:03+08:00
tags:
    - Tailscale
    - DERP
    - 教程
---
## 准备工作

- 准备一台 `1C1G` 以上配置的服务器（内存不足1G编译netns时可能会爆）
- 服务器能开放stun的端口 `UDP/3478`
- 一个域名
- (可选)SSL证书

## 防火墙放行端口

iptables/nftables和服务器安全组都要放行以下端口：

- `UDP/3478`
- `TCP/<PORT>`

`<PORT>` 请改为一个你需要的端口

## 安装Tailscale客户端

如果你要搭建的是公共的Tailscale DERP服务，不需要鉴权，这一步可以跳过

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

## 安装Golang

请确保不存在旧版Golang

### 查看最新版本

前往Golang官网查看最新版本号
<https://go.dev/doc/install>

### 查看服务器架构

使用 `uname` 查询架构:

```bash
uname -m
```

我的服务器架构返回为 `x86_64` ，那么我下载对应的 `amd64` 版本

### 安装

```bash
# 下载最新版Golang
wget https://go.dev/dl/go<LATEST>.linux-<ARCH>.tar.gz
# 解压
sudo tar -C /usr/local -xzf $HOME/go*.tar.gz
```

#### 添加环境变量

在你的 `/etc/profile` 添加以下两行：

```profile
export GOROOT=/usr/local/go
export GOPATH=/usr/local/gopath
export GOBIN=$GOPATH/bin
export PATH=$PATH:$GOROOT/bin
export PATH=$PATH:$GOPATH/bin
```

刷新当前环境

```bash
source /etc/profile
# 检查是否生效
go version
```

返回

```log
go version go1.22.2 linux/amd64
```

## 安装Derper

```bash
mkdir -p /opt
mkdir -p /opt/derper
mkdir -p /usr/local/gopath/bin
# 如果你的服务器在境内，可以为Go配置代理加速
#go env -w GOPROXY=https://goproxy.cn,direct
go install tailscale.com/cmd/derper@main
```

### 启停脚本

#### 创建启动脚本

新建 `/opt/derper/runderper` 文件
如果你需要SSL，把SSL证书上传到 `/usr/local/cert` 文件夹
证书命名格式为 `<DOMAIN>.<SUFFIX>`
将证书文件后缀改为 `crt` ，密钥文件后缀改为 `key`

```sh
#!/bin/sh
cd /usr/local/gopath/bin
nohup ./derper -hostname <DOMAIN> -c=derper.conf -a :<PORT> -http-port -1 -certdir /usr/local/cert -certmode manual -verify-clients -stun > console.log 2>&1 &
echo $! > app.pid
```

如果你不需要SSL，直接写入以下内容

```sh
#!/bin/sh
cd /usr/local/gopath/bin
nohup ./derper -hostname <DOMAIN> -c=derper.conf -a :<PORT> manual -verify-clients -stun > console.log 2>&1 &
echo $! > app.pid
```

如为公共服务，请去掉 `-verify-clients` 参数

#### 创建停止脚本

新建 `/opt/derper/stopderper` 文件

```sh
#!/bin/sh
kill `cat app.pid`
rm -rf app.pid
```

#### 赋予执行权限

```bash
chmod +x /opt/derper/*
#chmod +x /opt/derper/runderper
#chmod +x /opt/derper/stopderper
```

### 创建服务

新建 `/etc/systemd/system/derper.service` 文件

```ini
[Unit]
Description=Derper服务
After=network.target
 
[Service]
Type=forking
ExecStart=/opt/derper/runderper
ExecStop=/opt/derper/stopderper
 
[Install]
WantedBy=multi-user.target
```

#### 设置开机自启并立即启动

```bash
systemctl enable --now derper.service
```

```log
● derper.service - Derper服务
     Loaded: loaded (/etc/systemd/system/derper.service; enabled; preset: enabled)
     Active: active (running) since Mon 2024-04-08 11:57:16 CST; 8s ago
    Process: 46785 ExecStart=/opt/derper/runderper (code=exited, status=0/SUCCESS)
   Main PID: 46786 (derper)
      Tasks: 7 (limit: 2306)
     Memory: 3.1M
        CPU: 24ms
     CGroup: /system.slice/derper.service
             └─46786 ./derper -hostname <DOMAIN> -c=derper.conf -a :<PORT> -http-port -1 manual -verify-clients >

Apr 08 11:57:16 ser982097183781 systemd[1]: Starting derper.service - Derper服务...
Apr 08 11:57:16 ser982097183781 systemd[1]: Started derper.service - Derper服务.
```

## 添加到Tailscale

在你的Tailscale管理界面找到 `Access Controls` ([点我直达](https://login.tailscale.com/admin/acls/file))
在其中插入片段，示例如下

```json
{
    "acls": [
    // ...
    ],
    "ssh": [
        // ...
    ],
    // ...
    "derpMap": {
        "Regions": {
            "900": {
                "RegionID":   900, // 900以上
                "RegionCode": "cni-hb", // 区域代码，会在 `tailscale netcheck` 显示
                "RegionName": "中国-湖北", // 区域名称，会在 `tailscale netcheck` 显示
                "Nodes": [
                    {
                        "Name":     "1",
                        "RegionID": 900, // 对应上方ID
                        "HostName": "xxxxx.xxx", // 填写你的DERP服务域名
                        "DERPPort": 12345, // 你的DERP服务端口
                    },
                ],
            },
            // 更多DERP节点
        },
    },
    // ...
}

```

使用 `tailscale netcheck` 检查，发现多出自建DERP，成功

```log
Report:
        * UDP: true
        * IPv4: yes, xxx.xxx.xxx.xxx:xxxxx
        * IPv6: no, but OS has support
        * MappingVariesByDestIP: false
        * HairPinning: true
        * PortMapping:
        * Nearest DERP: 美国
        * DERP latency:
                - usa: 700µs   (美国) # 此处为我教程演示的DERP
                - lax: 1ms     (Los Angeles)
                - sfo: 13.1ms  (San Francisco)
                - sea: 32.3ms  (Seattle)
                - den: 34.5ms  (Denver)
                - nyc:         (New York City)
                - sin:         (Singapore)
                - fra:         (Frankfurt)
                - syd:         (Sydney)
                - blr:         (Bangalore)
                - tok:         (Tokyo)
                - lhr:         (London)
                - dfw:         (Dallas)
                - sao:         (São Paulo)
                - ord:         (Chicago)
                - ams:         (Amsterdam)
                - jnb:         (Johannesburg)
                - mia:         (Miami)
                - par:         (Paris)
                - mad:         (Madrid)
                - hkg:         (Hong Kong)
                - tor:         (Toronto)
                - waw:         (Warsaw)
                - dbi:         (Dubai)
                - hnl:         (Honolulu)
                - nai:         (Nairobi)
                - cni-hb:         (中国-湖北)
                - cnh:         (中国香港)
```
