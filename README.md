# 🌧️ 夏雨天 | 动态交互式个人主页

一个采用 Liquid Glass 设计语言、支持空间交互与弹簧物理动画的个人主页。

**在线预览**: [https://xsfnb.pages.dev](https://xsfnb.pages.dev)

![screenshot](1.png)

## ✨ 特性

- 🎨 **Liquid Glass 视觉** — 毛玻璃质感、动态光效、噪点纹理
- 🎵 **自定义音乐播放器** — 支持播放列表、进度拖拽、音量控制、Media Session 集成
- 🌍 **多语言切换** — 简中 / 繁中 / 日本語 / English
- 🌤️ **实时天气与地理位置** — 基于访客 IP 自动展示
- 🌓 **深色/浅色主题** — 自动跟随系统偏好，支持手动切换
- 🖱️ **空间交互引擎** — 3D 卡片倾斜、磁性按钮、光标辉光（桌面端）
- ⌨️ **键盘快捷键** — 空格播放/暂停，左右箭头切歌
- 📱 **响应式布局** — 完美适配移动端

## 🚀 技术栈

- 原生 HTML5 / CSS3 / JavaScript (ES6+)
- CSS 自定义属性实现主题系统
- Web Audio API + Media Session API
- WeatherAPI + ipapi 地理位置服务

## 🛠️ 快速开始

无需构建工具，直接打开 `index.html` 即可本地预览：

```bash
git clone https://github.com/xsfnb/myhome.git
cd myhome
# 直接用浏览器打开 index.html，或使用任意静态服务器
npx serve .


