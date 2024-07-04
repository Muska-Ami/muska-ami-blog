---
title: 用正确的姿势给你的Minecraft Velocity群组服配置Simple Voice Chat语音聊天
date: 2024-07-04T21:44:23+08:00
tags:
    - 教程
    - Simple Voice Chat
---
Simple Voice Chat 是一个可以让玩家通过语音聊天的模组。
![Modrith](https://modrinth.com/plugin/simple-voice-chat)

## 下载并为子服务器安装

首先我们需要在子服务器上安装 Simple Voice Chat。
下载对应版本的插件/模组加载即可。

启动后会生成配置文件，由于我是异地部署，所以需要修改几个配置项目：

```properties
# 语音端口可改可不改，我这里有几个子服务器是NAT的所以修改成方便的端口
port=<语音端口>
# 同一台服务器可以不写
voice_host=<子服务器公网地址>
```

然后我们需要在防火墙放行对应的端口（UDP协议），如果是NAT转发，最好要确保转发端口和源端口一致（博主测试不一致貌似没法连接）

## 为代理服务器安装

下载对应版本安装到代理服务器上。
如果没有需求不需要对配置做修改。

如果你和我一样专门为语音服务做了一个专门的地址（比如 `voice.example.com`），那么需要在配置中修改：

```properties
# 没有单独设置的话不写
voice_host=voice.example.com:<代理服务器设置的语音端口>
```

然后我们需要在防火墙放行对应的端口（UDP协议）

## 完成

客户端安装对应模组，加入游戏即可语音聊天。
