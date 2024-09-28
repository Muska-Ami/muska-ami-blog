---
title: 在OpenWrt上配置Tailscale接口实现NAT+NAT6接入访问Tailscale内网
date: 2024-05-09T11:47:36+08:00
tags:
    - Tailscale
    - OpenWrt
    - 组网
    - 教程
---
## 需求

只需要使得客户端无需安装Tailscale即可访问内网

## 实现

假设你已经安装好了Tailscale
iStoreOS可以直接在iStore安装，其他发行版可参考：
<https://github.com/CH3NGYZ/tailscale-openwrt>

### 新建防火墙区域

`网络` -> `防火墙` 新建一个防火墙区域，命名随意，我这里命名为 `vpnet`

- 入站数据 接受
- 出战数据 接受
- 转发 接受
- IP动态伪装
- MSS钳制

根据需要配置转发
![Firewall](https://apac-cloudflare-r2-img.1l1.icu/2024/05/09/663c484c0c0bf.webp)

### 创建接口

`网络` -> `接口` 创建新接口，我这里命名为 `tsnet`
协议选择 `静态地址` ，设备选择 `tailscale0`
IPv4和IPv6地址分别填写Tailscale发给OpenWrt设备的IP，子网掩码无需指定
![Interface](https://apac-cloudflare-r2-img.1l1.icu/2024/05/09/663c498952736.webp)

此时保存并应用后，你应该可以正常访问你的内网了

### 配置MagicDNS

如果你不使用MagicDNS功能，那么你已经完成了
如果你需要MagicDNS，请按如下配置

假设你使用Dnsmasq作为DNS服务器

`网络` -> `DHCP/DNS(或者Dnsmasq)`
常规设置的DNS转发中添加：

```bash
# e.g. /*.example.ts.net/100.100.100.100
/*.<你的Tailnet name>/100.100.100.100
```

Tailnet name可在 <https://login.tailscale.com/admin/dns> 找到

此时我们访问其他设备可以通过MagicDNS域名访问
