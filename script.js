/*
 * Liquid Glass & Spring Physics
 */

document.addEventListener("DOMContentLoaded", () => {
    const App = {
        playlist: [
            { src: '梁博 - 出现又离开 (Live).mp3', title: '出现又离开 (Live) - 梁博' },
            { src: '莫文蔚 - 盛夏的果实.flac', title: '盛夏的果实 - 莫文蔚' },
            { src: '孙建平 Sweet Style - 我记得你眼里的依恋.mp3', title: '我记得你眼里的依恋 - 孙建平 Sweet Style' },
            { src: '赵雷 - 画.flac', title: '画 - 赵雷' }
        ],
        currentTrackIndex: 0,
        lastScrollY: window.scrollY,
        STORAGE_KEY: 'xsf_music_player_state',

        init() {
            document.body.classList.add('js'); // 用于 CSS 渐进增强（无 JS 时板块可见）
            this.initPreloader();
            this.initSpatialEngine();
            this.initTheme();
            this.initWallpaper();
            this.initLanguage();
            this.initSharing();
            this.initScrollIndicator();
            this.initCustomMusicPlayer();
            this.initRipples();
            this.initDynamicControls();
            this.initFullscreenMenu();
        },

        // ========== 空间交互引擎 ==========
        initSpatialEngine() {
            const isTouch = window.matchMedia('(pointer: coarse)').matches;
            if (!isTouch) {
                this.initTiltSystem();
                this.initMagneticSystem();
                this.initCursorGlow();
            }
        },

        initTiltSystem() {
            const cards = document.querySelectorAll('.grid-item');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const cx = rect.width / 2;
                    const cy = rect.height / 2;
                    const rx = ((y - cy) / cy) * -6;
                    const ry = ((x - cx) / cx) * 6;
                    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px) scale(1.02)`;
                    card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
                    card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
                }, { passive: true });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)';
                    card.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
                    setTimeout(() => { card.style.transition = ''; }, 600);
                });
                card.addEventListener('mouseenter', () => {
                    card.style.transition = 'transform 0.1s ease-out';
                });
            });
        },

        initMagneticSystem() {
            const buttons = document.querySelectorAll('.control-btn, .email, .play-pause-btn, .prev-btn, .next-btn, .playlist-btn');
            buttons.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.1)`;
                }, { passive: true });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                    btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                    setTimeout(() => { btn.style.transition = ''; }, 500);
                });
                btn.addEventListener('mouseenter', () => {
                    btn.style.transition = 'transform 0.1s ease';
                });
            });
        },

        initCursorGlow() {
            const glow = document.createElement('div');
            glow.className = 'cursor-glow';
            document.body.appendChild(glow);
            let tx = 0, ty = 0, cx = 0, cy = 0;
            document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
            const animate = () => {
                cx += (tx - cx) * 0.08;
                cy += (ty - cy) * 0.08;
                // transform 走合成层，避免 left/top 触发每帧布局重排
                glow.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
                requestAnimationFrame(animate);
            };
            animate();
        },

        initRipples() {
            // iOS 风格点击涟漪反馈
            const targets = document.querySelectorAll('.control-btn, .play-pause-btn, .prev-btn, .next-btn, .playlist-btn, .project-link, .email');
            targets.forEach(el => {
                el.addEventListener('pointerdown', (e) => {
                    const rect = el.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height) * 0.9;
                    const ripple = document.createElement('span');
                    ripple.className = 'ripple';
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                    el.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                }, { passive: true });
            });
        },

        initEntranceSequence() {
            const items = document.querySelectorAll('.grid-item');
            items.forEach((item, i) => {
                item.classList.add('entrance');
                item.style.animationDelay = `${0.1 + i * 0.1}s`;
            });
            const nameEl = document.querySelector('.name');
            if (nameEl && !nameEl.getAttribute('data-text')) {
                nameEl.setAttribute('data-text', nameEl.textContent);
            }
        },

        initPreloader() {
            const pre = document.getElementById('preloader');
            if (!pre) return;
            const fill = document.getElementById('loaderFill');
            const pct = document.getElementById('loaderPct');
            const DURATION = 1500;
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                if (fill) fill.style.width = '100%';
                if (pct) pct.textContent = '100%';
                setTimeout(() => {
                    pre.classList.add('done'); // 左右帷幕分割拉开
                    this.initEntranceAnimations(); // 进场后触发板块 reveal / 文字 split
                    setTimeout(() => { pre.style.display = 'none'; }, 1150);
                }, 300);
            };
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min(1, (now - start) / DURATION);
                // easeOutCubic 缓动
                const eased = 1 - Math.pow(1 - t, 3);
                const val = Math.round(eased * 100);
                if (fill) fill.style.width = val + '%';
                if (pct) pct.textContent = val + '%';
                if (t < 1) requestAnimationFrame(tick);
                else finish();
            };
            requestAnimationFrame(tick);
            // 兜底：即使卡住，最多等 DURATION+1.5s 也完成
            setTimeout(finish, DURATION + 1500);
        },

        // 加载完成后的入场动画：板块滚动 reveal + 名字逐字 split
        initEntranceAnimations() {
            this.initScrollReveal();
            this.initSplitText();
        },

        // 板块滚动入场：进入视口才 reveal，多卡交错（stagger）
        initScrollReveal() {
            const cards = document.querySelectorAll('.grid-item');
            if (!('IntersectionObserver' in window)) {
                cards.forEach(c => { c.classList.add('revealed'); c.classList.add('reveal-done'); });
                return;
            }
            let count = 0;
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const card = entry.target;
                        card.classList.add('revealed');
                        card.style.animationDelay = (count++ * 0.1) + 's';
                        card.addEventListener('animationend', () => card.classList.add('reveal-done'), { once: true });
                        observer.unobserve(card);
                    }
                });
            }, { threshold: 0.12 });
            cards.forEach(card => observer.observe(card));
        },

        // 「雨天」名字逐字浮现（split-text）
        initSplitText() {
            const nameEl = document.querySelector('.name');
            if (!nameEl) return;
            const text = nameEl.textContent.trim();
            if (!text) return;
            nameEl.innerHTML = '';
            nameEl.removeAttribute('data-text'); // 移除 shimmer 用的 ::after data-text，避免叠加干扰
            [...text].forEach((ch, i) => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = ch === ' ' ? '\u00A0' : ch;
                span.style.transitionDelay = (i * 0.07) + 's';
                nameEl.appendChild(span);
            });
            nameEl.classList.add('split');
            requestAnimationFrame(() => requestAnimationFrame(() => nameEl.classList.add('in')));
        },

        // 全屏导航菜单
        initFullscreenMenu() {
            const menuBtn = document.getElementById('menu-btn');
            const menu = document.getElementById('fullscreenMenu');
            const menuClose = document.getElementById('menuClose');
            if (!menuBtn || !menu || !menuClose) return;
            const open = () => {
                menu.classList.add('open');
                menu.setAttribute('aria-hidden', 'false');
                menuBtn.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            };
            const close = () => {
                menu.classList.remove('open');
                menu.setAttribute('aria-hidden', 'true');
                menuBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            };
            menuBtn.addEventListener('click', open);
            menuClose.addEventListener('click', close);
            menu.querySelectorAll('[data-menu-item]').forEach(a => {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    const id = (a.getAttribute('href') || '').slice(1);
                    close();
                    const target = document.getElementById(id);
                    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 320);
                });
            });
            const bg = menu.querySelector('.menu-bg');
            if (bg) bg.addEventListener('click', close);
        },

        initScrollIndicator() {
            const indicator = document.getElementById('scrollIndicator');
            if (!indicator) return;
            indicator.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:100;opacity:0.6;pointer-events:none;transition:opacity 0.5s ease;';
            const arrow = indicator.querySelector('.scroll-arrow');
            if (arrow) {
                arrow.style.cssText = 'display:block;font-size:20px;color:var(--text-secondary);animation:scrollBounce 2s infinite;';
                if (!document.getElementById('scroll-anim-style')) {
                    const style = document.createElement('style');
                    style.id = 'scroll-anim-style';
                    style.textContent = '@keyframes scrollBounce{0%,100%{transform:translateY(0);}50%{transform:translateY(6px);}}';
                    document.head.appendChild(style);
                }
            }
            window.addEventListener('scroll', () => {
                if (indicator) indicator.style.opacity = window.scrollY > 30 ? '0' : '0.6';
            }, { passive: true });
        },

        initDynamicControls() {
            const controls = document.querySelector('.controls');
            if (!controls) return;
            window.addEventListener('scroll', () => {
                const y = window.scrollY;
                controls.classList.toggle('shrunk', y > this.lastScrollY && y > 50);
                this.lastScrollY = Math.max(0, y);
            }, { passive: true });
        },

        initSharing() {
            const shareBtn = document.getElementById('share-btn');
            const toast = document.getElementById('toast');
            if (!shareBtn || !toast) return;
            shareBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    toast.textContent = this.translations[this.currentLang].linkCopied;
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 2500);
                }).catch(() => {
                    toast.textContent = 'Error';
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 2500);
                });
            });
        },

        initTheme() {
            this.themeToggle = document.getElementById('theme-toggle');
            this.themeToggle.addEventListener('click', () => {
                const t = (localStorage.getItem('theme') || 'dark') === 'light' ? 'dark' : 'light';
                this.applyTheme(t);
            });
            const saved = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            // 移动端（竖屏窄视口）固定暗色主题背景（配合 CSS 隐藏动态壁纸）
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            this.applyTheme(isMobile ? 'dark' : (saved || (prefersDark ? 'dark' : 'light')));
        },

        applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            this.themeToggle.innerHTML = `<i class="fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>`;
            const meta = document.getElementById('theme-color-meta');
            if (meta) meta.setAttribute('content', theme === 'light' ? '#f2f2f7' : '#000000');
        },

        // ========== 动态壁纸（仅暗色模式） ==========
        initWallpaper() {
            // 诊断日志放在最前面：即使元素缺失也能看到执行情况
            console.log('[壁纸] initWallpaper 开始执行',
                '| .wallpaper:', !!document.querySelector('.wallpaper'),
                '| #bg-video:', !!document.getElementById('bg-video'),
                '| #wallpaper-toggle:', !!document.getElementById('wallpaper-toggle'));

            const wp = document.querySelector('.wallpaper');
            const video = document.getElementById('bg-video');
            const toggle = document.getElementById('wallpaper-toggle');
            if (!wp || !video || !toggle) {
                console.warn('[壁纸] 壁纸层元素缺失，初始化中止');
                return;
            }

            // 壁纸源：默认 bg.mp4，点击切换按钮循环到新壁纸
            this.wallpapers = [
                { src: 'bg.mp4', poster: 'bg_0.jpg', name: '壁纸 1' },
                { src: 'yh_zhenhong.mp4', poster: 'bg_0.jpg', name: '壁纸 2' }
            ];
            this.wpSrcKey = 'wallpaper_src';
            let srcSaved = null;
            try { srcSaved = parseInt(localStorage.getItem(this.wpSrcKey), 10); } catch (e) { /* ignore */ }
            this.wpIndex = (!isNaN(srcSaved) && srcSaved >= 0 && srcSaved < this.wallpapers.length) ? srcSaved : 0;
            video.src = this.wallpapers[this.wpIndex].src;
            video.poster = this.wallpapers[this.wpIndex].poster;

            // 动态壁纸默认开启。移动端（<768 竖屏）由 CSS 隐藏壁纸省电；
            // 触屏平板（如 iPad）宽度 >768 仍应显示并动态播放。
            // 这里不因"触屏"禁用动态（否则 iPad 壁纸会卡成静态、切换也失效）。
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.wpCanDynamic = !reducedMotion;

            // 壁纸改为"切换源"制：始终动态播放（除非设备/系统不支持动态）。
            // 清掉旧版"动/静"切换残留的 static 记忆，避免锁定静态导致切换无效。
            try { localStorage.removeItem('wallpaper_v2'); } catch (e) { /* ignore */ }
            this.wpMode = this.wpCanDynamic ? 'dynamic' : 'static';

            console.log('[壁纸] 初始模式:', this.wpMode,
                '| 系统减少动效:', reducedMotion,
                '| 视频预加载:', video.preload);

            // 视频事件：真正播放后才渐显；出错/暂停则回落静态帧
            // 视频事件：真正播放后才渐显；出错/暂停则回落静态帧
            video.addEventListener('loadstart', () => console.log('[壁纸] loadstart 开始请求视频'));
            video.addEventListener('progress', () => {
                if (video.buffered && video.buffered.length) {
                    console.log('[壁纸] 已缓冲', Math.round(video.buffered.end(video.buffered.length - 1)) + 's / ' + (video.duration ? Math.round(video.duration) + 's' : '?'));
                }
            });
            video.addEventListener('canplay', () => console.log('[壁纸] canplay 已可播放'));
            video.addEventListener('playing', () => {
                console.log('[壁纸] 视频播放中');
                wp.classList.add('playing');
            });
            video.addEventListener('pause', () => wp.classList.remove('playing'));
            video.addEventListener('waiting', () => console.log('[壁纸] waiting 缓冲中...'));
            video.addEventListener('stalled', () => console.log('[壁纸] stalled 网络停滞'));
            video.addEventListener('error', () => {
                console.warn('[壁纸] 视频加载/播放失败，已回退静态帧。错误码:', video.error ? video.error.code : 'unknown');
                wp.classList.remove('playing');
                video.pause();
            });

            this.wpApplyMode(this.wpMode);
            this.wpUpdateToggle(toggle);

            // 手动切换按钮：循环切换壁纸视频源（bg.mp4 ↔ yh.mp4）
            toggle.addEventListener('click', () => {
                this.wpIndex = (this.wpIndex + 1) % this.wallpapers.length;
                try { localStorage.setItem(this.wpSrcKey, String(this.wpIndex)); } catch (e) { /* ignore */ }
                this.wpSetVideo();
                this.wpUpdateToggle(toggle);
                this.wpToast('已切换到' + this.wallpapers[this.wpIndex].name);
            });

            // 主题联动：亮色模式由 CSS 隐藏壁纸，同时暂停视频省电；切回暗色恢复
            const observer = new MutationObserver(() => {
                const dark = document.documentElement.getAttribute('data-theme') !== 'light';
                if (dark) this.wpApplyMode(this.wpMode);
                else video.pause();
            });
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

            // 标签页切到后台时暂停，回到前台恢复
            document.addEventListener('visibilitychange', () => {
                const dark = document.documentElement.getAttribute('data-theme') !== 'light';
                if (document.hidden || !dark) {
                    video.pause();
                } else if (this.wpMode === 'dynamic') {
                    this.wpApplyMode('dynamic');
                }
            });

            // 自动播放兜底：浏览器拦截首屏自动播放时，用户任意一次点击/触摸后重试
            const resume = () => {
                const dark = document.documentElement.getAttribute('data-theme') !== 'light';
                if (dark && this.wpMode === 'dynamic' && video.paused && video.error === null) {
                    this.wpApplyMode('dynamic');
                }
            };
            document.addEventListener('click', resume, { passive: true });
            document.addEventListener('touchstart', resume, { passive: true });

            // 系统开了"减少动态效果"时提示原因（仅桌面端、仅提示一次）
            if (reducedMotion) {
                this.wpToast('检测到系统「减少动态效果」，壁纸已用静态画面，点右上角按钮可切换动态', 4000);
            }
        },

        // 简易 toast 提示（复用页面底部的 #toast 元素）
        wpToast(msg, duration) {
            const toast = document.getElementById('toast');
            if (!toast) return;
            toast.textContent = msg;
            toast.classList.add('show');
            if (this._wpToastTimer) clearTimeout(this._wpToastTimer);
            this._wpToastTimer = setTimeout(() => toast.classList.remove('show'), duration || 2000);
        },

        wpUpdateToggle(toggle) {
            if (!toggle) return;
            const w = this.wallpapers[this.wpIndex] || this.wallpapers[0];
            toggle.title = '切换动态壁纸（当前：' + w.name + '）';
            toggle.setAttribute('aria-label', toggle.title);
        },

        // 切换到当前 wpIndex 对应的壁纸视频（动态时播放，静态/亮色时暂停）
        wpSetVideo() {
            const wp = document.querySelector('.wallpaper');
            const video = document.getElementById('bg-video');
            if (!wp || !video || !this.wallpapers) return;
            const w = this.wallpapers[this.wpIndex] || this.wallpapers[0];
            const targetUrl = new URL(w.src, location.href).href;
            if (video.src !== targetUrl) {
                video.src = w.src;
                video.poster = w.poster;
                video.preload = 'auto';
                video.load();
            }
            const dark = document.documentElement.getAttribute('data-theme') !== 'light';
            const isDynamic = this.wpMode === 'dynamic' && dark;
            if (isDynamic) {
                const p = video.play();
                if (p && p.catch) p.catch(() => { wp.classList.remove('playing'); video.pause(); });
            } else {
                video.pause();
                wp.classList.remove('playing');
            }
        },

        wpApplyMode(mode) {
            const wp = document.querySelector('.wallpaper');
            const video = document.getElementById('bg-video');
            const dark = document.documentElement.getAttribute('data-theme') !== 'light';
            if (!wp || !video) return;
            if (!dark) { video.pause(); return; }
            if (mode === 'dynamic') {
                if (video.preload !== 'auto') { video.preload = 'auto'; video.load(); }
                const p = video.play();
                if (p && p.catch) {
                    p.catch((err) => {
                        // 播放被拦截（如自动播放策略）→ 回落静态帧，等用户交互后重试
                        console.warn('[壁纸] 自动播放被拦截:', err ? err.name : 'unknown', '；点击页面任意位置后会自动重试');
                        wp.classList.remove('playing');
                        video.pause();
                    });
                }
            } else {
                video.pause();
                wp.classList.remove('playing');
            }
        },

        initLanguage() {
            this.translations = {
                zh: { name: "雨天", contact: "联系方式", email: "lizijapan@gmail.com", footer: "当回忆失去了情感，便成了记忆", morning: "早上好", noon: "中午好", evening: "晚上好", from: "你好, 来自 {country} 的朋友", unknown: "你好, 陌生人", weatherPrefix: "当前天气", weatherError: "天气加载失败", apiKeyError: "API密钥配置错误", linkCopied: "链接已复制！", hobbyTitle: "爱好", hobbyMusic: "听音乐", loading: "加载中...", musicLoadError: "音乐加载失败", projectTitle: "我的项目", projectName: "弹幕 · 在线弹幕墙", projectDesc: "基于 danmu_api，支持多平台弹幕获取与播放", projectName2: "我的主页 · 开源", projectDesc2: "本站源码已开源至 GitHub，欢迎 Star", projectName3: "Spectroid 汉化 · 液态玻璃 UI", projectDesc3: "音频频谱分析仪汉化补丁，纯 Python 零依赖" },
                'zh-TW': { name: "雨天", contact: "聯絡方式", email: "lizijapan@gmail.com", footer: "當回憶失去了情感，便成了記憶", morning: "早上好", noon: "中午好", evening: "晚上好", from: "你好, 來自 {country} 的朋友", unknown: "你好, 陌生人", weatherPrefix: "當前天氣", weatherError: "天氣載入失敗", apiKeyError: "API金鑰配置錯誤", linkCopied: "連結已複製！", hobbyTitle: "愛好", hobbyMusic: "聽音樂", loading: "載入中...", musicLoadError: "音樂載入失敗", projectTitle: "我的專案", projectName: "彈幕 · 線上彈幕牆", projectDesc: "基於 danmu_api，支援多平台彈幕獲取與播放", projectName2: "我的主頁 · 開源", projectDesc2: "本站原始碼已開源至 GitHub，歡迎 Star", projectName3: "Spectroid 漢化 · 液態玻璃 UI", projectDesc3: "音頻頻譜分析儀漢化補丁，純 Python 零依賴" },
                ja: { name: "雨天", contact: "連絡先", email: "lizijapan@gmail.com", footer: "思い出が感情を失うと、記憶になる", morning: "おはよう", noon: "こんにちは", evening: "こんばんは", from: "{country} からの訪問者様、こんにちは", unknown: "こんにちは、見知らぬ方", weatherPrefix: "現在の天気", weatherError: "天気の読み込みに失敗しました", apiKeyError: "APIキーの設定エラー", linkCopied: "リンクがコピーされました！", hobbyTitle: "趣味", hobbyMusic: "音楽鑑賞", loading: "読み込み中...", musicLoadError: "音楽の読み込みに失敗しました", projectTitle: "私のプロジェクト", projectName: "弾幕 · オンライン弾幕ウォール", projectDesc: "danmu_api ベース、多プラットフォームの弾幕取得に対応", projectName2: "私のホームページ · オープンソース", projectDesc2: "このサイトのソースコードを GitHub で公開中、Star よろしくお願いします", projectName3: "Spectroid 日本語化 · リキッドガラスUI", projectDesc3: "オーディオスペクトラムアナライザー日本語化パッチ、純Python依存なし" },
                en: { name: "Yutian", contact: "Contact", email: "lizijapan@gmail.com", footer: "When memories lose emotion, they become memory", morning: "Good morning", noon: "Good afternoon", evening: "Good evening", from: "Hello, friend from {country}", unknown: "Hello, stranger", weatherPrefix: "Current weather", weatherError: "Failed to load weather", apiKeyError: "API key configuration error", linkCopied: "Link copied!", hobbyTitle: "Hobby", hobbyMusic: "Listening to Music", loading: "Loading...", musicLoadError: "Music load failed", projectTitle: "My Projects", projectName: "Danmu · Online Danmaku Wall", projectDesc: "Built on danmu_api, fetch danmaku from multiple platforms", projectName2: "My Homepage · Open Source", projectDesc2: "Source code of this site is open-sourced on GitHub, give it a Star", projectName3: "Spectroid L10n · Liquid Glass UI", projectDesc3: "Audio spectrum analyzer localization patch, pure Python, zero dependencies" }
            };
            this.currentLang = "zh";
            this.visitorCountry = null;
            this.weatherData = null;
            this.langBtn = document.getElementById("langBtn");
            this.langMenu = document.getElementById("langMenu");

            const savedLang = localStorage.getItem("selectedLang");
            const browserLang = navigator.language;
            let defaultLang = "zh";
            if (browserLang.startsWith("en")) defaultLang = "en";
            else if (browserLang.startsWith("ja")) defaultLang = "ja";
            else if (browserLang === "zh-TW" || browserLang === "zh-HK") defaultLang = "zh-TW";

            this.applyLanguage(savedLang || defaultLang);
            this.fetchGeoData();
            setInterval(() => this.updateTimeGreeting(), 1000);

            this.langBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = this.langMenu.style.display !== "block";
                this.langMenu.style.display = open ? "block" : "none";
                this.langBtn.setAttribute('aria-expanded', String(open));
            });

            document.querySelectorAll("#langMenu button").forEach(btn => {
                btn.addEventListener("click", () => {
                    this.applyLanguage(btn.dataset.lang);
                    this.langMenu.style.display = "none";
                });
            });

            document.addEventListener("click", (e) => {
                if (!this.langBtn.contains(e.target) && !this.langMenu.contains(e.target)) {
                    this.langMenu.style.display = "none";
                    this.langBtn.setAttribute('aria-expanded', 'false');
                }
            });
        },

        updateTimeGreeting() {
            const timeEl = document.getElementById("timeGreeting");
            if (!timeEl) return;
            const opt = { timeZone: 'Asia/Shanghai', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false };
            const str = new Intl.DateTimeFormat('zh-CN', opt).format(new Date());
            const [hh, mm, ss] = str.split(':');
            const h = parseInt(hh, 10);
            let greet;
            if (h >= 5 && h < 12) greet = this.translations[this.currentLang].morning;
            else if (h >= 12 && h < 18) greet = this.translations[this.currentLang].noon;
            else greet = this.translations[this.currentLang].evening;

            // 天气修饰（多语言）：emoji + 天气描述，按当前语言
            let weatherSuffix = '';
            const wd = this.weatherData;
            if (wd && !wd.error && wd.weatherCode != null) {
                weatherSuffix = `${this.weatherEmoji(wd.weatherCode, wd.isDay)} ${this.weatherDesc(wd.weatherCode, this.currentLang)}，`;
            } else {
                weatherSuffix = '🌿 ';
            }

            // 静态部分（图标/问候/天气）不变时，每秒只更新时间数字，避免重建整块 DOM
            const staticKey = `${this.currentLang}|${weatherSuffix}|${greet}`;
            if (this._greetingKey === staticKey) {
                const clockEl = document.getElementById('timeClock');
                if (clockEl) {
                    clockEl.textContent = `${hh.padStart(2, '0')}:${mm}:${ss}`;
                    return;
                }
            }
            this._greetingKey = staticKey;
            timeEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${weatherSuffix}${greet} <span id="timeClock">${hh.padStart(2, '0')}:${mm}:${ss}</span>`;
        },

        applyLanguage(lang) {
            if (!this.translations[lang]) return;
            this.currentLang = lang;
            localStorage.setItem("selectedLang", lang);
            document.documentElement.lang = lang;
            document.querySelectorAll("[data-key]").forEach(el => {
                const key = el.getAttribute("data-key");
                if (this.translations[lang][key] !== undefined) {
                    el.classList.add("fade-out");
                    setTimeout(() => {
                        el.textContent = this.translations[lang][key];
                        el.classList.remove("fade-out");
                        if (el.classList.contains('name')) el.setAttribute('data-text', el.textContent);
                    }, 300);
                }
            });
            if (this.weatherData || this.visitorCountry) {
                this.updateWeatherInfo();
                this.updateIpGreeting();
            }
        },

        fetchWithTimeout(url, ms = 8000) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), ms);
            return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
        },

        // WMO 天气代码 → 中文描述（免 key 接口用）
        // WMO 天气码 → 多语言描述（中/繁/日/英）
        weatherDesc(code, lang) {
            const c = code == null ? -1 : code;
            const maps = {
                zh: { sunny: '晴', few: '少云', cloudy: '多云', overcast: '阴', fog: '雾', drizzle: '毛毛雨', rain: '雨', snow: '雪', showers: '阵雨', thunder: '雷雨' },
                'zh-TW': { sunny: '晴', few: '少雲', cloudy: '多雲', overcast: '陰', fog: '霧', drizzle: '毛毛雨', rain: '雨', snow: '雪', showers: '陣雨', thunder: '雷雨' },
                ja: { sunny: '晴れ', few: '晴れ時々曇り', cloudy: '曇り', overcast: '曇り', fog: '霧', drizzle: '霧雨', rain: '雨', snow: '雪', showers: 'にわか雨', thunder: '雷雨' },
                en: { sunny: 'Clear', few: 'Mostly clear', cloudy: 'Partly cloudy', overcast: 'Overcast', fog: 'Fog', drizzle: 'Drizzle', rain: 'Rain', snow: 'Snow', showers: 'Showers', thunder: 'Thunderstorm' }
            };
            let k;
            if (c === 0) k = 'sunny';
            else if (c === 1) k = 'few';
            else if (c === 2) k = 'cloudy';
            else if (c === 3) k = 'overcast';
            else if (c === 45 || c === 48) k = 'fog';
            else if (c >= 51 && c <= 57) k = 'drizzle';
            else if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) k = 'rain';
            else if ((c >= 71 && c <= 77) || c === 85 || c === 86) k = 'snow';
            else if (c >= 95 && c <= 99) k = 'thunder';
            else k = 'cloudy';
            const m = maps[lang] || maps.zh;
            return m[k];
        },

        // WMO 天气代码 → emoji 图标
        weatherEmoji(code, isDay) {
            const c = code == null ? -1 : code;
            if (c === 0) return isDay ? '☀️' : '🌙';
            if (c <= 2) return '⛅';
            if (c === 3) return '☁️';
            if (c === 45 || c === 48) return '🌫️';
            if (c >= 51 && c <= 57) return '🌦️';
            if (c >= 61 && c <= 67) return '🌧️';
            if (c >= 71 && c <= 77) return '❄️';
            if (c >= 80 && c <= 86) return '🌧️';
            if (c >= 95 && c <= 99) return '⛈️';
            return '🌡️';
        },

        async fetchGeoData() {
            // 方法 B：免 key 方案（防止 API key 泄露）。
            // 先用 ipwho.is 做 IP 定位拿经纬度（免 key），再用 Open-Meteo 拿天气（免 key）。
            let lat = null, lon = null;
            try {
                const geo = await this.fetchWithTimeout('https://ipwho.is/', 5000);
                const d = await geo.json();
                if (d && d.success) {
                    this.visitorCountry = d.country || null;
                    lat = d.latitude;
                    lon = d.longitude;
                }
            } catch (e) { /* 定位失败则降级 */ }

            if (lat !== null && lon !== null) {
                try {
                    const w = await this.fetchWithTimeout(
                        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`,
                        6000
                    );
                    const wd = await w.json();
                    const cur = wd && wd.current;
                    this.weatherData = cur
                        ? { temp: cur.temperature_2m, weatherCode: cur.weather_code, isDay: cur.is_day === 1 }
                        : { error: true };
                } catch (e) {
                    this.weatherData = { error: true };
                }
            } else {
                this.weatherData = { error: true };
            }
            this.updateWeatherInfo();
            this.updateIpGreeting();
        },

        updateWeatherInfo() {
            const el = document.getElementById("weatherInfo");
            if (!el) return;
            const dict = this.translations[this.currentLang];
            if (this.weatherData === null) return;
            if (this.weatherData.error) {
                el.innerHTML = `<i class="fa-solid fa-cloud-bolt"></i> ${dict.weatherError}`;
                return;
            }
            const w = this.weatherData;
            const icon = this.weatherEmoji(w.weatherCode, w.isDay);
            const desc = this.weatherDesc(w.weatherCode, this.currentLang);
            el.innerHTML = `<span style="margin-right:8px">${icon}</span> ${dict.weatherPrefix}: ${desc}, ${Math.round(w.temp)}°C`;
        },

        updateIpGreeting() {
            const el = document.getElementById("ipGreeting");
            if (!el) return;
            const dict = this.translations[this.currentLang];
            if (this.visitorCountry === null && !this.weatherData?.error && !this.weatherData) return;
            const text = this.visitorCountry ? dict.from.replace("{country}", this.visitorCountry) : dict.unknown;
            el.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${text}`;
        },

        // ========== 音乐播放器核心 ==========
        // ========== FLAC 元数据（内嵌封面 + 歌词） ==========
        // 手写解析器，零依赖。FLAC 容器：'fLaC' 头 + 元数据块链；
        // 块头 = 1 字节(bit7 最后块标记 + 低7位类型) + 3 字节大端长度。
        // 类型 4 = VORBIS_COMMENT（含 LYRICS 字段），类型 6 = PICTURE（封面图）。
        parseFlacMeta(buffer) {
            const view = new DataView(buffer);
            if (view.byteLength < 4 || view.getUint32(0, false) !== 0x664C6143) return null;
            let off = 4;
            const meta = { lyrics: null, picture: null, incomplete: false };
            while (off + 4 <= view.byteLength) {
                const h = view.getUint8(off);
                const isLast = (h & 0x80) !== 0;
                const type = h & 0x7F;
                const len = (view.getUint8(off + 1) << 16) | (view.getUint8(off + 2) << 8) | view.getUint8(off + 3);
                off += 4;
                if (off + len > view.byteLength) { meta.incomplete = true; break; }
                const block = new Uint8Array(buffer, off, len);
                const dv = new DataView(buffer, off, len);
                if (type === 4) { // VORBIS_COMMENT（注意：内部字段为小端序，与块头的大端不同）
                    let p = 0;
                    const vendorLen = dv.getUint32(p, true); p += 4 + vendorLen;
                    if (p + 4 > len) { meta.incomplete = true; break; }
                    const count = dv.getUint32(p, true); p += 4;
                    for (let i = 0; i < count && p + 4 <= len; i++) {
                        const kLen = dv.getUint32(p, true); p += 4;
                        if (p + kLen > len) break;
                        const kv = new TextDecoder('utf-8').decode(block.subarray(p, p + kLen));
                        p += kLen;
                        const eq = kv.indexOf('=');
                        if (eq > 0 && kv.slice(0, eq).toUpperCase() === 'LYRICS') meta.lyrics = kv.slice(eq + 1);
                    }
                } else if (type === 6) { // PICTURE（与 ID3v2 APIC 同格式，字段为大端，与 VORBIS_COMMENT 的小端不同！）
                    let p = 0;
                    p += 4; // picture type
                    const mimeLen = dv.getUint32(p); p += 4;
                    if (p + mimeLen > len) { meta.incomplete = true; break; }
                    const mime = new TextDecoder('utf-8').decode(block.subarray(p, p + mimeLen));
                    p += mimeLen;
                    const descLen = dv.getUint32(p); p += 4;
                    p += descLen + 16; // 描述 + 宽高深(12) + 颜色数(4)
                    const dataLen = dv.getUint32(p); p += 4;
                    if (p + dataLen <= len) {
                        meta.picture = { mime, data: block.slice(p, p + dataLen) };
                    } else { meta.incomplete = true; }
                }
                off += len;
                if (isLast) break;
            }
            return meta;
        },

        // MP3 元数据：ID3v2 标签（USLT 歌词帧 + APIC 封面帧 + TXXX 兜底）。
        // 支持 ID3v2.3 / v2.4（帧大小编码不同）。
        parseId3v2(buffer) {
            const u8 = new Uint8Array(buffer);
            if (u8.length < 10 || u8[0] !== 0x49 || u8[1] !== 0x44 || u8[2] !== 0x33) return null; // 'ID3'
            const ver = u8[3];
            const flags = u8[5];
            const tagSize = ((u8[6] & 0x7F) << 21) | ((u8[7] & 0x7F) << 14) | ((u8[8] & 0x7F) << 7) | (u8[9] & 0x7F);
            const meta = { lyrics: null, picture: null, incomplete: false };
            let off = 10;
            // v2.4 扩展头
            if (ver === 4 && (flags & 0x40)) {
                if (off + 4 > u8.length) { meta.incomplete = true; return meta; }
                const extSize = ((u8[off] & 0x7F) << 21) | ((u8[off + 1] & 0x7F) << 14) | ((u8[off + 2] & 0x7F) << 7) | (u8[off + 3] & 0x7F);
                off += 4 + extSize;
            }
            const end = Math.min(10 + tagSize, u8.length);
            while (off + 10 <= end) {
                const id = String.fromCharCode(u8[off], u8[off + 1], u8[off + 2], u8[off + 3]);
                if (id.charCodeAt(0) === 0) break;
                let frameSize;
                if (ver === 4) {
                    frameSize = ((u8[off + 4] & 0x7F) << 21) | ((u8[off + 5] & 0x7F) << 14) | ((u8[off + 6] & 0x7F) << 7) | (u8[off + 7] & 0x7F);
                } else {
                    frameSize = (u8[off + 4] << 24) | (u8[off + 5] << 16) | (u8[off + 6] << 8) | u8[off + 7];
                }
                off += 10;
                if (frameSize <= 0 || off + frameSize > end) break;
                const frameEnd = off + frameSize;
                if (id === 'USLT') {
                    // 编码(1) + 语言(3) + 内容描述 + 分隔符 + 歌词文本
                    const enc = u8[off];
                    const sep = this.findId3Sep(u8, off + 4, frameEnd, enc);
                    if (sep >= 0) {
                        const text = this.decodeId3Text(u8, sep + this.id3SepLen(enc), frameEnd, enc);
                        if (text && text.trim()) meta.lyrics = text;
                    }
                } else if (id === 'TXXX') {
                    // 编码(1) + 描述 + 分隔符 + 值。
                    // ffmpeg 常把歌词写成 TXXX:USLT 或 TXXX:LYRICS，需兼容
                    const enc = u8[off];
                    const sep = this.findId3Sep(u8, off + 1, frameEnd, enc);
                    if (sep >= 0) {
                        const key = this.decodeId3Text(u8, off + 1, sep, enc) || '';
                        const val = this.decodeId3Text(u8, sep + this.id3SepLen(enc), frameEnd, enc) || '';
                        if (/lyric|uslt|sylt/i.test(key) && val.trim()) meta.lyrics = val;
                    }
                } else if (id === 'APIC') {
                    // 编码(1) + MIME(至\0) + 图片类型(1) + 描述(至分隔符) + 图片数据
                    const enc = u8[off];
                    let p = off + 1;
                    let mimeEnd = p;
                    while (mimeEnd < frameEnd && u8[mimeEnd] !== 0) mimeEnd++;
                    if (mimeEnd >= frameEnd) { off = frameEnd; continue; }
                    const mime = new TextDecoder('latin1').decode(u8.subarray(p, mimeEnd));
                    p = mimeEnd + 2; // \0 + picture type
                    const sep = this.findId3Sep(u8, p, frameEnd, enc);
                    if (sep >= 0) {
                        p = sep + this.id3SepLen(enc);
                        if (p < frameEnd) meta.picture = { mime, data: u8.slice(p, frameEnd) };
                    }
                }
                off = frameEnd;
            }
            return meta;
        },

        // ID3v2 文本字段分隔符长度（UTF-16 为 2 字节 \0\0，其余 1 字节）
        id3SepLen(enc) {
            return (enc === 1 || enc === 2) ? 2 : 1;
        },

        // 查找 ID3v2 字符串字段的分隔符位置（UTF-16 需对齐双字节）
        findId3Sep(u8, start, end, enc) {
            const sepLen = this.id3SepLen(enc);
            for (let i = start; i + sepLen <= end; i++) {
                let ok = true;
                for (let j = 0; j < sepLen; j++) if (u8[i + j] !== 0) { ok = false; break; }
                if (ok) return i;
            }
            return -1;
        },

        // ID3v2 文本解码：0=Latin1, 1=UTF-16(BOM), 2=UTF-16BE, 3=UTF-8
        decodeId3Text(u8, start, end, enc) {
            if (start >= end) return '';
            const sub = u8.subarray(start, end);
            try {
                if (enc === 3) return new TextDecoder('utf-8').decode(sub);
                if (enc === 1) {
                    if (sub.length >= 2 && sub[0] === 0xFE && sub[1] === 0xFF) return new TextDecoder('utf-16be').decode(sub.subarray(2));
                    return new TextDecoder('utf-16le').decode(sub.subarray(sub[0] === 0xFF && sub[1] === 0xFE ? 2 : 0));
                }
                if (enc === 2) return new TextDecoder('utf-16be').decode(sub);
                return new TextDecoder('latin1').decode(sub);
            } catch (e) {
                return '';
            }
        },

        // 自动识别音频格式：FLAC('fLaC') 或 MP3('ID3')，返回统一结构 {lyrics, picture, incomplete}
        parseAudioMeta(buffer) {
            const u8 = new Uint8Array(buffer);
            if (u8.length >= 4 && u8[0] === 0x66 && u8[1] === 0x4C && u8[2] === 0x61 && u8[3] === 0x43) return this.parseFlacMeta(buffer);
            if (u8.length >= 3 && u8[0] === 0x49 && u8[1] === 0x44 && u8[2] === 0x33) return this.parseId3v2(buffer);
            return null;
        },

        async fetchFlacMeta(src) {
            const read = async (end) => {
                const res = await fetch(src, { headers: { Range: `bytes=0-${end - 1}` } });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.arrayBuffer();
            };
            // 先拉前 2MB（FLAC 元数据块 / MP3 ID3v2 标签都在文件头，通常足够）
            let buf = await read(2 * 1024 * 1024);
            let meta = this.parseAudioMeta(buf);
            // 封面块若超出已拉范围，补拉 8MB 重解析
            if (meta && meta.incomplete) {
                buf = await read(8 * 1024 * 1024);
                meta = this.parseAudioMeta(buf);
            }
            return meta;
        },

        // LRC 歌词解析：[mm:ss.xx] 时间戳行，支持一行多时间戳
        parseLrc(text) {
            const lines = [];
            const re = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
            for (const raw of String(text || '').split(/\r?\n/)) {
                const times = [];
                re.lastIndex = 0;
                let m;
                while ((m = re.exec(raw)) !== null) {
                    const min = +m[1], sec = +m[2];
                    const frac = m[3] ? +m[3].padEnd(3, '0') : 0;
                    times.push(min * 60 + sec + frac / 1000);
                }
                if (times.length) {
                    const content = raw.replace(re, '').trim();
                    if (content) times.forEach(t => lines.push({ time: t, text: content }));
                }
            }
            lines.sort((a, b) => a.time - b.time);
            return lines;
        },

        // LRC 元数据行判断（作词/作曲/编曲/制作人/歌手-歌名标题等，非歌词正文）
        isMetaLyricLine(text) {
            const t = String(text || '').trim();
            if (/^(作词|作曲|编曲|制作人|制作|监制|混音|录音|母带|后期|和声|配唱|出品|发行|企划|统筹|文案|封面|OP|SP|原曲|原唱|改编|词|曲|编)\s*[:：]/.test(t)) return true;
            // 歌手-歌名 形式的标题行（无冒号、较短、含连字符）
            if (t.length < 40 && /^[\u4e00-\u9fa5A-Za-z0-9]+(\s*[-–—]\s*)[\u4e00-\u9fa5A-Za-z0-9\s()（）、·]+$/.test(t)) return true;
            return false;
        },

        escapeHtml(s) {
            return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        },

        // 加载封面 + 歌词（内存缓存，切歌不重复下载）
        loadTrackMeta(index) {
            const track = this.playlist[index];
            const coverEl = document.getElementById('track-cover');
            const lyricsScroll = document.getElementById('lyrics-scroll');
            const lyricsPlaceholder = document.getElementById('lyrics-placeholder');
            if (!coverEl || !lyricsScroll) return;

            coverEl.removeAttribute('src');
            coverEl.style.display = '';
            this._coverToken = (this._coverToken || 0) + 1; // 使旧封面的异步加载失效
            lyricsScroll.innerHTML = '';
            if (lyricsPlaceholder) {
                lyricsPlaceholder.textContent = '歌词加载中...';
                lyricsPlaceholder.style.display = 'flex';
            }
            this.currentLyrics = [];
            this._lyricIdx = -1;

            if (this.metaCache && this.metaCache[index]) {
                this.renderTrackMeta(index, this.metaCache[index]);
                return;
            }
            this.fetchFlacMeta(track.src).then(meta => {
                this.metaCache = this.metaCache || {};
                this.metaCache[index] = meta;
                this.renderTrackMeta(index, meta);
            }).catch(err => {
                console.warn('[封面/歌词] 加载失败:', err);
                if (lyricsPlaceholder) {
                    lyricsPlaceholder.textContent = '封面/歌词加载失败（本地 file:// 预览不支持，部署后可用）';
                    lyricsPlaceholder.style.display = 'flex';
                }
            });
        },

        renderTrackMeta(index, meta) {
            const coverEl = document.getElementById('track-cover');
            const lyricsScroll = document.getElementById('lyrics-scroll');
            const lyricsPlaceholder = document.getElementById('lyrics-placeholder');
            if (!coverEl || !lyricsScroll) return;

            if (meta && meta.picture) {
                // 封面大图（如 4000x4000）用 canvas 缩放到 256px 再显示，省内存
                const token = ++this._coverToken;
                try {
                    const blob = new Blob([meta.picture.data], { type: meta.picture.mime || 'image/jpeg' });
                    const url = URL.createObjectURL(blob);
                    const img = new Image();
                    img.onload = () => {
                        if (token !== this._coverToken) { URL.revokeObjectURL(url); return; }
                        try {
                            const size = 256;
                            const canvas = document.createElement('canvas');
                            canvas.width = size;
                            canvas.height = size;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, size, size);
                            coverEl.src = canvas.toDataURL('image/jpeg', 0.85);
                        } catch (e) {
                            if (token === this._coverToken) coverEl.src = url;
                        } finally {
                            URL.revokeObjectURL(url);
                        }
                    };
                    img.onerror = () => {
                        if (token === this._coverToken) coverEl.src = url;
                        URL.revokeObjectURL(url);
                    };
                    img.src = url;
                } catch (e) { /* ignore */ }
            }
            // 歌词：保留作词/作曲/编曲等元数据行，一并显示滚动（元数据行弱化样式）
            this.currentLyrics = (meta && meta.lyrics) ? this.parseLrc(meta.lyrics) : [];
            if (this.currentLyrics.length) {
                lyricsScroll.innerHTML = this.currentLyrics.map((l, i) =>
                    `<div class="lyrics-line${this.isMetaLyricLine(l.text) ? ' meta' : ''}" data-i="${i}">${this.escapeHtml(l.text)}</div>`).join('');
                if (lyricsPlaceholder) lyricsPlaceholder.style.display = 'none';
                this.lyricLineEls = lyricsScroll.querySelectorAll('.lyrics-line');
                this._lyricIdx = -1;
                const audio = document.getElementById('bg-music');
                this.updateLyrics(audio ? audio.currentTime : 0);
            } else {
                lyricsScroll.innerHTML = '';
                if (lyricsPlaceholder) {
                    lyricsPlaceholder.textContent = '暂无歌词';
                    lyricsPlaceholder.style.display = 'flex';
                }
            }
        },

        // 按播放时间高亮当前歌词行并居中滚动
        updateLyrics(time) {
            if (!this.currentLyrics || !this.currentLyrics.length) return;
            let idx = 0;
            for (let i = 0; i < this.currentLyrics.length; i++) {
                if (this.currentLyrics[i].time <= time) idx = i; else break;
            }
            if (idx === this._lyricIdx) return;
            this._lyricIdx = idx;
            const scrollEl = document.getElementById('lyrics-scroll');
            const lines = this.lyricLineEls;
            if (!lines || !lines.length) return;
            lines.forEach(el => el.classList.remove('active'));
            const active = lines[idx];
            if (active) {
                active.classList.add('active');
                if (scrollEl) {
                    const target = active.offsetTop - scrollEl.clientHeight / 2 + active.offsetHeight / 2;
                    const max = scrollEl.scrollHeight - scrollEl.clientHeight;
                    const top = Math.max(0, Math.min(target, Math.max(max, 0)));
                    if (typeof scrollEl.scrollTo === 'function') {
                        scrollEl.scrollTo({ top, behavior: 'smooth' });
                    } else {
                        scrollEl.scrollTop = top;
                    }
                }
            }
        },

        loadTrack(index, savedTime = 0) {
            const audio = document.getElementById('bg-music');
            const title = document.querySelector('.music-title');

            if (index < 0 || index >= this.playlist.length) index = 0;
            this.currentTrackIndex = index;

            const track = this.playlist[index];

            audio.removeAttribute('type');
            audio.src = track.src;
            title.textContent = track.title;
            audio.preload = 'metadata';

            this.loadTrackMeta(index);

            if (savedTime > 0) {
                if (audio.readyState >= 1) {
                    audio.currentTime = savedTime;
                } else {
                    const seekOnce = () => { audio.currentTime = savedTime; };
                    audio.addEventListener('loadedmetadata', seekOnce, { once: true });
                }
            }

            audio.onerror = () => {
                console.error('Audio load error:', audio.error, 'Source:', track.src);
                let errText = '音乐加载失败';
                if (audio.error) {
                    if (audio.error.code === 4) errText = '音频格式不受支持';
                    else if (audio.error.code === 2) errText = '网络错误';
                    else if (audio.error.code === 3) errText = '音频解码错误';
                }
                const dict = this.translations[this.currentLang];
                title.textContent = (dict && dict.musicLoadError) ? dict.musicLoadError : errText;
                setTimeout(() => {
                    if (audio.error) {
                        const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
                        if (nextIndex !== this.currentTrackIndex) this.loadTrack(nextIndex);
                    }
                }, 3000);
            };

            audio.oncanplay = () => {
                title.textContent = track.title;
            };

            this.updatePlaylistUI();
            this.saveState();

            if ('mediaSession' in navigator) {
                const parts = track.title.split('-');
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: parts[0] ? parts[0].trim() : track.title,
                    artist: '雨天',
                    album: '雨天的音乐集',
                    artwork: [{ src: '1.png', sizes: '512x512', type: 'image/png' }]
                });
            }
        },

        saveState() {
            try {
                const audio = document.getElementById('bg-music');
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                    index: this.currentTrackIndex,
                    currentTime: audio.currentTime,
                    volume: audio.volume
                }));
            } catch (e) {
                console.warn('localStorage save failed:', e);
            }
        },

        initCustomMusicPlayer() {
            const audio = document.getElementById('bg-music');
            const playPauseBtn = document.querySelector('.play-pause-btn');
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            const progressBar = document.querySelector('.progress-bar');
            const progressBarContainer = document.querySelector('.progress-bar-container');
            const currentTimeEl = document.querySelector('.current-time');
            const totalTimeEl = document.querySelector('.total-time');

            const volumeBtn = document.querySelector('.volume-icon-btn');
            const volumeControl = document.querySelector('.volume-control-horizontal');
            const volumeSlider = document.querySelector('.volume-slider-horizontal');
            const volumePercent = document.querySelector('.volume-percent');

            const musicIconAnim = document.querySelector('.music-icon-anim');
            const playlistBtn = document.getElementById('playlist-btn');
            const playlistPopup = document.getElementById('playlist-popup');
            const playlistList = document.getElementById('playlist-list');

            const formatTime = (s) => {
                if (isNaN(s)) return "0:00";
                const m = Math.floor(s / 60);
                const sec = Math.floor(s % 60);
                return `${m}:${sec.toString().padStart(2, '0')}`;
            };

            const updatePlayState = (isPlaying) => {
                playPauseBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
                if (musicIconAnim) {
                    musicIconAnim.style.opacity = isPlaying ? '1' : '0.4';
                    musicIconAnim.querySelectorAll('span').forEach(bar => {
                        bar.style.animationPlayState = isPlaying ? 'running' : 'paused';
                    });
                }
                const musicCard = document.querySelector('.music-card');
                if (musicCard) musicCard.classList.toggle('playing', isPlaying);
                document.title = isPlaying ? `▶ ${this.playlist[this.currentTrackIndex].title}` : "雨天 | 动态交互式个人主页";
            };

            const playTrack = (index) => {
                this.loadTrack(index);
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.warn('Playback failed:', e);
                        updatePlayState(false);
                    });
                }
            };
            const playNext = () => playTrack((this.currentTrackIndex + 1) % this.playlist.length);
            const playPrev = () => playTrack((this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length);

            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', () => audio.play());
                navigator.mediaSession.setActionHandler('pause', () => audio.pause());
                navigator.mediaSession.setActionHandler('previoustrack', playPrev);
                navigator.mediaSession.setActionHandler('nexttrack', playNext);
            }

            const renderPlaylist = () => {
                playlistList.innerHTML = '';
                this.playlist.forEach((track, i) => {
                    const li = document.createElement('li');
                    li.className = 'playlist-item';
                    if (i === this.currentTrackIndex) li.classList.add('active');
                    li.innerHTML = `<span><i class="fas fa-play"></i> ${track.title}</span>`;
                    li.onclick = () => {
                        playTrack(i);
                        if (window.innerWidth <= 640) playlistPopup.classList.remove('show');
                    };
                    playlistList.appendChild(li);
                });
            };
            this.updatePlaylistUI = renderPlaylist;

            playPauseBtn.addEventListener('click', () => {
                if (audio.readyState === 0 && !audio.src) return;
                audio.paused ? audio.play().catch(()=>{}) : audio.pause();
            });
            prevBtn.addEventListener('click', playPrev);
            nextBtn.addEventListener('click', playNext);

            const seekBy = (delta) => {
                if (!audio.duration) return;
                audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), audio.duration);
                progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                currentTimeEl.textContent = formatTime(audio.currentTime);
                this.saveState();
            };
            document.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                const onProgress = progressBarContainer.contains(e.target);
                switch(e.code) {
                    case 'Space': e.preventDefault(); audio.paused ? audio.play().catch(()=>{}) : audio.pause(); break;
                    case 'ArrowRight': e.preventDefault(); onProgress ? seekBy(5) : playNext(); break;
                    case 'ArrowLeft': e.preventDefault(); onProgress ? seekBy(-5) : playPrev(); break;
                }
            });

            if (volumeBtn) {
                volumeBtn.addEventListener('click', () => {
                    audio.muted = !audio.muted;
                });
            }

            playlistBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = !playlistPopup.classList.contains('show');
                playlistPopup.classList.toggle('show', open);
                playlistBtn.setAttribute('aria-expanded', String(open));
            });

            document.addEventListener('click', (e) => {
                if (playlistBtn && playlistPopup && !playlistBtn.contains(e.target) && !playlistPopup.contains(e.target)) {
                    playlistPopup.classList.remove('show');
                    playlistBtn.setAttribute('aria-expanded', 'false');
                }
            });

            audio.addEventListener('play', () => { updatePlayState(true); this.saveState(); });
            audio.addEventListener('pause', () => { updatePlayState(false); this.saveState(); });
            audio.addEventListener('ended', playNext);

            let lastSave = 0;
            let isDraggingProgress = false;

            audio.addEventListener('timeupdate', () => {
                const { currentTime, duration } = audio;
                this.updateLyrics(currentTime);
                if (duration) {
                    if (!isDraggingProgress) progressBar.style.width = `${(currentTime / duration) * 100}%`;
                    currentTimeEl.textContent = formatTime(currentTime);
                    progressBarContainer.setAttribute('aria-valuenow', String(Math.round(currentTime)));
                    progressBarContainer.setAttribute('aria-valuetext', `${formatTime(currentTime)} / ${formatTime(duration)}`);
                    if (Date.now() - lastSave > 1000) { this.saveState(); lastSave = Date.now(); }
                }
            });

            audio.addEventListener('loadedmetadata', () => {
                totalTimeEl.textContent = formatTime(audio.duration);
                progressBarContainer.setAttribute('aria-valuemax', String(Math.round(audio.duration || 0)));
                let saved = null;
                try {
                    saved = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
                } catch (e) {
                    console.warn('Failed to parse saved state in loadedmetadata', e);
                }
                if (saved?.currentTime) {
                    currentTimeEl.textContent = formatTime(saved.currentTime);
                    if (audio.duration) progressBar.style.width = `${(saved.currentTime / audio.duration) * 100}%`;
                }
            });

            const updateProgressFromEvent = (e) => {
                if (audio.readyState < 2 && !audio.src) return;
                const rect = progressBarContainer.getBoundingClientRect();
                let x = e.clientX - rect.left;
                x = Math.max(0, Math.min(x, rect.width));
                if (audio.duration) {
                    const t = (x / rect.width) * audio.duration;
                    audio.currentTime = t;
                    progressBar.style.width = `${(x / rect.width) * 100}%`;
                    currentTimeEl.textContent = formatTime(t);
                }
            };

            progressBarContainer.addEventListener('pointerdown', (e) => {
                isDraggingProgress = true;
                progressBarContainer.setPointerCapture(e.pointerId);
                updateProgressFromEvent(e);
            });
            progressBarContainer.addEventListener('pointermove', (e) => { if (isDraggingProgress) updateProgressFromEvent(e); });
            progressBarContainer.addEventListener('pointerup', (e) => {
                isDraggingProgress = false;
                progressBarContainer.releasePointerCapture(e.pointerId);
                this.saveState();
            });

            if (volumeSlider) {
                volumeSlider.addEventListener('input', (e) => {
                    audio.volume = e.target.value;
                    audio.muted = false;
                    if (volumePercent) volumePercent.textContent = Math.round(e.target.value * 100) + '%';
                    this.saveState();
                });
            }

            audio.addEventListener('volumechange', () => {
                if (!volumeBtn) return;
                const icon = volumeBtn.querySelector('i');
                if (!icon) return;
                const vol = audio.muted ? 0 : audio.volume;
                if (vol === 0) icon.className = 'fas fa-volume-xmark';
                else if (vol < 0.5) icon.className = 'fas fa-volume-low';
                else icon.className = 'fas fa-volume-high';
                if (volumeSlider) volumeSlider.value = vol;
                if (volumePercent) volumePercent.textContent = Math.round(vol * 100) + '%';
            });

            let saved = null;
            try {
                saved = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            } catch (e) {
                console.warn('Failed to parse saved player state', e);
                localStorage.removeItem(this.STORAGE_KEY);
            }

            if (saved) {
                if (saved.volume !== undefined) {
                    audio.volume = saved.volume;
                    if (volumeSlider) volumeSlider.value = saved.volume;
                    if (volumePercent) volumePercent.textContent = Math.round(saved.volume * 100) + '%';
                }
                this.loadTrack(saved.index || 0, saved.currentTime || 0);
            } else {
                this.loadTrack(0);
            }

            updatePlayState(false);
            renderPlaylist();
        }
    };

    App.init();
});