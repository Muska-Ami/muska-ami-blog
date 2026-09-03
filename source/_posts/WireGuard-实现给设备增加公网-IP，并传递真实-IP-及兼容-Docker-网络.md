---
title: WireGuard 实现给设备增加公网 IP，配置 NAT 上网，并传递来源 IP 及兼容 Docker 网络
date: 2026-09-03 17:05:05
tags:
    - WireGuard
    - 网络
    - Docker
---
本次使用场景两台服务器均为 Debian 13 系统。

## 准备

- 一台带有公网的入口服务器
- 一台能和有公网的服务器通讯的设备，本次为我的 MC 服务器
- 灵巧的双手

本次示例网段为 `192.168.100.0/24` 及 `fd00:1:100::/64`，可根据需要修改
默认为 IPv4/IPv6 双栈的配置，如果不需要任意一种网络栈协议可以去除对应的 IP

### 生成密钥对

我们需要为入口机器和对端设备分别生成一对密钥对，用于 WireGuard 配置
文件名可以随意，我们只需要其中的密钥用于配置对端

```shell
## 分别生成两对密钥对
wg genkey | tee inbound.private.key | wg pubkey > inbound.public.key
wg genkey | tee serviceprovider.private.key | wg pubkey > serviceprovider.public.key

# 稍后读取可以使用 cat 命令获得密钥对内容
# cat inbound.private.key
```

请保存好密钥，稍后我们需要使用

### 开启转发

无论如何，我们都需要在两台机器上先开启转发，否则无法成功传递数据包。
需要编辑 `/etc/sysctl.conf`，加入两个配置项

```conf
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1
```

随后 `sysctl -p` 生效

## 入口机器

我们在入口机器要做以下几点：

1. 与需要添加公网的设备建立对端
2. 将所需端口通过 WireGuard 隧道转发给对端对应端口
3. 为设备配置 NAT 上网（可选，如果你不需要提供上网服务）

### 对端的基本配置

我们需要编写一份配置，与目标设备建立对端，这里任意一方发起均可，如果目标设备没有固定 IP，或策略路由所需，则需要目标设备主动发起。

```conf
# 入口配置
[Interface]
## 为入口机器分配一个内网虚拟 IP
Address = 192.168.100.1/24, fd00:1:100::1/64
## 填写一份私钥
PrivateKey = <入口设备的私钥>
## 这里是监听的端口，取决于实际环境需要自行修改
ListenPort = 35350

[Peer]
## 填写需要添加公网 IP 的设备的公钥，注意不要写成本机的
PublicKey = <对端设备的公钥>
## 允许对端设备的 IP 被写入路由，根据实际分配修改
AllowedIPs = 192.168.100.2/32, fd00:1:100::2/128
## 根据实际需要确定是否要配置，格式为 <HOST>:<PORT>
#Endpoint = <对端端点>
## 根据实际需要确定是否开启保活
#PersistentKeepalive = 25
```

### 配置 iptables 转发

上面我们已经完成了一份配置，接下来我们需要添加 `PostUp` 和 `PostDown` 来配置 iptables 把流量 NAT 到提供服务的设备的虚拟 IP 上，以便提供服务。
这里无论是白名单还是黑名单导向都可以，我这里只需要转发几个端口，所以只配置了几条规则，可以根据自身需要配置。

```conf
# 请配置在 Interface 块内
[Interface]
## 转发规则
### 不同网络栈需要分别配置 iptables 和 ip6tables
### --dport 是 DNAT 转发本机本地的端口，--to-destination 指向目标机器
### 这里的示例转发的是 80 端口
PostUp = iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.100.2
PostUp = ip6tables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination [fd00:1:100::2]

## 退出清理规则
PostDown = iptables -t nat -D PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.100.2
PostDown = ip6tables -t nat -D PREROUTING -p tcp --dport 80 -j DNAT --to-destination [fd00:1:100::2]
```

### 配置 MASQUERADE 地址伪装

这一步主要是为了上网，如果你的接口不需要给提供服务的设备再提供上网，这个可以忽略。

```conf
[Interface]
PostUp = iptables -t nat -A POSTROUTING -s 192.168.100.2/32 -j MASQUERADE
PostUp = ip6tables -t nat -A POSTROUTING -s fd00:1:100::2/128 -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -s 192.168.100.2/32 -j MASQUERADE
PostDown = ip6tables -t nat -D POSTROUTING -s fd00:1:100::2/128 -j MASQUERADE
```

### 配置 MSS 钳制（可选）

如果你发现某些时候有点不正常，但是没感觉有啥毛病，那应该是 MTU 问题，可以尝试 MSS 钳制，或者干脆调整一下 MTU。

```conf
[Interface]
# MSS 钳制
## v4
PostUp = iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostUp = iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = iptables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = iptables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
## v6
PostUp = ip6tables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostUp = ip6tables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = ip6tables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = ip6tables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
```

### 成品配置

综合上述配置，我们可以获得一份成品配置：

