---
title: Spring WebSocket 与 Spring Cloud Gateway 同时使用踩坑及修复
date: 2025-06-14T21:57:47+08:00
tags:
  - Spring Cloud
---
## 未配置协议导致只转发 HTTP

解决方法是把协议从 `lb://` 改为 `lb:ws(s)://`

```yaml
spring:
  cloud:
    gateway:
      server:
        webflux:
          routes:
            - id: api-service
              uri: lb:ws://API # <-- Here
              predicates:
                - Path=/default/**
              filters:
                - StripPrefix=1
```

## class org.apache.catalina.connector.ResponseFacade cannot be cast to class reactor.netty.http.server.HttpServerResponse (org.apache.catalina.connector.ResponseFacade and reactor.netty.http.server.HttpServerResponse are in unnamed module of loader 'app')

参见 [spring-cloud/spring-cloud-gateway#2039](https://github.com/spring-cloud/spring-cloud-gateway/issues/2039)

依赖冲突，我这里是 `spring-boot-starter-web` 引入了 Tomcat Embed Core 导致 Gateway 使用 Tomcat 而不是 Netty，解决方案是排除依赖项：

```kts
dependencies {
    implementation(rootProject.libs.spring.boot.starter.web) {
        exclude(group = "org.apache.tomcat.embed", module = "tomcat-embed-core") // <-- Here
    }
}
```

> 可以使用命令
>
> ```shell
> ./gradlew <项目>:dependencies --configuration runtimeClasspath > dependencies_runtime.txt
> ```
>
> 输出运行时依赖关系，查找是哪个依赖引入了 Tomcat Embed Core
