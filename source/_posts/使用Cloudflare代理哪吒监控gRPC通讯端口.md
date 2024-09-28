---
title: 使用Cloudflare代理哪吒监控gRPC通讯端口
date: 2024-02-18T08:33:16+08:00
tags:
    - 哪吒监控
    - 教程
---
## 前置工作

- 部署哪吒监控面板端

## 步骤

官方文档：[https://nezha.wiki/guide/q3.html](https://nezha.wiki/guide/q3.html)

### 开启Cloudflare gRPC连接功能

前往 `你的账户` -> `网站` -> `你的域名` -> `网络` -> `gRPC` 开启gRPC连接功能
![gRPC](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328e47e2a60.webp)

### 配置反向代理

nginx配置文件

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name bound-in-svs.1l1.icu; # 你的 Agent 连接 Dashboard 的域名
    
    ssl_certificate /www/sites/bound.in.svs.1l1.icu/ssl/fullchain.pem;   # 你的证书路径
    ssl_certificate_key /www/sites/bound.in.svs.1l1.icu/ssl/privkey.pem; # 你的私钥路径
    ssl_stapling on;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m; # 此项可能会和其他配置文件冲突，如冲突请注释此项
    ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;

    underscores_in_headers on;

    keepalive_time 24h;
    keepalive_requests 100000;
    keepalive_timeout 120s;

    location / {
        grpc_read_timeout 300s;
        grpc_send_timeout 300s;
        grpc_socket_keepalive on;
        grpc_pass grpc://grpcservers;
    }
}

upstream grpcservers {
    server localhost:5555;
    keepalive 512;
}
```

### 修改Dashboard配置

如果不需要修改一键安装时使用的连接地址可跳过

```sh
vim /opt/nezha/dashboard/data/config.yaml
```

将下面的信息修改为你的连接地址

```yaml
GRPCHost: in.svs.1l1.icu # 请改为自己的地址
GRPCPort: 443
```

### Agent设置

请将信息改成自己的连接地址
直接复制面板的一键脚本安装即可
举个例子：

```sh
curl -L https://raw.githubusercontent.com/naiba/nezha/master/script/install.sh -o nezha.sh && chmod +x nezha.sh && sudo ./nezha.sh install_agent in.svs.1l1.icu 443 <TOKEN>
```

如果是手动安装的Agent，验证是否成功：

```sh
cd /opt/nezha/agent # 打开存放Agent的目录
./nezha-agent -s in.svs.1l1.icu:443 -p <TOKEN> -d # 加上 -d 这个参数输出日志
```

如果配置成功可以看到正常连接了
![Connected](https://apac-cloudflare-r2-img.1l1.icu/2024/05/02/66328e490b8af.webp)
