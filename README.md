# 🌧️ 夏雨天 | 动态交互式个人主页
![访问人数](https://count.getloli.com/get/@xsfnb-myhome)


一个采用 **Liquid Glass** 设计语言、支持空间交互与弹簧物理动画的个人主页。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/xsfnb/myhome)](https://github.com/xsfnb/myhome/stargazers)

**在线预览**: [https://xsfnb.pages.dev](https://xsfnb.pages.dev)

![预览](https://duk.tw/jo6eZn.jpg)

---

## ✨ 特性

- 🎨 **Liquid Glass 视觉** — 毛玻璃质感、动态光效、噪点纹理，营造沉浸式空间感
- 🎵 **自定义音乐播放器** — 支持播放列表、进度拖拽、音量控制、Media Session 集成（可响应系统媒体控制）
- 🌍 **多语言切换** — 简中 / 繁中 / 日本語 / English，自动检测浏览器语言
- 🌤️ **实时天气与地理位置** — 基于访客 IP 自动展示当地天气和问候语（需配置 API）
- 🌓 **深色/浅色主题** — 自动跟随系统偏好，支持手动切换，持久化存储
- 🖱️ **空间交互引擎** — 3D 卡片倾斜、磁性按钮、光标辉光（桌面端），带来灵动反馈
- ⌨️ **键盘快捷键** — 空格键播放/暂停，左右箭头切换歌曲，方便快捷
- 📱 **响应式布局** — 完美适配桌面、平板和手机，移动端优化交互
- ⚡ **性能优化** — 懒加载、骨架屏、平滑滚动，提升体验

---

## 🚀 技术栈

- 原生 HTML5 / CSS3 / JavaScript (ES6+)
- CSS 自定义属性（Variables）实现主题系统
- Web Audio API + Media Session API
- [WeatherAPI](https://www.weatherapi.com/) + [ipapi](https://ipapi.co/) 地理位置服务

---

## 🛠️ 快速开始

无需任何构建工具，直接克隆代码并打开 `index.html` 即可运行：

```bash
# 克隆仓库
git clone [https://github.com/xsfnb/myhome.git](https://github.com/xsfnb/myhome.git)
cd myhome

# 直接用浏览器打开 index.html
# 或使用静态服务器本地运行
npx serve .
```

---

## ⚙️ 配置说明

在开始使用前，你需要完成以下个性化配置（所有占位符已用 `your-*` 标记）：

### 1️⃣ 替换个人信息
- `your-site.com` → 你的网站域名（若无，可保留 `https://your-site.com`）
- `your-email@example.com` → 你的联系邮箱
- `Your Name` → 你的姓名
- `Your favorite quote` → 你的座右铭
- `1.png` → 替换为你自己的头像图片（建议 1:1 比例，推荐 512×512）

### 2️⃣ 获取天气 API 密钥
本主页使用 WeatherAPI 获取实时天气，在 `script.js` 中找到以下代码行：

```javascript
const apiKey = 'YOUR_WEATHERAPI_KEY';  // 替换为你的真实密钥
```

前往 WeatherAPI 注册免费账号，获取密钥填入即可。如不配置，系统会自动降级展示。

### 3️⃣ 添加音乐文件
在 `script.js` 的 `playlist` 数组中，用你自己的歌曲替换占位条目：

```javascript
playlist: [
    { src: 'song1.mp3', title: '歌曲名 - 歌手' },
    { src: 'song2.mp3', title: '歌曲名 - 歌手' },
]
```

将音乐文件放在项目根目录（或填写外部网络链接）。

### 4️⃣ 多语言文本自定义
如需修改界面上的文字（如姓名、问候语等），可在 `script.js` 的 `translations` 对象中按语言编辑对应字段。

---

## 🎨 自定义样式

所有样式集中在 `style.css` 中，可以通过修改 `:root` 下的 CSS 变量轻松调整主题色、玻璃透明度和阴影等：

```css
:root {
  --accent: #007aff;                            /* 主色调 */
  --glass-bg-light: rgba(255, 255, 255, 0.45);   /* 浅色模式玻璃背景 */
  --glass-bg-dark: rgba(25, 25, 30, 0.4);       /* 深色模式玻璃背景 */
}
```

---

## ☁️ 部署指南

### 方式一：Cloudflare Pages（推荐，免费且快速）
1. 下载源码解压到本地
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)，进入 **Workers 和 Pages** 菜单
3. 点击 **创建** → **Pages** → **上传资产**（直接拖拽项目文件夹）
4. 项目名称自定义（如 `my-homepage`），点击 **上传并部署**
5. 等待 1-2 分钟，获得 `https://xxx.pages.dev` 链接即可访问
6. **绑定自定义域名（可选）**：在项目后台的“自定义域”标签添加你的域名，按提示配置 CNAME 记录即可

### 方式二：GitHub Pages
1. 将代码推送到 GitHub 仓库
2. 进入仓库 **Settings** → **Pages**，选择 `main` 分支和 `/ (root)` 文件夹保存即可

---

## 📁 项目结构

```text
.
├── index.html          # 主页面
├── style.css           # 全部样式（Liquid Glass 设计系统）
├── script.js           # 全部交互逻辑（播放器、主题、语言、天气等）
├── 1.png               # 你的头像
├── LICENSE             # MIT 许可证
└── README.md           # 项目说明文档
```

---

## ⌨️ 键盘快捷键

| 按键 | 功能 |
| :--- | :--- |
| `Space` | 播放 / 暂停 |
| `ArrowRight` | 下一首 |
| `ArrowLeft` | 上一首 |

---

## 🤝 贡献

欢迎提出 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。你可以自由使用、修改和分发，但请保留原作者版权声明。

---

## 🙏 致谢

- [Font Awesome](https://fontawesome.com/) 提供图标支持
- [WeatherAPI](https://www.weatherapi.com/) 提供天气数据支持
- 灵感来自现代玻璃拟态设计趋势
