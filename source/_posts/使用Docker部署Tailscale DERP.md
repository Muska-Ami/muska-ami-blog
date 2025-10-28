---
title: 使用Docker部署Tailscale DERP
date: 2024-07-26T03:07:33+08:00
tags:
    - Tailscale
    - DERP
    - 教程
---
## 准备工作

- 一台能够跑Docker的服务器
- 服务器能开放stun的端口 `UDP/3478`
- 一个域名
- (可选)SSL证书

本文假设服务器发行版为普通 Debian 12

> Docker 近期国内访问困难，以下是截止本文发布时可用的镜像：
>
> - docker.1panel.live
> - dockerhub.icu
>
> 关于 Docker 及 Docker Compose 安装本文不再赘述，请自行查阅其他文档。

## 防火墙放行端口

iptables/nftables和服务器安全组都要放行以下端口：

- `UDP/3478`
- `TCP/<PORT>`

`<PORT>` 请改为一个你需要的端口

## （可选）安装 Tailscale

此步骤用于鉴权，若你搭建的是公开 DERP 服务，那么可以跳过。

更新: 如果你想使用容器版本的 Tailscale，那么也可以跳过此步，往下一步有更多说明。

```sh
curl -fsSL https://tailscale.com/install.sh | sh
```

## 写入 Docker Compose

创建 Derper 文件夹：

```sh
mkdir -p /opt/derper
mkdir -p /opt/derper/cert # 证书目录
```

请将 `<PORT>` 替换为你希望的 DERP 端口，`<HOST>` 替换为你希望的 DERP 连接域名。
本文假设你需要 SSL，故写入证书相关。关于证书请继续往下。若不需要 SSL，请自行移除 `-certdir=/cert/ -certmode=manual` 部分。
如果需要搭建的为公共 DERP，请移除 `-verify-clients` 部分。

如果你不需要鉴权，无需关心 Tailscale 客户端安装方式，因为并不需要安装。
如果你需要让 DERP 获取真实 IP，请将网络模式改为 `host` 模式（修改 STUN 端口可用 `-stun-port` 参数指定）。

### 使用宿主机 Tailscale 客户端鉴权

```yaml
services:
  derper:
    image: qctt/derper
    container_name: derper
    restart: unless-stopped
    ports:
      - "<PORT>:443"
      - "3478:3478/udp"
    volumes:
      - ./cert/:/cert/ # 证书目录
      - /var/run/tailscale/tailscaled.sock:/var/run/tailscale/tailscaled.sock:ro # 用于给私有DERP鉴权
    command: /derper -stun -a 0.0.0.0:443 -hostname <HOST> -certdir=/cert/ -certmode=manual -verify-clients
```

### 使用容器版本 Tailscale 鉴权

```yaml
services:
  tailscale_client:
    image: tailscale/tailscale:latest 
    container_name: derper-tailscale-client
    restart: unless-stopped

    volumes:
      - ./tailscale:/var/lib/tailscale
    environment:
      - TS_USERSPACE=true # 使用 userspace mode 以便无需映射 tun
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_SOCKET=/var/lib/tailscale/run.sock # tailscaled socket

  derper:
    image: qctt/derper
    container_name: derper
    restart: unless-stopped
    ports:
      - "<PORT>:443"
      - "3478:3478/udp"

    volumes:
      - ./cert/:/cert/ # 证书目录
      - ./tailscale/run.sock:/var/run/tailscale/tailscaled.sock:ro # 用于给私有DERP鉴权
    command: /derper -stun -a 0.0.0.0:443 -http-port -1 -hostname <HOST> -certdir=/cert/ -certmode=manual -verify-clients
```

使用 `docker compose logs tailscale_client -f` 查看 Tailscale 客户端的日志获取登录链接进行授权，或者使用 `TS_AUTH_KEY` 来授权。

## 关于证书

证书及私钥文件名为：

- \<HOST\>.crt
- \<PORT\>.key

如果你和我一样使用 1Panel 申请和管理证书，那么你可以在证书申请的配置中勾选 `推送证书到本地目录` 和 `申请证书之后执行脚本`，并填入：

推送证书到本地目录:

```text
/opt/derper/cert
```

申请证书之后执行脚本:

```sh
mv /opt/derper/cert/fullchain.pem /opt/derper/cert/<HOST>.crt
mv /opt/derper/cert/privkey.pem /opt/derper/cert/<PORT>.key
```

## 启动 Derper 服务

```sh
cd /opt/derper
docker-compose up -d
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
                "RegionCode": "cni-zj-nb", // 区域代码，会在 `tailscale netcheck` 显示
                "RegionName": "中国-湖北", // 区域名称，会在 `tailscale netcheck` 显示
                "Nodes": [
                    {
                        "Name":     "zj-nb-1", // 随意填写
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
        * MappingVariesByDestIP: true
        * PortMapping:
        * CaptivePortal: false
        * Nearest DERP: 中国-湖北-崇阳
        * DERP latency:
                - cni-hb-cy: 41.4ms  (中国-湖北-崇阳)
                - cni-zj-nb: 59.6ms  (中国-浙江-宁波)
                - lax: 239.7ms (Los Angeles)
                - sfo: 245.8ms (San Francisco)
                - sea: 251.3ms (Seattle)
                - den: 255.6ms (Denver)
                - tor: 267ms   (Toronto)
                - dfw: 269ms   (Dallas)
                - ord: 269.5ms (Chicago)
                - hnl: 271.7ms (Honolulu)
                - nyc: 278.9ms (New York City)
                - mia: 286.8ms (Miami)
                - tok: 336.3ms (Tokyo)
                - lhr: 343.1ms (London)
                - cnh: 361ms   (中国香港)
                - par: 361.5ms (Paris)
                - fra: 364ms   (Frankfurt)
                - mad: 366.2ms (Madrid)
                - syd: 370.7ms (Sydney)
                - ams: 377.1ms (Amsterdam)
                - waw: 380.1ms (Warsaw)
                - hkg: 386.6ms (Hong Kong)
                - sin: 400ms   (Singapore)
                - sao: 404ms   (São Paulo)
                - blr: 463.2ms (Bangalore)
                - dbi: 466.5ms (Dubai)
                - nai: 509.7ms (Nairobi)
                - jnb: 518.5ms (Johannesburg)
                - usa:         (美国)
```