```conf
# 入口配置
[Interface]
Address = 192.168.100.1/24, fd00:1:100::1/64
PrivateKey = <私钥>
ListenPort = 35350

# 转发规则
PostUp = iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.100.2
PostUp = iptables -t nat -A POSTROUTING -s 192.168.100.2/32 -j MASQUERADE

PostUp = ip6tables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination [fd00:1:200::2]
PostUp = ip6tables -t nat -A POSTROUTING -s fd00:1:100::2/128 -j MASQUERADE

# 退出清理规则
PostDown = iptables -t nat -D PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.100.2
PostDown = iptables -t nat -D POSTROUTING -s 192.168.100.2/32 -j MASQUERADE

PostDown = ip6tables -t nat -D PREROUTING -p tcp --dport 80 -j DNAT --to-destination [fd00:1:200::2]
PostDown = ip6tables -t nat -D POSTROUTING -s fd00:1:100::2/128 -j MASQUERADE

# MSS 钳制
PostUp = iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostUp = iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = iptables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = iptables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
PostUp = ip6tables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostUp = ip6tables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = ip6tables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = ip6tables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu

[Peer]
PublicKey = <对端设备的公钥>
AllowedIPs = 192.168.100.2/32, fd00:1:100::2/128
## 通常情况这个设备都是被动连接，因为大多数应该是为了动态的网络配置静态公网
## 但是如果你根据实际需要也可以配置
#Endpoint = <对端端点>
PersistentKeepalive = 25
```

## 需要增加公网 IP 的设备

我们需要在这个设备上配置这些项目：

1. 与公网 IP 机器对端
2. 为数据包打上 mark
3. 配置策略路由将数据包从哪来发回哪去

这里对端配置的编写我就省略了，详细内容写在配置里，可以自己参考

### 成品配置

```conf
[Interface]
Address = 192.168.100.2/24, fd00:1:100::2/64
PrivateKey = <本设备使用的私钥>
## 监听端口，根据实际确定是否要配置和修改
#ListenPort = 35350

## 注意这里我们把路由设置到了 200 这个 table，千万不能写入默认的路由表，否则此设备的网络将因为我们 AllowedIPs 的配置彻底爆炸
## 这里的 table 代号也可以根据需要修改，记得同步修改策略路由查的表
Table = 200

# 标记数据包做策略
## 这里打的 mark 是 0x51，可以根据自身需要修改
## v4
PostUp = ip rule add fwmark 0x51 lookup 200
### 这里的 -i 是必须的，否则会导致像 Docker 这样的网络环路而无法正常回包
PostUp = iptables -t mangle -A PREROUTING -i %i -m conntrack --ctstate NEW -j CONNMARK --set-mark 0x51
PostUp = iptables -t mangle -A PREROUTING ! -i %i -m connmark --mark 0x51 -j CONNMARK --restore-mark
PostUp = iptables -t mangle -A OUTPUT -m connmark --mark 0x51 -j CONNMARK --restore-mark

## v6
PostUp = ip -6 rule add fwmark 0x51 lookup 200
PostUp = ip6tables -t mangle -A PREROUTING -i %i -m conntrack --ctstate NEW -j CONNMARK --set-mark 0x51
PostUp = ip6tables -t mangle -A PREROUTING ! -i %i -m connmark --mark 0x51 -j CONNMARK --restore-mark
PostUp = ip6tables -t mangle -A OUTPUT -m connmark --mark 0x51 -j CONNMARK --restore-mark

# 退出清理
## v4
PostDown = iptables -t mangle -D PREROUTING -i %i -m conntrack --ctstate NEW -j CONNMARK --set-mark 0x51
PostDown = iptables -t mangle -D PREROUTING ! -i %i -m connmark --mark 0x51 -j CONNMARK --restore-mark
PostDown = iptables -t mangle -D OUTPUT -m connmark --mark 0x51 -j CONNMARK --restore-mark
PostDown = ip rule del fwmark 0x51 lookup 200

## v6
PostDown = ip6tables -t mangle -D PREROUTING -i %i -m conntrack --ctstate NEW -j CONNMARK --set-mark 0x51
PostDown = ip6tables -t mangle -D PREROUTING ! -i %i -m connmark --mark 0x51 -j CONNMARK --restore-mark
PostDown = ip6tables -t mangle -D OUTPUT -m connmark --mark 0x51 -j CONNMARK --restore-mark
PostDown = ip -6 rule del fwmark 0x51 lookup 200

# MSS 钳制
PostUp = iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostUp = iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = iptables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = iptables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
PostUp = ip6tables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostUp = ip6tables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = ip6tables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = ip6tables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu

[Peer]
PublicKey = <公网 IP 机器的公钥>
## 这里配置允许的 IP 一定是要加入 0.0.0.0/0 及 ::/0 的，否则传入的数据包将被丢弃
AllowedIPs = 192.168.100.1/32, 0.0.0.0/0, fd00:1:100::1/128, ::/0
## 通常是公网 IP 设备的对端地址，<HOST>:<PORT>
Endpoint = <对端端点>
PersistentKeepalive = 25
```

### 配置 MSS 钳制（可选）

同上，如果你发现某些时候有点不正常，但是没感觉有啥毛病，那应该是 MTU 问题，可以尝试 MSS 钳制，或者干脆调整一下 MTU。

```conf
[Interface]
# MSS 钳制
## v4
PostUp = iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostUp = iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = iptables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = iptables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
## v6
PostUp = ip6tables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostUp = ip6tables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = ip6tables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -o %i -j TCPMSS --clamp-mss-to-pmtu
PostDown = ip6tables -t mangle -D FORWARD -p tcp --tcp-flags SYN,RST SYN -i %i -j TCPMSS --clamp-mss-to-pmtu
```

## 一些备注

- 无论 `Endpoint` 还是 `ListenPort`，单方面或者双向配置都是没问题的
- MSS 钳制不是必须的，但为了保险我在成品配置默认配置了
- 请注意，UDP 流量是不能配置 MSS 钳制的
- 如果你需要转发类似 DMZ 一样的效果，最好是黑名单模式更方便，只拉黑部分端口不转发其他全转发
- `Table` 的配置很关键，请不要略过
