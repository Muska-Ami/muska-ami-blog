---
title: Spring AOP 实现为添加指定注解接口方法进行前置鉴权
date: 2024-12-04T12:27:41+08:00
tags:
    - Spring Boot
    - Spring AOP
    - 教程
---
## 需求概述

我们现在需要添加一个注解，实现 Controller 下接口方法包含此注解时，前置鉴权条件，满足条件才执行接口逻辑

## 思路

1. 新建一个注解，如 `@NeedAuthentication`
2. 添加一个 AspectJ 逻辑，指定 Spring AOP 切面注入方法
3. 新建自定义异常，当验证不通过时抛出一个异常来终止执行
4. 添加一个全局异常处理用于处理自定异常类型，返回未授权

## 实现

直接上代码:

### NeedAuthentication.java

```java
package moe.muska.ami.demo.annotation;

import java.lang.annotation.*;

// 声明注解所需的内容
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface NeedAuthentication {
    // 可以根据需要添加参数，并在之后的逻辑通过 reflect 获取使用
}
```

### AuthenticationAspect.java

```java
package moe.muska.ami.demo.aspect;

import moe.muska.ami.demo.exception.UnauthorizedException;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuthenticationAspect {

    // 设置 AOP 切面
    // @annotation 代表注解
    @Pointcut("@annotation(moe.muska.ami.demo.annotation.NeedAuthentication)")
    public void needAuthenticationMethods() {}

    // 定义前置逻辑
    @Before("needAuthenticationMethods()")
    public void doAuth() {
        // 获取请求
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        assert attributes != null;
        HttpServletRequest request = attributes.getRequest();

        // 主鉴权逻辑

        // 请求参数
        String requestUserId = request.getParameter("user_id");
        String bearerToken = request.getHeader("Authorization");

        if (requestUserId == null) throw new UnauthorizedException(null);
        if (bearerToken == null) throw new UnauthorizedException(null);
        long userId;
        try {
            userId = Long.parseLong(requestUserId);
        } catch (NumberFormatException e) {
            throw new UnauthorizedException("Authentication data type mismatch.");
        }
        // 示例判断是否授权
        if (!authorize(userId, bearerToken)) throw new UnauthorizedException(null);
    }

    /**
     * 校验权限
     */
    private boolean authorize(long userId, String bearerToken) {
        // Demo 就不写具体逻辑了，可以自己改为 false 查看授权失败是否返回正常
        return true
    }

}

```

### UnauthorizedException.java

```java
package moe.muska.ami.demo.exception;

// 创建一个自定义异常
public class UnauthorizedException extends RuntimeException {
    // 如果你不需要返回消息，可以去除 super 字段的逻辑
    public UnauthorizedException(String message) {
        super(message);
    }
}
```

### AspectExceptionHandler.java

```java
package moe.muska.ami.demo.controller;

import moe.muska.ami.demo.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

// 自定义异常处理
@RestControllerAdvice
public class AspectExceptionHandler {

    // 设置异常类型为自定义异常类型
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> onHttpRequestMethodNotSupportedException(UnauthorizedException ex) {
        // 根据实际需求返回对应类型数据
        // 以下只是例子，请结合实际应用
        return builder.unauthorized();
    }

}
```

### Application.java

```java
package moe.muska.ami.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

// 开启 AspectJ 自动代理
@EnableAspectJAutoProxy
public class Application {
    public static void main(String[] args) {
        // ...
        SpringApplication.run(Application.class, args);
    }
}
```

都写在注释里了，可以自己研究一下
