---
title: Flutter实现Monet莫奈取色
date: 2024-08-29T06:45:30+08:00
tags:
    - Flutter
    - Monet
---
Flutter 的 Material Design 3 居然没自带 Monet 取色，这就比较难受

## 添加依赖包

需要用到的是 `dynamic_color`

```shell
flutter pub add dynamic_color
```

根据官方说明，各个平台取色方式如下：

Android S+: 用户壁纸颜色
Linux: GTK+ 主题的 @theme_selected_bg_color
macOS: 应用程序的 accent color
Windows: accent color 或者 window/glass color

## 修改入口文件

修改你的 `main.dart` ，一个完整的示例如下：

```dart
import 'package:dynamic_color/dynamic_color.dart';
import 'package:flutter/material.dart';

void main() async {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // 默认主题色种子
  static const _defaultColorSeed = Colors.blueAccent;

  // 根组件
  @override
  Widget build(BuildContext context) {
    Get.put(ProgressbarController());
    // Monet 取色
    return DynamicColorBuilder(
      builder: (ColorScheme? lightDynamic, ColorScheme? darkDynamic) {
        ColorScheme lightColorScheme;
        ColorScheme darkColorScheme;

        if (lightDynamic != null && darkDynamic != null) {
          // 亮色模式 Monet 取色
          lightColorScheme = lightDynamic.harmonized();
          // 暗色模式 Monet 取色
          darkColorScheme = darkDynamic.harmonized();
        } else {
          // Fallback 颜色，当不支持 Monet 取色的时候使用
          lightColorScheme = ColorScheme.fromSeed(
            seedColor: _defaultColorSeed,
          );
          darkColorScheme = ColorScheme.fromSeed(
            seedColor: _defaultColorSeed,
            brightness: Brightness.dark,
          );
        }
        // 覆盖取色后的颜色可以用 ColorScheme.copyWith(); 方法 
        // lightColorScheme.copyWith(secondary: Color.blue);

        return GetMaterialApp(
          title: 'Monet Example',
          // 亮色模式主题，直接调用获取到的 ColorScheme
          theme: ThemeData(
            useMaterial3: true,
            colorScheme: lightColorScheme,
            // ...
          ),
          // 暗色模式主题，同上
          darkTheme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.dark,
            colorScheme: darkColorScheme,
            // ...
          ),
          // 设置主题跟随系统
          themeMode: ThemeMode.system,
          // ...
        );
      },
    );
  }
}
```

接下来，热重载应用程序即可看到效果~
