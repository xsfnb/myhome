/*
 * Liquid Glass & Spring Physics
 * 所有个人信息已替换为占位符，请根据注释修改
 */

document.addEventListener("DOMContentLoaded", () => {
    const App = {
        // ========== 请修改以下播放列表为你的音乐文件 ==========
        playlist: [
            { src: 'song1.mp3', title: 'Song 1 - Artist' },
            { src: 'song2.mp3', title: 'Song 2 - Artist' },
            { src: 'song3.mp3', title: 'Song 3 - Artist' },
            { src: 'song4.mp3', title: 'Song 4 - Artist' }
        ],
        currentTrackIndex: 0,
        lastScrollY: window.scrollY,
        STORAGE_KEY: 'music_player_state',

        // 随机祝福语（可自定义）
        blessings: [
            'Have a nice day ☀️',
            'Enjoy the music 🎵',
            'Stay curious 🌸',
            'Be kind 🌿',
            'Stay positive ✨',
            'Relax and unwind 🎶',
            'Peace and quiet 🌙'
        ],
        currentBlessing: '',

        init() {
            this.currentBlessing = this.blessings[Math.floor(Math.random() * this.blessings.length)];
            this.initPreloader();
            this.initSpatialEngine();
            this.initTheme();
            this.initLanguage();
            this.initSharing();
            this.initScrollIndicator();
            this.initCustomMusicPlayer();
            this.initAnimations();
            this.initDynamicControls();
            this.initEntranceSequence();
        },

        // ========== 空间交互引擎（无需修改） ==========
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
                });
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
                });
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
            document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
            const animate = () => {
                cx += (tx - cx) * 0.08;
                cy += (ty - cy) * 0.08;
                glow.style.left = cx + 'px';
                glow.style.top = cy + 'px';
                requestAnimationFrame(animate);
            };
            animate();
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
            window.addEventListener('load', () => {
                setTimeout(() => {
                    document.querySelector('.preloader').classList.add('fade-out');
                }, 600);
            });
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

        initAnimations() {
            if (typeof Lenis !== 'undefined') {
                const lenis = new Lenis({
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                });
                function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
                requestAnimationFrame(raf);
            }

            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                document.querySelectorAll('.grid-item').forEach((item, i) => {
                    gsap.fromTo(item,
                        { opacity: 0, y: 60, scale: 0.9, rotationX: 10 },
                        {
                            opacity: 1, y: 0, scale: 1, rotationX: 0,
                            duration: 1.4, ease: 'expo.out', delay: i * 0.08,
                            scrollTrigger: { trigger: item, start: 'top 95%', end: 'bottom 60%', toggleActions: 'play none none reverse' }
                        }
                    );
                });
            }
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
            this.applyTheme(saved || (prefersDark ? 'dark' : 'light'));
        },

        applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            this.themeToggle.innerHTML = `<i class="fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>`;
        },

        initLanguage() {
            // ========== 修改以下翻译中的姓名、邮箱等 ==========
            this.translations = {
                zh: { name: "你的名字", contact: "联系方式", email: "your-email@example.com", footer: "你的座右铭", morning: "早上好", noon: "中午好", evening: "晚上好", from: "你好, 来自 {country} 的朋友", unknown: "你好, 陌生人", weatherPrefix: "当前天气", weatherError: "天气加载失败", apiKeyError: "API密钥配置错误", linkCopied: "链接已复制！", hobbyTitle: "爱好", hobbyMusic: "听音乐", loading: "加载中...", musicLoadError: "音乐加载失败" },
                'zh-TW': { name: "你的名字", contact: "聯絡方式", email: "your-email@example.com", footer: "你的座右銘", morning: "早上好", noon: "中午好", evening: "晚上好", from: "你好, 來自 {country} 的朋友", unknown: "你好, 陌生人", weatherPrefix: "當前天氣", weatherError: "天氣載入失敗", apiKeyError: "API金鑰配置錯誤", linkCopied: "連結已複製！", hobbyTitle: "愛好", hobbyMusic: "聽音樂", loading: "載入中...", musicLoadError: "音樂載入失敗" },
                ja: { name: "あなたの名前", contact: "連絡先", email: "your-email@example.com", footer: "あなたの座右の銘", morning: "おはよう", noon: "こんにちは", evening: "こんばんは", from: "{country} からの訪問者様、こんにちは", unknown: "こんにちは、見知らぬ方", weatherPrefix: "現在の天気", weatherError: "天気の読み込みに失敗しました", apiKeyError: "APIキーの設定エラー", linkCopied: "リンクがコピーされました！", hobbyTitle: "趣味", hobbyMusic: "音楽鑑賞", loading: "読み込み中...", musicLoadError: "音楽の読み込みに失敗しました" },
                en: { name: "Your Name", contact: "Contact", email: "your-email@example.com", footer: "Your favorite quote", morning: "Good morning", noon: "Good afternoon", evening: "Good evening", from: "Hello, friend from {country}", unknown: "Hello, stranger", weatherPrefix: "Current weather", weatherError: "Failed to load weather", apiKeyError: "API key configuration error", linkCopied: "Link copied!", hobbyTitle: "Hobby", hobbyMusic: "Listening to Music", loading: "Loading...", musicLoadError: "Music load failed" }
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
                this.langMenu.style.display = this.langMenu.style.display === "block" ? "none" : "block";
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

            let weatherSuffix = '';
            if (this.weatherData && !this.weatherData.error && !this.weatherData.apiKeyError) {
                const cond = this.weatherData.condition.toLowerCase();
                if (cond.includes('晴')) weatherSuffix = '☀️ 晴空万里，';
                else if (cond.includes('云')) weatherSuffix = '⛅ 多云，';
                else if (cond.includes('雨')) weatherSuffix = '🌧️ 下雨天，记得带伞，';
                else if (cond.includes('雪')) weatherSuffix = '❄️ 下雪了，注意保暖，';
                else if (cond.includes('雾')) weatherSuffix = '🌫️ 有雾，出行小心，';
                else weatherSuffix = '🌤️ 天气不错，';
            } else {
                weatherSuffix = '🌿 今日，';
            }

            timeEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${weatherSuffix}${greet} ${hh.padStart(2,'0')}:${mm}:${ss} · ${this.currentBlessing}`;
        },

        applyLanguage(lang) {
            if (!this.translations[lang]) return;
            this.currentLang = lang;
            localStorage.setItem("selectedLang", lang);
            document.documentElement.lang = lang.split('-')[0];
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

        async fetchGeoData() {
            // ========== 请替换为自己的 WeatherAPI 密钥 ==========
            const apiKey = 'YOUR_WEATHERAPI_KEY';  // 从 https://www.weatherapi.com/ 获取
            if (apiKey === 'YOUR_WEATHERAPI_KEY') {
                this.weatherData = { apiKeyError: true };
            } else {
                try {
                    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=auto:ip`);
                    if (!res.ok) throw new Error('Weather API response not OK');
                    const data = await res.json();
                    this.visitorCountry = data.location.country || null;
                    this.weatherData = {
                        temp_c: data.current.temp_c,
                        condition: data.current.condition.text,
                        icon: data.current.condition.icon
                    };
                } catch (error) {
                    this.weatherData = { error: true };
                    try {
                        const ipRes = await fetch("https://ipapi.co/json/");
                        const ipData = await ipRes.json();
                        this.visitorCountry = ipData.country_name || null;
                    } catch {
                        this.visitorCountry = null;
                    }
                }
            }
            this.updateWeatherInfo();
            this.updateIpGreeting();
        },

        updateWeatherInfo() {
            const el = document.getElementById("weatherInfo");
            if (!el) return;
            const dict = this.translations[this.currentLang];
            if (this.weatherData === null) return;
            if (this.weatherData.apiKeyError) {
                el.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${dict.apiKeyError}`;
                return;
            }
            if (this.weatherData.error) {
                el.innerHTML = `<i class="fa-solid fa-cloud-bolt"></i> ${dict.weatherError}`;
                return;
            }
            el.innerHTML = `<img src="https:${this.weatherData.icon}" alt="${this.weatherData.condition}" style="height:1.2em;vertical-align:middle;margin-right:8px;filter:drop-shadow(0 0 4px rgba(0,122,255,0.3));"> ${dict.weatherPrefix}: ${this.weatherData.condition}, ${this.weatherData.temp_c}°C`;
        },

        updateIpGreeting() {
            const el = document.getElementById("ipGreeting");
            if (!el) return;
            const dict = this.translations[this.currentLang];
            if (this.visitorCountry === null && !this.weatherData?.error && !this.weatherData) return;
            const text = this.visitorCountry ? dict.from.replace("{country}", this.visitorCountry) : dict.unknown;
            el.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${text}`;
        },

        // ========== 音乐播放器核心（无需修改） ==========
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
                    artist: 'Your Name',  // 可修改为你的名字
                    album: 'Your Music Collection',
                    artwork: [{ src: 'avatar.png', sizes: '512x512', type: 'image/png' }]
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
            const vinylRecord = document.querySelector('.vinyl-record');
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
                if (vinylRecord) vinylRecord.style.animationPlayState = isPlaying ? 'running' : 'paused';
                document.title = isPlaying ? `▶ ${this.playlist[this.currentTrackIndex].title}` : "Your Name | Interactive Personal Homepage";
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

            document.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                switch(e.code) {
                    case 'Space': e.preventDefault(); audio.paused ? audio.play().catch(()=>{}) : audio.pause(); break;
                    case 'ArrowRight': e.preventDefault(); playNext(); break;
                    case 'ArrowLeft': e.preventDefault(); playPrev(); break;
                }
            });

            if (volumeBtn) {
                volumeBtn.addEventListener('click', () => {
                    audio.muted = !audio.muted;
                });
            }

            playlistBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playlistPopup.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (playlistBtn && playlistPopup && !playlistBtn.contains(e.target) && !playlistPopup.contains(e.target)) {
                    playlistPopup.classList.remove('show');
                }
            });

            audio.addEventListener('play', () => { updatePlayState(true); this.saveState(); });
            audio.addEventListener('pause', () => { updatePlayState(false); this.saveState(); });
            audio.addEventListener('ended', playNext);

            let lastSave = 0;
            let isDraggingProgress = false;

            audio.addEventListener('timeupdate', () => {
                const { currentTime, duration } = audio;
                if (duration) {
                    if (!isDraggingProgress) progressBar.style.width = `${(currentTime / duration) * 100}%`;
                    currentTimeEl.textContent = formatTime(currentTime);
                    if (Date.now() - lastSave > 1000) { this.saveState(); lastSave = Date.now(); }
                }
            });

            audio.addEventListener('loadedmetadata', () => {
                totalTimeEl.textContent = formatTime(audio.duration);
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