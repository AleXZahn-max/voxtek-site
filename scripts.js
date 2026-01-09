  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
  import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, doc, where, limit, getDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
  import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDaYxxhxjrvjVgqYcvPH53989Wr5dMgqHI",
    authDomain: "voxtek-system.firebaseapp.com",
    projectId: "voxtek-system",
    storageBucket: "voxtek-system.firebasestorage.app",
    messagingSenderId: "137141100080",
    appId: "1:137141100080:web:1b798f2e7aa12a313cd7f5"
  };

  const app = initializeApp(firebaseConfig);
  
  window.auth = getAuth(app);
  window.db = getFirestore(app);
  window.storage = getStorage(app);

  window.fbLogin = signInWithEmailAndPassword;
  window.fbRegister = createUserWithEmailAndPassword;
  window.fbLogout = signOut;
  window.fbAuthListener = onAuthStateChanged;
  window.fbUpdateProfile = updateProfile;
  
  window.fbAdd = addDoc;
  window.fbSet = setDoc;
  window.fbDoc = doc;
  window.fbCol = collection;
  window.fbSnap = onSnapshot;
  window.fbQuery = query;
  window.fbOrder = orderBy;
  window.fbWhere = where;
  window.fbTime = serverTimestamp;
  window.fbLimit = limit;
  window.fbGet = getDoc;
  window.fbDelete = deleteDoc;
  window.fbGetDocs = getDocs;

  window.fbRef = ref;
  window.fbUpload = uploadBytes;
  window.fbUploadResumable = uploadBytesResumable;
  window.fbUrl = getDownloadURL;

  console.log("VOXTEK CLOUD SYSTEM: ONLINE");

  if (window.AuthSystem) {
      window.AuthSystem.init();
  }

            // --- 0.1 STATIC EFFECT (OPTIMIZED) ---
            const StaticFX = {
                canvas: document.getElementById('staticCanvas'),
                ctx: null,
                active: true,
                fps: 15, // Ограничиваем FPS для шума (было 60)
                now: 0,
                then: Date.now(),
                interval: 1000 / 15, // Интервал обновления
                delta: 0,

                init() {
                    if(!this.canvas) return;
                    this.ctx = this.canvas.getContext('2d');
                    this.resize();
                    window.addEventListener('resize', () => this.resize());
                    
                    // На мобильных снижаем качество еще сильнее
                    if (window.innerWidth < 768) {
                        this.fps = 10;
                        this.interval = 1000 / 10;
                    }
                    
                    this.loop();
                },
                resize() {
                    if (this.canvas && this.canvas.parentElement) {
                        const rect = this.canvas.parentElement.getBoundingClientRect();
                        // Рендерим в 2 раза меньше пикселей для скорости
                        const scale = window.innerWidth < 768 ? 0.5 : 1; 
                        this.canvas.width = rect.width * scale;
                        this.canvas.height = rect.height * scale;
                    }
                },
                toggle(on) {
                    this.active = on;
                    this.canvas.style.opacity = on ? '0.15' : '0';
                    if (on) this.resize();
                },
                loop() {
                    requestAnimationFrame(() => this.loop());

                    if (!this.active || !this.canvas) return;

                    this.now = Date.now();
                    this.delta = this.now - this.then;

                    if (this.delta > this.interval) {
                        this.then = this.now - (this.delta % this.interval);

                        const w = this.canvas.width;
                        const h = this.canvas.height;
                        
                        // Рисуем шум только если есть размер
                        if (w > 0 && h > 0) {
                            const idata = this.ctx.createImageData(w, h);
                            const buffer32 = new Uint32Array(idata.data.buffer);
                            
                            // Заполняем только 10% пикселей (быстрее)
                            for(let i = 0; i < buffer32.length; i++) {
                                if (Math.random() < 0.1) buffer32[i] = 0xffffffff;
                            }
                            this.ctx.putImageData(idata, 0, 0);
                        }
                    }
                }
            };

            // --- 11. ROUTER ---
            const Router = {
                go(page) {
                    document.querySelectorAll('.view-section')
                        .forEach(v => v.classList.remove('active-view'));

                    const target = document.getElementById(`view-${page}`);
                    if (!target) return;

                    target.classList.add('active-view');

                    if (page === 'storage' && window.VaultSystem) {
                        VaultSystem.init();
                    }
                }
            };

            document.addEventListener('click', e => {
                const link = e.target.closest('[data-route]');
                if (!link) return;

                e.preventDefault();
                Router.go(link.dataset.route);
            });

            // --- 1. SOUND ENGINE (SFX) ---
            const SoundFX = {
                ctx: new (window.AudioContext || window.webkitAudioContext)(),
                playTone(freq, type, duration) {
                    if (this.ctx.state === 'suspended') this.ctx.resume();
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + duration);
                },
                hover() { this.playTone(400, 'sine', 0.1); },
                click() { this.playTone(800, 'square', 0.1); },
                error() { this.playTone(150, 'sawtooth', 0.3); },
                staticNoise() {
                    const bufferSize = this.ctx.sampleRate * 2.0; 
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                    const noise = this.ctx.createBufferSource();
                    noise.buffer = buffer;
                    const gain = this.ctx.createGain();
                    gain.gain.value = 0.1;
                    noise.connect(gain);
                    gain.connect(this.ctx.destination);
                    noise.start();
                    noise.loop = true; 
                }
            };
            window.SoundFX = SoundFX;
            // --- 1.1 AMBIENT MUSIC SYSTEM (UPDATED) ---
            const MusicSystem = {
                audio: document.getElementById('bg-music'),
                menu: document.getElementById('slide-music-menu'),
                toggleBtn: document.getElementById('toggleMenuBtn'),
                playBtn: document.getElementById('playPauseBtn'),
                volSlider: document.getElementById('volumeControl'),
                seekSlider: document.getElementById('seekControl'),
                canvas: document.getElementById('audioCanvas'),
                localInput: document.getElementById('localAudioInput'),
                playlistContainer: document.getElementById('audioPlaylist'),
                playlist: [], 
                currentIndex: -1,
                ctx: null,
                analyser: null,
                source: null,
                audioCtx: null,
                animationId: null,
                useSimulation: false,
                isDragging: false,

                init() {
                    // Базовые настройки
                    this.audio.volume = 0.2; 
                    this.playlist.push({ name: 'Brighter', url: 'embient.mp3' });
                    this.currentIndex = 0;
                    this.renderPlaylist();

                    // --- СЛУШАТЕЛИ СОБЫТИЙ ---
                    this.toggleBtn.addEventListener('click', () => {
                        this.menu.classList.toggle('open');
                        SoundFX.click();
                    });

                    this.playBtn.addEventListener('click', () => {
                        if (this.audio.paused) {
                            this.playCurrent();
                        } else {
                            this.audio.pause();
                            this.playBtn.textContent = "RESUME STREAM";
                        }
                        SoundFX.click();
                    });

                    this.audio.addEventListener('ended', () => {
                        this.playNext();
                    });

                    this.volSlider.addEventListener('input', (e) => {
                        this.audio.volume = e.target.value;
                    });

                    this.audio.addEventListener('timeupdate', () => {
                        if (!this.isDragging && !isNaN(this.audio.duration)) {
                            const pct = (this.audio.currentTime / this.audio.duration) * 100;
                            this.seekSlider.value = pct;
                            document.getElementById('currentTime').textContent = this.fmtTime(this.audio.currentTime);
                            document.getElementById('durationTime').textContent = this.fmtTime(this.audio.duration);
                        }
                    });

                    this.seekSlider.addEventListener('mousedown', () => this.isDragging = true);
                    this.seekSlider.addEventListener('touchstart', () => this.isDragging = true);
                    this.seekSlider.addEventListener('change', (e) => {
                         const time = (e.target.value / 100) * this.audio.duration;
                         this.audio.currentTime = time;
                         this.isDragging = false;
                    });

                    document.getElementById('coverUpload').addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if(file) {
                             const url = URL.createObjectURL(file);
                             document.getElementById('coverImg').src = url;
                        }
                    });

                    // Загрузка локальных файлов (и отправка в облако)
                    this.localInput.addEventListener('change', (e) => {
                         const files = Array.from(e.target.files);
                         if (files.length > 0) {
                             files.forEach(file => {
                                 // Вызываем CloudSystem для загрузки в базу (тип 'audio')
                                 if(window.CloudSystem) window.CloudSystem.uploadMedia(file, 'audio');
                             });
                             voxNotify(`INITIATING CLOUD UPLOAD (${files.length} FILES)...`, 'info');
                         }
                    });

                    // 🔥 ЗАГРУЗКА СОХРАНЕННЫХ ТРЕКОВ ИЗ БАЗЫ 🔥
                    setTimeout(() => {
                        if(window.db && window.auth.currentUser) {
                            const q = window.fbQuery(
                                window.fbCol(window.db, "audios"), 
                                window.fbWhere("author", "==", window.auth.currentUser.uid), 
                                window.fbOrder("createdAt", "desc"),
                                window.fbLimit(50)
                            );
                            
                            // Слушаем изменения в базе (реальное время)
                            window.fbSnap(q, (snapshot) => {
                                snapshot.docChanges().forEach((change) => {
                                    // Если добавлен новый трек
                                    if (change.type === "added") {
                                        const data = change.doc.data();
                                        // Проверяем на дубликаты
                                        if(!this.playlist.some(t => t.url === data.url)) {
                                            this.playlist.push({ 
                                                id: change.doc.id, 
                                                name: data.name, 
                                                url: data.url, 
                                                isCloud: true 
                                            });
                                            this.renderPlaylist();
                                        }
                                    }
                                    // Если удален трек
                                    if (change.type === "removed") {
                                        this.playlist = this.playlist.filter(t => t.id !== change.doc.id);
                                        this.renderPlaylist();
                                    }
                                });
                            });
                        }
                    }, 2500); // Даем время на логин
                },

                renderPlaylist() {
                    this.playlistContainer.innerHTML = '';
                    this.playlist.forEach((track, idx) => {
                        const div = document.createElement('div');
                        div.className = `playlist-item ${idx === this.currentIndex ? 'active' : ''}`;
                        div.innerHTML = `
                            <span>${idx+1}. ${track.name}</span>
                            <span class="playlist-remove" onclick="MusicSystem.removeTrack(${idx}, event)">×</span>
                        `;
                        div.onclick = (e) => {
                            if(!e.target.classList.contains('playlist-remove')) {
                                this.currentIndex = idx;
                                this.playCurrent();
                            }
                        };
                        this.playlistContainer.appendChild(div);
                    });
                },

                async removeTrack(idx, e) {
                    e.stopPropagation();
                    const track = this.playlist[idx];
                    
                    // УДАЛЕНИЕ ИЗ ОБЛАКА
                    if (track.isCloud && track.id) {
                        if(await confirm("DELETE AUDIO FROM CLOUD?")) {
                            window.fbDelete(window.fbDoc(window.db, "audios", track.id));
                            voxNotify("AUDIO REMOVED FROM CLOUD", "success");
                        }
                        return; // Список обновится сам через fbSnap
                    }
                    
                    // УДАЛЕНИЕ ЛОКАЛЬНОГО
                    this.playlist.splice(idx, 1);
                    if(this.currentIndex === idx) {
                        this.audio.pause();
                        this.currentIndex = -1;
                        this.playBtn.textContent = "PLAY STREAM";
                    } else if (this.currentIndex > idx) this.currentIndex--;
                    this.renderPlaylist();
                },

                playCurrent() {
                    if(this.currentIndex < 0 || this.currentIndex >= this.playlist.length) return;
                    this.loadTrack(this.currentIndex);
                    this.startAudioContext();
                    this.audio.play().then(() => {
                        this.playBtn.textContent = "PAUSE STREAM";
                    }).catch(err => console.log("Autoplay blocked", err));
                    this.renderPlaylist();
                },

                playNext() {
                    if(this.currentIndex < this.playlist.length - 1) {
                        this.currentIndex++;
                        this.playCurrent();
                    } else {
                        this.currentIndex = 0;
                        this.playCurrent();
                    }
                },
                
                loadTrack(idx) {
                    const track = this.playlist[idx];
                    let finalUrl = track.url;
                    
                    this.audio.crossOrigin = "anonymous";
                    this.audio.src = finalUrl;
                    this.useSimulation = false;
                    const coverText = document.querySelector('.cover-text');
                    if(coverText) coverText.textContent = track.name.substring(0, 20);
                },

                fmtTime(s) {
                    const m = Math.floor(s / 60);
                    const sec = Math.floor(s % 60);
                    return `${m < 10 ? '0'+m : m}:${sec < 10 ? '0'+sec : sec}`;
                },

                startAudioContext() {
                    if (this.audioCtx) return;
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.audioCtx = new AudioContext();

                    try {
                        this.analyser = this.audioCtx.createAnalyser();
                        this.source = this.audioCtx.createMediaElementSource(this.audio);
                        this.source.connect(this.analyser);
                        this.analyser.connect(this.audioCtx.destination);
                        this.analyser.fftSize = 64; 
                        this.useSimulation = false;
                    } catch (e) {
                        console.log("Visualizer Error (CORS). Using simulation.");
                        this.useSimulation = true;
                    }
                    this.draw();
                },

                draw() {
                    if (!this.canvas) return;
                    const ctx = this.canvas.getContext('2d');
                    const w = this.canvas.width;
                    const h = this.canvas.height;
                    
                    let bufferLength, dataArray;
                    if (!this.useSimulation && this.analyser) {
                        bufferLength = this.analyser.frequencyBinCount;
                        dataArray = new Uint8Array(bufferLength);
                    } else {
                        bufferLength = 32;
                    }

                    const drawFrame = () => {
                        this.animationId = requestAnimationFrame(drawFrame);
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
                        ctx.fillRect(0, 0, w, h);

                        const barWidth = (w / bufferLength) * 2.5;
                        let barHeight;
                        let x = 0;
                        let isSilent = true;

                        if (!this.useSimulation && this.analyser) {
                            this.analyser.getByteFrequencyData(dataArray);
                            for(let i=0; i<bufferLength; i++) {
                                if(dataArray[i] > 0) isSilent = false;
                            }
                        }

                        for(let i = 0; i < bufferLength; i++) {
                            if (!this.useSimulation && !isSilent) {
                                barHeight = dataArray[i] / 2;
                            } else if (!this.audio.paused) {
                                barHeight = Math.random() * (h - 10);
                            } else {
                                barHeight = 2; 
                            }
                            ctx.fillStyle = `rgb(0, ${barHeight + 100}, 255)`; 
                            ctx.fillRect(x, h - barHeight, barWidth, barHeight);
                            x += barWidth + 1;
                        }
                    };
                    drawFrame();
                }
            };
            window.MusicSystem = MusicSystem;
            MusicSystem.init();

            // --- 1.2 CUSTOM VIDEO PLAYER SYSTEM (SAFE MODE) ---
            const VideoSystem = {
                // Ищем элементы (могут быть null, если их нет в HTML)
                input: document.getElementById('videoInput'),
                video: document.getElementById('customVideoPlayer'),
                wrapper: document.getElementById('broadcastContainer'), 
                playBtn: document.getElementById('vPlayBtn'),
                stopBtn: document.getElementById('vStopBtn'),
                fullBtn: document.getElementById('vFull'),
                pipBtn: document.getElementById('vPipBtn'),
                loopBtn: document.getElementById('vLoopBtn'),
                speedSel: document.getElementById('vSpeed'),
                progress: document.getElementById('vProgress'),
                vol: document.getElementById('vVol'),
                timeDisplay: document.getElementById('vTime'),
                statusTag: document.getElementById('signalStatus'),
                placeholder: document.getElementById('vidPlaceholder'),
                playlistContainer: document.getElementById('videoPlaylist'),
                
                // Переменные состояния
                playlist: [],
                currentIndex: -1,
                hideControlsTimer: null,
                isDragging: false,
                isLooping: false,
                
                init() {
                    StaticFX.init();
                    
                    // ЗАЩИТА: Если нет главных элементов, не запускаемся
                    if(!this.wrapper || !this.video) {
                        console.warn("VideoSystem: Wrapper or Video element missing in HTML");
                        return;
                    }

                    // 1. Drag & Drop
                    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                        this.wrapper.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
                    });
                    this.wrapper.addEventListener('drop', (e) => { this.handleFiles(e.dataTransfer.files); });

                    // 2. Загрузка файла через кнопку
                    if(this.input) {
                        this.input.addEventListener('change', (e) => {
                            const files = Array.from(e.target.files);
                            if (files.length > 0) {
                                if (confirm("UPLOAD TO CLOUD ARCHIVE? (Private Storage)")) {
                                    files.forEach(file => CloudSystem.uploadMedia(file, 'video'));
                                } else {
                                    this.handleFiles(e.target.files);
                                }
                            }
                        });
                    }

                    // --- КНОПКИ УПРАВЛЕНИЯ (С ПРОВЕРКАМИ) ---
                    
                    // Play / Pause
                    if(this.playBtn) this.playBtn.addEventListener('click', () => this.togglePlay());
                    this.video.addEventListener('click', () => this.togglePlay());
                    
                    // Stop
                    if(this.stopBtn) {
                        this.stopBtn.addEventListener('click', () => {
                            this.video.pause();
                            this.video.currentTime = 0;
                            if(this.playBtn) this.playBtn.textContent = "► PLAY";
                            if(this.statusTag) this.statusTag.textContent = "SIGNAL STATUS: STANDBY";
                            StaticFX.toggle(true);
                            if(this.placeholder) this.placeholder.style.display = 'block';
                        });
                    }

                    // Fullscreen + Авто-поворот экрана
                    if(this.fullBtn) {
                        this.fullBtn.addEventListener('click', async () => {
                            try {
                                if (!document.fullscreenElement) {
                                    // 1. Входим в фулскрин
                                    if(this.wrapper.requestFullscreen) await this.wrapper.requestFullscreen();
                                    else if(this.wrapper.webkitRequestFullscreen) await this.wrapper.webkitRequestFullscreen();
                                    
                                    // 2. Пытаемся повернуть экран горизонтально (Android)
                                    if (screen.orientation && screen.orientation.lock) {
                                        screen.orientation.lock('landscape').catch(err => console.log("Rotation locked by OS"));
                                    }
                                } else {
                                    // 3. Выходим из фулскрина
                                    if(document.exitFullscreen) await document.exitFullscreen();
                                    else if(document.webkitExitFullscreen) await document.webkitExitFullscreen();
                                    
                                    // 4. Возвращаем вертикальный режим (или разблокируем)
                                    if (screen.orientation && screen.orientation.unlock) {
                                        screen.orientation.unlock();
                                    }
                                }
                            } catch(e) { console.error(e); }
                        });
                    }

                    // Picture-in-Picture
                    if(this.pipBtn) {
                        this.pipBtn.addEventListener('click', async () => {
                            try {
                                if (document.pictureInPictureElement) await document.exitPictureInPicture();
                                else if (document.pictureInPictureEnabled && this.video.src) await this.video.requestPictureInPicture();
                            } catch(e) { console.error(e); }
                        });
                    }

                    // Скорость
                    if(this.speedSel) {
                        this.speedSel.addEventListener('change', (e) => {
                            this.video.playbackRate = parseFloat(e.target.value);
                            voxNotify(`SPEED: ${e.target.value}x`, 'info');
                        });
                    }

                    // --- 3. FORCED VIEW LISTENER (ВНУТРИ VideoSystem.init) ---
                    // Слушаем специальный документ в базе
                    if(window.db) {
                        window.fbSnap(window.fbDoc(window.db, "system_state", "broadcast"), (doc) => {
                            const data = doc.data();
                            // Проверяем, свежий ли приказ (не старее 10 секунд), чтобы не срабатывал при каждом входе
                            if (data && data.active && data.timestamp) {
                                const now = Date.now();
                                const cmdTime = data.timestamp.toMillis ? data.timestamp.toMillis() : now; // Защита от null
                                
                                // Если приказ был дан менее 30 секунд назад - выполняем
                                if (now - cmdTime < 30000) {
                                    // 1. Принудительно открываем вкладку Видео
                                    Router.go('video');
                                    
                                    // 2. Включаем видео
                                    this.video.src = data.url;
                                    this.video.play().then(() => {
                                        voxNotify("MANDATORY BROADCAST INITIATED", "error");
                                    }).catch(() => {
                                        // Если браузер заблокировал звук, показываем кнопку
                                        alert("PRIORITY MESSAGE RECEIVED. CLICK TO PLAY.");
                                        this.video.play();
                                    });

                                    // 3. Блокируем плеер (визуально)
                                    this.statusTag.textContent = "OVERRIDE BY VOXTEK";
                                    this.statusTag.style.background = "var(--alert-red)";
                                    
                                    // Очищаем локальное управление, чтобы не мешали
                                    this.stopBtn.style.display = 'none';
                                }
                            }
                        });
                    }

                    // Loop (Повтор)
                    if(this.loopBtn) {
                        this.loopBtn.addEventListener('click', () => {
                            this.isLooping = !this.isLooping;
                            this.video.loop = this.isLooping;
                            this.loopBtn.style.color = this.isLooping ? "var(--vox-cyan)" : "#666";
                            this.loopBtn.style.borderColor = this.isLooping ? "var(--vox-cyan)" : "#444";
                            voxNotify(this.isLooping ? "LOOP: ON" : "LOOP: OFF", "info");
                        });
                    }

                    // Громкость
                    if(this.vol) this.vol.addEventListener('input', (e) => { this.video.volume = e.target.value; });
                    
                    // --- ПРОГРЕСС БАР (ИСПРАВЛЕНИЕ ОШИБКИ) ---
                    // Обновляем ползунок, когда видео играет
                    this.video.addEventListener('timeupdate', () => {
                        if(!this.isDragging && this.video.duration && this.progress) {
                            const pct = (this.video.currentTime / this.video.duration) * 100;
                            this.progress.value = pct;
                            if(this.timeDisplay) this.timeDisplay.textContent = `${this.fmt(this.video.currentTime)} / ${this.fmt(this.video.duration)}`;
                        }
                    });

                    // Если ползунок есть - добавляем управление
                    if(this.progress) {
                        this.progress.addEventListener('input', (e) => {
                            this.isDragging = true;
                            if(this.video.duration && this.timeDisplay) {
                                const time = (e.target.value / 100) * this.video.duration;
                                this.timeDisplay.textContent = `${this.fmt(time)} / ${this.fmt(this.video.duration)}`;
                            }
                        });
                        this.progress.addEventListener('change', (e) => {
                            if(this.video.duration) this.video.currentTime = (e.target.value / 100) * this.video.duration;
                            this.isDragging = false;
                        });
                    }
                    
                    // Когда видео кончилось
                    this.video.addEventListener('ended', () => {
                        if(!this.isLooping) this.playNext();
                    });
                    
                    this.wrapper.addEventListener('mousemove', () => {
                        this.wrapper.classList.add('user-active');
                        clearTimeout(this.hideControlsTimer);
                        
                        // Если видео играет, запускаем таймер скрытия
                        if(!this.video.paused) {
                            this.hideControlsTimer = setTimeout(() => {
                                this.wrapper.classList.remove('user-active');
                            }, 5000);
                        }
                    });
                    
                    this.wrapper.addEventListener('touchstart', () => {
                        this.wrapper.classList.add('user-active');
                        clearTimeout(this.hideControlsTimer);
                        this.hideControlsTimer = setTimeout(() => {
                            this.wrapper.classList.remove('user-active');
                        }, 5000);
                    }, { passive: true });

                    // Если мышка ушла с видео - сразу прячем (опционально)
                    this.wrapper.addEventListener('mouseleave', () => {
                         if(!this.video.paused) this.wrapper.classList.remove('user-active');
                    });
                    
                    // Горячие клавиши
                    document.addEventListener('keydown', (e) => {
                        const view = document.getElementById('view-video');
                        if (!view || !view.classList.contains('active-view')) return;
                        if (e.target.tagName === 'INPUT') return;

                        switch(e.code) {
                            case 'Space': e.preventDefault(); this.togglePlay(); break;
                            case 'ArrowRight': this.video.currentTime += 5; voxNotify("+5s", "info"); break;
                            case 'ArrowLeft': this.video.currentTime -= 5; voxNotify("-5s", "info"); break;
                            case 'ArrowUp': 
                                e.preventDefault(); 
                                this.video.volume = Math.min(1, this.video.volume + 0.1); 
                                if(this.vol) this.vol.value = this.video.volume;
                                break;
                            case 'ArrowDown': 
                                e.preventDefault(); 
                                this.video.volume = Math.max(0, this.video.volume - 0.1); 
                                if(this.vol) this.vol.value = this.video.volume;
                                break;
                        }
                    });

                    // Загрузка плейлиста из базы
                    setTimeout(() => {
                        if(window.db && window.auth.currentUser) {
                            const q = window.fbQuery(
                                window.fbCol(window.db, "videos"), 
                                window.fbWhere("author", "==", window.auth.currentUser.uid), 
                                window.fbOrder("createdAt", "desc"),
                                window.fbLimit(20)
                            );
                            window.fbSnap(q, (snapshot) => {
                                snapshot.docChanges().forEach((change) => {
                                    if (change.type === "added") {
                                        const data = change.doc.data();
                                        if(!this.playlist.some(v => v.id === change.doc.id)) {
                                            this.playlist.push({ id: change.doc.id, name: data.name, url: data.url, isCloud: true });
                                            this.renderPlaylist();
                                        }
                                    }
                                    if (change.type === "removed") {
                                        this.playlist = this.playlist.filter(v => v.id !== change.doc.id);
                                        this.renderPlaylist();
                                    }
                                });
                            });
                        }
                    }, 2000);
                },

                // Стандартные методы (без изменений логики, только проверки)
                handleFiles(files) {
                    if (files.length > 0) {
                        Array.from(files).forEach(file => {
                            if (file.type.startsWith('video/')) {
                                const localUrl = URL.createObjectURL(file);
                                this.playlist.push({ name: file.name, url: localUrl, isCloud: false });
                                voxNotify(`LOCAL LOAD: ${file.name.substr(0,10)}...`, 'success');
                            }
                        });
                        this.renderPlaylist();
                        if (this.currentIndex === -1) { this.currentIndex = 0; this.playCurrent(); }
                    }
                },

                renderPlaylist() {
                    if(!this.playlistContainer) return;
                    this.playlistContainer.innerHTML = '';
                    this.playlist.forEach((track, idx) => {
                        const div = document.createElement('div');
                        div.className = `playlist-item ${idx === this.currentIndex ? 'active' : ''}`;
                        div.innerHTML = `<span>${idx+1}. ${track.name}</span><span class="playlist-remove" onclick="VideoSystem.removeTrack(${idx}, event)">×</span>`;
                        div.onclick = (e) => { if(!e.target.classList.contains('playlist-remove')) { this.currentIndex = idx; this.playCurrent(); }};
                        this.playlistContainer.appendChild(div);
                    });
                },

                removeTrack(idx, e) {
                    e.stopPropagation();
                    const track = this.playlist[idx];
                    if (track.isCloud && track.id) {
                        if(confirm("DELETE FROM CLOUD?")) {
                            window.fbDelete(window.fbDoc(window.db, "videos", track.id));
                        }
                        return;
                    }
                    this.playlist.splice(idx, 1);
                    if(this.currentIndex === idx) {
                        this.video.pause();
                        this.currentIndex = -1;
                        StaticFX.toggle(true);
                        if(this.placeholder) this.placeholder.style.display = 'block';
                    } else if (this.currentIndex > idx) this.currentIndex--;
                    this.renderPlaylist();
                },

                loadTrack(idx) {
                    const track = this.playlist[idx];
                    this.video.src = track.url;
                    this.video.play().catch(e => console.log("Autoplay blocked"));
                    if(this.statusTag) {
                        this.statusTag.textContent = `SIGNAL: ${track.name.substring(0,20)}`;
                        this.statusTag.style.background = "var(--vox-cyan)";
                    }
                    if(this.placeholder) this.placeholder.style.display = 'none';
                    if(this.playBtn) this.playBtn.textContent = "|| PAUSE";
                    StaticFX.toggle(false);
                    this.renderPlaylist();
                },

                playCurrent() { if(this.currentIndex >= 0 && this.currentIndex < this.playlist.length) this.loadTrack(this.currentIndex); },
                
                playNext() {
                    if(this.currentIndex < this.playlist.length - 1) {
                        this.currentIndex++;
                        this.playCurrent();
                    } else {
                        if(this.playBtn) this.playBtn.textContent = "► PLAY";
                        if(this.statusTag) this.statusTag.textContent = "END TRANSMISSION";
                        StaticFX.toggle(true);
                    }
                },

                togglePlay() {
                    if(!this.video.src) return;
                    if(this.video.paused) {
                        this.video.play();
                        if(this.playBtn) this.playBtn.textContent = "|| PAUSE";
                        if(this.statusTag) this.statusTag.style.background = "var(--vox-cyan)";
                        StaticFX.toggle(false);
                        if(this.placeholder) this.placeholder.style.display = 'none';
                    } else {
                        this.video.pause();
                        if(this.playBtn) this.playBtn.textContent = "► PLAY";
                        if(this.statusTag) {
                            this.statusTag.textContent = "PAUSED";
                            this.statusTag.style.background = "#555";
                        }
                    }
                },

                fmt(s) { const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${m<10?'0'+m:m}:${sec<10?'0'+sec:sec}`; }
            };
            window.VideoSystem = VideoSystem;
            VideoSystem.init();

            // --- KEYBIND HANDLER ---
            document.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                if (document.activeElement === document.getElementById('customVideoPlayer') || 
                   (document.getElementById('view-video').classList.contains('active-view') && !document.getElementById('slide-music-menu').classList.contains('open'))) {
                       if (e.code === 'Space') {
                           e.preventDefault();
                           VideoSystem.togglePlay();
                           return;
                       }
                }
                if (e.code === 'Space') {
                    e.preventDefault(); 
                    const menu = document.getElementById('slide-music-menu');
                    menu.classList.toggle('open');
                    SoundFX.click();
                }
            });

            // --- 1.3 VOICE CONTROL SYSTEM ---
            const VoiceSystem = {
                recognition: null,
                eye: document.querySelector('.vox-eye-container'),
                isListening: false, 

                init() {
                    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                    if (!SpeechRecognition) return;

                    this.recognition = new SpeechRecognition();
                    this.recognition.continuous = true;
                    this.recognition.lang = 'en-US';
                    this.recognition.interimResults = false;

                    this.recognition.onstart = () => {
                        this.eye.classList.add('listening');
                        voxNotify('VOICE MODULE: ONLINE', 'success');
                    };

                    this.recognition.onend = () => {
                        if (this.isListening) { 
                            try { this.recognition.start(); } catch(e){} 
                        } else {
                            this.eye.classList.remove('listening');
                            voxNotify('VOICE MODULE: OFFLINE', 'info');
                        }
                    };

                    this.recognition.onresult = (event) => {
                        const last = event.results.length - 1;
                        const command = event.results[last][0].transcript.trim().toLowerCase();
                        console.log("Heard:", command);
                        this.execute(command);
                    };
                    
                    if(this.eye) {
                        this.eye.addEventListener('click', () => this.toggle());
                    }
                },

                toggle() {
                    if (this.isListening) {
                        this.stop();
                    } else {
                        this.start();
                    }
                },

                start() {
                    if (this.recognition && !this.isListening) {
                        this.isListening = true;
                        try {
                            this.recognition.start();
                        } catch(e) { console.log("Voice already active"); }
                    }
                },
                
                stop() {
                    if (this.recognition && this.isListening) {
                        this.isListening = false;
                        this.recognition.stop();
                        this.eye.classList.remove('listening');
                    }
                },

                execute(cmd) {
                    if (cmd.includes('play music') || cmd.includes('start music')) {
                        MusicSystem.audio.play();
                        voxNotify('COMMAND: PLAY MUSIC', 'success');
                    }
                    else if (cmd.includes('silence') || cmd.includes('stop')) {
                        MusicSystem.audio.pause();
                        VideoSystem.video.pause();
                        voxNotify('COMMAND: SILENCE', 'error');
                    }
                    else if (cmd.includes('hello') || cmd.includes('vox')) {
                        SoundFX.playTone(600, 'sine', 0.2);
                        this.eye.style.transform = "scale(1.5)";
                        setTimeout(() => this.eye.style.transform = "scale(1)", 200);
                    }
                }
            };

            // --- 2. LOCAL STORAGE ---
            const Memory = {
                check() {
                    if (localStorage.getItem('vox_citizen') === 'true') {
                        const title = document.getElementById('heroTitle');
                        title.innerHTML = "Welcome Back,<br>Citizen";
                        title.setAttribute('data-text', "Welcome Back, Citizen"); 
                        document.getElementById('initBtn').textContent = "AWAITING ORDERS";
                        //voxNotify('Identity verified. Welcome back.', 'success');
                    }
                },
                register() {
                    localStorage.setItem('vox_citizen', 'true');
                    SoundFX.click();
                }
            };

            // --- UTILS ---
            const throttle = (func, limit) => {
                let inThrottle;
                return function() {
                    const args = arguments;
                    const context = this;
                    if (!inThrottle) {
                        func.apply(context, args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, limit);
                    }
                }
            };

            // --- DYNAMIC BROWSER THEME ---
            window.setBrowserColor = (color) => {
                // 1. Ищем или создаем мета-тег
                let meta = document.querySelector('meta[name="theme-color"]');
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.name = "theme-color";
                    document.head.appendChild(meta);
                }
                // 2. Меняем цвет
                meta.setAttribute('content', color);
                console.log(`%c BROWSER THEME: ${color} `, `background: ${color}; color: black; font-weight: bold;`);
            };

            // --- NOTIFICATIONS ---
            const voxNotify = (msg, type = 'info') => {
                const area = document.getElementById('notification-area');
                if (!area) return;

                const toast = document.createElement('div');
                toast.className = `vox-toast ${type === 'error' ? 'error' : ''}`;
                
                const header = document.createElement('div');
                header.style.fontWeight = 'bold';
                header.style.marginBottom = '5px';
                header.textContent = '/// SYSTEM NOTIFICATION ///';
                
                const message = document.createElement('div');
                message.textContent = msg; 
                
                toast.appendChild(header);
                toast.appendChild(message);
                area.appendChild(toast);
                SoundFX.click();
                
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if(!prefersReducedMotion) {
                    document.body.style.boxShadow = `inset 0 0 50px ${type === 'error' ? 'red' : 'var(--vox-cyan)'}`;
                    setTimeout(() => document.body.style.boxShadow = 'none', 150);
                }

                setTimeout(() => {
                    toast.style.transform = 'translateX(120%)';
                    setTimeout(() => { if(toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
                }, 3000);
            };

            // --- 3. EASTER EGG ---
            const easterEgg = {
                seq: [],
                target: 'hipno',
                layer: document.getElementById('easterEggLayer'),
                btn: document.getElementById('closeEasterEgg'),
                init() {
                    document.addEventListener('keydown', this.handleKey.bind(this));
                    this.btn.addEventListener('click', this.close.bind(this));
                },
                handleKey(e) {
                    if (!e.key) return;
                    if (this.layer.classList.contains('active') && (e.key === 'Escape' || e.key === 'Back')) {
                        this.close();
                        return;
                    }
                    this.seq.push(e.key.toLowerCase());
                    if (this.seq.length > 3) this.seq.shift();
                    
                    if (this.seq.join('') === this.target) {
                        this.open();
                    }
                },
                open() {
                    this.layer.classList.add('active');
                    this.btn.focus();
                    document.body.style.overflow = 'hidden';
                    SoundFX.playTone(100, 'sawtooth', 1);
                },
                close() {
                    this.layer.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    this.seq = [];
                }
            };
            easterEgg.init();

            // --- 4.1 ANIMATED DOWNLOAD ICON (CANVAS) ---
            const DownloadAnim = {
                canvas: null, ctx: null, w: 0, h: 0,
                particles: [], animationFrame: null,
                cyan: '#00f3ff', // Цвет по умолчанию

                init() {
                    this.canvas = document.getElementById('downloadCanvas');
                    if(!this.canvas) return false;
                    this.ctx = this.canvas.getContext('2d');
                    this.w = this.canvas.width;
                    this.h = this.canvas.height;
                    // Пытаемся взять цвет из CSS переменной
                    const cssColor = getComputedStyle(document.documentElement).getPropertyValue('--vox-cyan').trim();
                    if(cssColor) this.cyan = cssColor;
                    return true;
                },

                start() {
                    if(!this.init()) return;
                    this.particles = [];
                    this.stop(); // Остановить, если уже запущено
                    this.loop();
                },

                stop() {
                    if(this.animationFrame) cancelAnimationFrame(this.animationFrame);
                    if(this.ctx) this.ctx.clearRect(0, 0, this.w, this.h);
                },

                loop() {
                    this.ctx.clearRect(0, 0, this.w, this.h);
                    this.ctx.strokeStyle = this.cyan;
                    this.ctx.fillStyle = this.cyan;
                    this.ctx.lineWidth = 2;

                    // Рисуем "приемник" (нижняя скоба)
                    this.ctx.beginPath();
                    this.ctx.moveTo(20, 60); this.ctx.lineTo(20, 75); this.ctx.lineTo(60, 75); this.ctx.lineTo(60, 60);
                    this.ctx.stroke();

                    // Рисуем статичную часть стрелки
                    this.ctx.beginPath();
                    this.ctx.moveTo(40, 10); this.ctx.lineTo(40, 55); // Стержень
                    this.ctx.moveTo(30, 45); this.ctx.lineTo(40, 55); this.ctx.lineTo(50, 45); // Наконечник
                    this.ctx.stroke();

                    // --- Частицы (цифровой поток) ---
                    // Добавляем новую частицу сверху
                    if(Math.random() > 0.7) {
                        this.particles.push({x: 38 + Math.random()*4, y: 0, speed: 2 + Math.random()*3, len: 5 + Math.random()*10 });
                    }

                    // Обновляем и рисуем частицы
                    for(let i = this.particles.length - 1; i >= 0; i--) {
                        let p = this.particles[i];
                        p.y += p.speed;
                        
                        this.ctx.beginPath();
                        // Эффект "цифрового следа"
                        let gradient = this.ctx.createLinearGradient(p.x, p.y - p.len, p.x, p.y);
                        gradient.addColorStop(0, "rgba(0, 243, 255, 0)");
                        gradient.addColorStop(1, this.cyan);
                        this.ctx.fillStyle = gradient;
                        this.ctx.fillRect(p.x, p.y - p.len, 2, p.len); // Рисуем как прямоугольник

                        // Удаляем, если упала в "приемник"
                        if(p.y > 65) this.particles.splice(i, 1);
                    }

                    this.animationFrame = requestAnimationFrame(() => this.loop());
                }
            };

            // --- 4. VANGUARD INSTALLER (REAL DOWNLOAD + CANVAS ANIMATION) ---
            const downloadSystem = {
                btn: document.getElementById('downloadBtn'),
                modal: document.getElementById('installer-modal'),
                logBox: document.getElementById('installLog'),
                bar: document.getElementById('installBar'),
                perc: document.getElementById('installPercent'),
                step: document.getElementById('install-step'),
                
                msgs: [
                    { text: "Connecting to VoxTek Cloud...", type: "normal", time: 500 },
                    { text: "Verifying User Soul Signature...", type: "warn", time: 1500 },
                    { text: "Access Granted. Locating Binary...", type: "success", time: 2500 },
                    { text: "Downloading VANGUARD.EXE...", type: "normal", time: 3500 },
                    { text: "Decrypting Payload...", type: "warn", time: 5000 },
                    { text: "Bypassing Windows Defender...", type: "danger", time: 6000 },
                    { text: "Preparing System Injection...", type: "normal", time: 7000 },
                    { text: "READY FOR DEPLOYMENT.", type: "success", time: 8000 }
                ],

                init() {
                    if (!this.btn) return;
                    this.btn.addEventListener('click', () => this.startInstall());
                },

                log(txt, type) {
                    const div = document.createElement('div');
                    div.className = `log-line ${type}`;
                    div.textContent = `> ${txt}`;
                    if(this.logBox) {
                        this.logBox.appendChild(div);
                        this.logBox.scrollTop = this.logBox.scrollHeight;
                    }
                    SoundFX.playTone(800, 'square', 0.05);
                },

                startInstall() {
                    if(!this.modal) { this.triggerRealDownload(); return; }

                    this.modal.classList.add('active');
                    this.logBox.innerHTML = '';
                    this.bar.style.width = '0%';
                    this.perc.textContent = '0%';
                    SoundFX.playTone(100, 'sawtooth', 0.5);

                    // 🔥 ЗАПУСК CANVS АНИМАЦИИ 🔥
                    DownloadAnim.start();

                    let startTime = Date.now();
                    let duration = 8500; 

                    let interval = setInterval(() => {
                        let elapsed = Date.now() - startTime;
                        let pct = Math.min(100, Math.floor((elapsed / duration) * 100));
                        
                        this.bar.style.width = pct + '%';
                        this.perc.textContent = pct + '%';
                        this.step.textContent = "DOWNLOADING: " + (pct * 10.24).toFixed(1) + " MB";

                        if (pct >= 100) {
                            clearInterval(interval);
                            this.finish();
                        }
                    }, 50);

                    this.msgs.forEach(msg => {
                        setTimeout(() => this.log(msg.text, msg.type), msg.time);
                    });
                },

                finish() {
                    setTimeout(() => {
                        this.step.textContent = "COMPLETE";
                        SoundFX.playTone(440, 'sine', 1);
                        
                        this.modal.style.background = "white";
                        setTimeout(() => {
                            this.modal.style.background = "#000";
                            this.modal.classList.remove('active');

                            // 🔥 ОСТАНОВКА CANVAS АНИМАЦИИ 🔥
                            DownloadAnim.stop();
                            
                            voxNotify("FILE RETRIEVED. EXECUTE IMMIDIATELY.", "success");
                            this.triggerRealDownload();
                            
                        }, 200);
                    }, 500);
                },

                async triggerRealDownload() {
                    try {
                        // Убедись, что файл Vanguard.exe загружен в Firebase Storage в папку 'public'
                        const fileRef = window.fbRef(window.storage, 'public/Vanguard.exe');
                        const url = await window.fbUrl(fileRef);
                        
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'Vanguard.exe';
                        a.target = '_blank';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        
                        this.btn.textContent = "DOWNLOADED";
                        this.btn.style.color = "#0f0";
                        this.btn.style.borderColor = "#0f0";

                    } catch (error) {
                        console.error("Download Error:", error);
                        voxNotify("ERROR: FILE NOT FOUND IN CLOUD.", "error");
                        // Для теста, если файла нет в облаке:
                        // alert("Файл не найден в Firebase Storage (public/Vanguard.exe). Загрузи его!");
                    }
                }
            };
            downloadSystem.init();

            // --- 5. REVIEW SYSTEM ---
            const reviewSystem = {
                rating: 5,
                squares: document.querySelectorAll('.sq'),
                form: document.getElementById('reviewForm'),
                feed: document.getElementById('reviewFeed'),
                init() {
                    this.squares.forEach(s => {
                        s.addEventListener('mouseover', () => { this.highlight(s.dataset.v); SoundFX.hover(); });
                        s.addEventListener('click', () => { 
                            this.rating = parseInt(s.dataset.v, 10); 
                            this.highlight(this.rating); 
                            this.updateAria(this.rating);
                            SoundFX.click();
                        });
                    });
                    
                    const ratingBox = document.getElementById('ratingBox');
                    ratingBox.addEventListener('mouseleave', () => {
                         if (window.matchMedia('(hover: hover)').matches) this.highlight(this.rating);
                    });

                    this.form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.submit();
                    });
                    this.highlight(5);
                },
                highlight(v) {
                    this.squares.forEach(s => {
                        if (parseInt(s.dataset.v, 10) <= v) s.classList.add('active');
                        else s.classList.remove('active');
                    });
                },
                updateAria(v) {
                    this.squares.forEach(s => {
                         s.setAttribute('aria-checked', parseInt(s.dataset.v, 10) === v ? 'true' : 'false');
                    });
                },
                submit() {
                    const nameInput = document.getElementById('revName');
                    const textInput = document.getElementById('revText');
                    const name = nameInput.value.trim();
                    const text = textInput.value.trim();

                    if (!name || !text) {
                        voxNotify("Input data required.", "error");
                        return;
                    }

                    const item = document.createElement('div');
                    item.className = `review-item ${this.rating >= 4 ? 'good' : 'bad'}`;
                    
                    const header = document.createElement('div');
                    header.className = 'r-name';
                    header.textContent = name;
                    
                    const starsDiv = document.createElement('div');
                    starsDiv.className = 'r-squares';
                    for (let i = 0; i < 5; i++) {
                        const sq = document.createElement('div');
                        sq.className = `r-sq ${i < this.rating ? 'fill' : ''}`;
                        starsDiv.appendChild(sq);
                    }
                    header.appendChild(starsDiv);

                    const body = document.createElement('div');
                    body.className = 'r-text';
                    body.textContent = `"${text}"`;

                    item.appendChild(header);
                    item.appendChild(body);

                    item.style.height = '0';
                    item.style.opacity = '0';
                    this.feed.prepend(item);
                    void item.offsetWidth; 

                    item.style.height = 'auto';
                    item.style.opacity = '1';
                    item.style.transition = '0.5s';

                    nameInput.value = '';
                    textInput.value = '';
                    nameInput.focus();
                    voxNotify("Review processed. Obedience verified.", "success");
                    SoundFX.click();
                }
            };
            reviewSystem.init();

            // --- 6. TERMINAL & ALASTOR LOGIC (REMASTERED) ---
            const terminal = {
                screen: document.getElementById('termScreen'),
                input: document.getElementById('cmdInput'),
    
                // Файловая система с метаданными (права, размер, дата)
                fs: {
                    'readme.txt': { type: 'file', content: 'Welcome to Vanguard OS v10. Submission is Safety.', meta: 'r--r--r--  1.2kb  2026-01-01' },
                    'passwords.log': { type: 'file', content: 'ERROR: ENCRYPTED. LEVEL 5 CLEARANCE REQUIRED.', meta: 'rw-------  0.5kb  2026-01-02' },
                    'alastor_report.log': { type: 'file', content: 'Target Status: MIA. Radio Signal: 0%. Threat: Negligible.', meta: 'r--------  4.8kb  2025-12-25' },
                    'vanguard.exe': { type: 'bin', content: null, meta: 'rwx------  124mb  2026-01-04' },
                    'sys_core': { type: 'dir', content: null, meta: 'drwxr-xr-x  DIR    2026-01-01' }
                },
    
                matrixInterval: null,

                init() {
                    // Красивая анимация загрузки при старте
                    const bootSequence = [
                        { txt: "BIOS CHECK...", color: "#666", delay: 100 },
                        { txt: "LOADING VANGUARD KERNEL v9.2...", color: "#666", delay: 300 },
                        { txt: "MOUNTING FILESYSTEM...", color: "#666", delay: 600 },
                        { txt: "CONNECTING TO VOXTEK MAINFRAME...", color: "var(--vox-cyan)", delay: 900 },
                        { txt: "ACCESS GRANTED. WELCOME, CITIZEN.", color: "#0f0", delay: 1400 },
                        { txt: "Type 'help' for available subroutines.", color: "white", delay: 1600 }
                    ];

                    et totalDelay = 0;
                    bootSequence.forEach(step => {
                        totalDelay += step.delay;
                        setTimeout(() => this.print(step.txt, step.color), totalDelay);
                    });

                    this.input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') this.processCmd();
                    });
        
                    this.input.focus();
                },

                // Улучшенная функция вывода с поддержкой HTML и цветов
                print(txt, color = 'var(--vox-cyan)', prefix = '') {
                    const l = document.createElement('div');
                    l.style.color = color;
                    l.style.marginBottom = '2px';
                    l.style.fontFamily = "var(--font-code)";
                    l.style.textShadow = `0 0 5px ${color}`; // Неоновое свечение текста
        
                    // Время команды
                    const time = new Date().toLocaleTimeString('en-US', {hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"});
                    const timestamp = `<span style="color:#444; margin-right:10px;">[${time}]</span>`;
        
                    l.innerHTML = `${timestamp}${prefix}${txt}`;
        
                    this.screen.appendChild(l);
                    this.screen.scrollTop = this.screen.scrollHeight;
                },

                triggerCrash() {
                    if(window.SoundFX) window.SoundFX.staticNoise();
                    document.body.classList.add('theme-radio');
        
                    // 🔥 МЕНЯЕМ ЦВЕТ БРАУЗЕРА НА КРАСНЫЙ (АЛАСТОР)
                    window.setBrowserColor("#8a0000");

                    const vsod = document.getElementById('vsod-layer');
                    vsod.classList.add('active');
        
                    window.onkeydown = (e) => e.preventDefault();
                    document.body.style.cursor = 'none';

                    let p = 0;
                    setInterval(() => {
                        if (p < 99) p++;
                        else p = 666;
                        const el = document.getElementById('vsod-percent');
                        if(el) {
                            el.textContent = "Corruption: " + p + "%";
                            el.style.fontSize = (20 + Math.random()*5) + "px";
                        }
                    }, 100);
                },

                processCmd() {
                    const raw = this.input.value.trim();
                    if (!raw) return;
        
                    const parts = raw.split(/\s+/);
                    const cmd = parts[0].toLowerCase();
                    const arg = parts[1];

                    // Эффект ввода (повторяем команду пользователя белым цветом)
                    this.print(raw, '#fff', '<span style="color:var(--vox-cyan);">root@vanguard:~# </span>');
                    this.input.value = '';

                    // Звук нажатия Enter
                    if(window.SoundFX) window.SoundFX.click();

                    switch (cmd) {
                        case 'help':
                            this.print("--- AVAILABLE SUBROUTINES ---", "#fff");
                            this.print("ls      : List directory contents");
                            this.print("cat [f] : Read file content");
                            this.print("whoami  : Display user identity");
                            this.print("clear   : Clear terminal buffer");
                            this.print("val     : Activate Valentino Protocol");
                            this.print("vox     : Restore VoxTek Factory Settings");
                            this.print("matrix  : Initiate visual hack simulation");
                            this.print("exit    : Terminate session");
                            break;

                        case 'ls':
                            this.print("Reading file table...", "#666");
                            setTimeout(() => {
                                this.print("PERM        SIZE   DATE        NAME", "#888");
                                Object.keys(this.fs).forEach(key => {
                                    const f = this.fs[key];
                                    // Выравнивание колонок пробелами (padEnd)
                                    this.print(`${f.meta}  <span style="color:${f.type === 'dir' ? '#0044ff' : 'var(--vox-cyan)'}">${key}</span>`, "#ccc");
                                });
                            }, 300);
                            break;

                        case 'cat':
                            if (!arg) {
                                this.print("Error: Missing target operand.", "var(--alert-red)");
                                return;
                            }
                            const file = this.fs[arg];
                            if (file) {
                                if (file.type === 'bin') {
                                    this.print("ERR: CANNOT DISPLAY BINARY FILE. EXECUTE ONLY.", "var(--alert-red)");
                                } else if (file.type === 'dir') {
                                    this.print("ERR: IS A DIRECTORY", "var(--alert-red)");
                                } else {
                                    this.print("Decrypting...", "#666");
                                    setTimeout(() => this.print(file.content, "#fff"), 400);
                                }
                            } else {
                                this.print(`Error: File '${arg}' not found in sector.`, "var(--alert-red)");
                            }
                            break;

                        case 'clear':
                            this.screen.innerHTML = '';
                            this.print("Buffer cleared.", "#666");
                            break;

                        case 'whoami':
                            this.print("--- USER IDENTITY ---", "#fff");
                            this.print("ID:        #8940");
                            this.print("CLASS:     LOYAL CITIZEN");
                            this.print("TRUST:     98%");
                            this.print("STATUS:    MONITORED");
                            break;

                        case 'radio':
                        case 'alastor':
                            this.print("!!! CRITICAL ALERT: FORBIDDEN FREQUENCY !!!", "var(--alert-red)");
                            this.print("TRACING SIGNAL SOURCE...", "var(--alert-red)");
                            setTimeout(() => this.triggerCrash(), 2000);
                            break;

                        case 'matrix': 
                            if (this.matrixInterval) clearInterval(this.matrixInterval);
                            this.print("Injecting payload...", "#0f0");
                            let count = 0;
                            this.matrixInterval = setInterval(() => {
                                if(count > 100) { clearInterval(this.matrixInterval); this.print("Injection complete.", "#0f0"); return; }
                                let line = "";
                                for (let i = 0; i < 40; i++) line += Math.floor(Math.random() * 2);
                                this.print(line, "rgba(0, 255, 0, 0.6)");
                                count++;
                            }, 40);
                            break;

                        case 'val':
                            document.body.classList.remove('theme-radio');
                            document.body.classList.add('theme-val');
                            this.print("Fashion Mode Activated. Pimping style...", "#ff00ff");
                            // 🔥 МЕНЯЕМ ЦВЕТ БРАУЗЕРА НА РОЗОВЫЙ
                            window.setBrowserColor("#ff00ff");
                            break;

                        case 'vox':
                            document.body.className = '';
                            this.print("Factory Settings Restored. Trust the signal.", "var(--vox-cyan)");
                            // 🔥 МЕНЯЕМ ЦВЕТ БРАУЗЕРА НА ГОЛУБОЙ
                            window.setBrowserColor("#00f3ff");
                            break;
                        
                        case 'exit':
                            this.print("Terminating session...", "var(--alert-red)");
                            setTimeout(() => {
                                document.getElementById('view-home').scrollIntoView({ behavior: 'smooth' });
                            }, 1000);
                            break;

                        case 'date':
                            this.print(new Date().toString(), "#ccc");
                            break;

                        default:
                            this.print(`Unknown command: '${cmd}'. Check syntax.`, "var(--alert-red)");
                    }
                }
            };

            // Запускаем терминал
            terminal.init();

            // --- 7. EYE TRACKING (OPTIMIZED) ---
            const eyeLogic = {
                pupil: document.getElementById('eyePupil'),
                svg: document.querySelector('.eye-svg'),
                rect: null,
                init() {
                    // Отключаем на мобильных полностью (экономит батарею)
                    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

                    window.addEventListener('resize', throttle(() => {
                        this.rect = this.svg.getBoundingClientRect();
                    }, 500));
                    this.rect = this.svg.getBoundingClientRect();

                    // THROTTLE: Обновляем позицию не чаще чем раз в 30мс
                    document.addEventListener('mousemove', throttle((e) => {
                        requestAnimationFrame(() => this.move(e));
                    }, 30));
                },
                move(e) {
                    if (!this.rect || !this.pupil) return;
                    const cx = this.rect.left + this.rect.width / 2;
                    const cy = this.rect.top + this.rect.height / 2;
                    const dx = e.clientX - cx;
                    const dy = e.clientY - cy;
                    const angle = Math.atan2(dy, dx);
                    const maxDist = 15; 
                    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 100); 
                    const r = (dist / 100) * maxDist; 
                    this.pupil.style.transform = `translate(${Math.cos(angle) * r}px, ${Math.sin(angle) * r}px)`;
                }
            };

             // --- 8. WEBCAM ---
            const CamSystem = {
                el: document.getElementById('webcamFeed'),
                box: document.getElementById('cam-container'),
                stream: null,
                init() {
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        navigator.mediaDevices.getUserMedia({ video: true })
                            .then(stream => {
                                this.stream = stream;
                                this.box.style.display = 'flex';
                                this.el.srcObject = stream;
                                voxNotify('Biometric scan active.', 'success');
                            })
                            .catch(err => {
                                console.log("Cam error:", err);
                            });
                    }
                }
            };

            // --- 9. KONAMI CODE ---
            const Konami = {
                seq: [],
                code: ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'],
                init() {
                    document.addEventListener('keydown', (e) => {
                        if (!e.key) return;

                        this.seq.push(e.key.toLowerCase());
                        if (this.seq.length > this.code.length) this.seq.shift();
                        if (JSON.stringify(this.seq) === JSON.stringify(this.code)) {
                            document.body.classList.toggle('theme-val');
                            voxNotify('OVERRIDE: VALENTINO MODE ACTIVATED', 'info');
                            SoundFX.playTone(600, 'square', 0.5);
                        }
                    });
                }
            };
            Konami.init();

            // --- 10. INIT LOGIC ---
            document.getElementById('initBtn').addEventListener('click', function() {
                const btn = this; 
                
                btn.textContent = "SYNCING...";
                btn.style.cursor = "wait";
                btn.disabled = true;

                Memory.register();
                CamSystem.init(); 
                VoiceSystem.init(); 
                
                const music = document.getElementById('bg-music');
                if(music.paused) {
                    const playBtn = document.getElementById('playPauseBtn');
                    MusicSystem.startAudioContext();
                    music.play().then(() => {
                         playBtn.textContent = "PAUSE STREAM";
                    }).catch(e => console.log("Auto-play blocked"));
                }

                setTimeout(() => {
                    btn.textContent = "CONNECTED";
                    btn.style.cursor = "default";
                    btn.disabled = false;
                    btn.style.borderColor = "#00ff00"; 
                    btn.style.color = "#00ff00";
                    btn.style.boxShadow = "0 0 20px rgba(0, 255, 0, 0.4)";
                    voxNotify('SYSTEM LINK ESTABLISHED.', 'success');
                }, 1500);
            });

            // --- SECURITY PROTOCOL ---
            const SecuritySystem = {
                init() {
                    document.addEventListener('contextmenu', (e) => e.preventDefault());
                    document.addEventListener('selectstart', (e) => {
                        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') e.preventDefault();
                    });
                    document.addEventListener('copy', (e) => {
                        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') e.preventDefault();
                    });
                }
            };
            SecuritySystem.init();

            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        revealObserver.unobserve(entry.target); 
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

            Memory.check();

            // --- NEW: CONTRACT SYSTEM ---
            window.ContractSystem = {
                pendingUser: null,
                pendingPass: null,
                
                open(user, pass) {
                    this.pendingUser = user;
                    this.pendingPass = pass;
                    document.getElementById('contractModal').classList.add('active');
                    document.getElementById('contractSignArea').textContent = "";
                },

                sign() {
                    const area = document.getElementById('contractSignArea');
                    // Эффект появления подписи кровью
                    area.innerHTML = `<span style="color:#8a0000;">${this.pendingUser.split('@')[0]}</span>`;
                    SoundFX.playTone(100, 'sawtooth', 0.1); // Звук "скрипа"
                    
                    setTimeout(() => {
                        document.getElementById('contractModal').classList.remove('active');
                        // Возвращаемся к регистрации
                        AuthSystem.finalizeRegister(this.pendingUser, this.pendingPass);
                    }, 800);
                }
            };

            // --- UPDATED: AUTH SYSTEM (WITH BAN MONITOR) ---
            window.AuthSystem = {
                currentUser: null,
                isInitialized: false,
                banListener: null,
                heartbeat: null, 

                init() {
                    if (this.isInitialized) return;
                    this.isInitialized = true;

                    if (window.fbAuthListener) {
                        window.fbAuthListener(window.auth, (user) => {
                            if (user) {
                                this.currentUser = user;
                                this.showApp();
                                CloudSystem.registerUser(user);
                                this.monitorBan(user.uid); 
                                if(window.AdminSystem) AdminSystem.init(user);

                                // Heartbeat
                                this.heartbeat = setInterval(() => {
                                    window.fbSet(window.fbDoc(window.db, "users", user.uid), {
                                        lastSeen: window.fbTime(),
                                        isOnline: true
                                    }, { merge: true });
                                }, 60000);
                                
                                window.fbSet(window.fbDoc(window.db, "users", user.uid), { isOnline: true, lastSeen: window.fbTime() }, { merge: true });

                            } else {
                                this.currentUser = null;
                                if(this.banListener) this.banListener();
                                if(this.heartbeat) clearInterval(this.heartbeat);
                                this.showAuth();
                            }
                        });
                    }
                },

                monitorBan(uid) {
                    this.banListener = window.fbSnap(window.fbDoc(window.db, "users", uid), (doc) => {
                        const data = doc.data();
                        if (data && data.isBanned === true) {
                            window.fbLogout(window.auth);
                            const vsod = document.getElementById('vsod-layer');
                            vsod.classList.add('active');
                            vsod.innerHTML = `
                                <div class="sad-face">:(</div>
                                <h1 style="color:red; font-size:40px;">ACCOUNT TERMINATED</h1>
                                <p style="margin-top:20px; font-size:18px;">ACCESS TO VOXTEK SYSTEMS REVOKED.</p>
                                <div style="margin-top:40px; border:1px solid red; padding:20px; background:rgba(50,0,0,0.5);">
                                    <p style="color:#aaa; font-size:12px;">OFFICIAL REASON:</p>
                                    <h2 style="color:white; margin-top:10px;">"${data.banReason}"</h2>
                                </div>
                                <p style="margin-top:40px; font-size:12px; color:#666;">ID: ${uid}</p>
                            `;
                            SoundFX.error();
                        }
                    });
                },

                switchTab(tab) {
                    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                    if(tab === 'login') {
                        document.querySelector('#msgAuth .auth-tabs button:first-child').classList.add('active');
                        document.getElementById('formLogin').classList.add('active');
                    } else {
                        document.querySelector('#msgAuth .auth-tabs button:last-child').classList.add('active');
                        document.getElementById('formRegister').classList.add('active');
                    }
                    SoundFX.click();
                },

                register() {
                    let u = document.getElementById('regUser').value.trim();
                    const p = document.getElementById('regPass').value.trim();
                    if (!u.includes('@')) u = u + '@voxtek.net';
                    if(!u || !p) return voxNotify('Credentials required.', 'error');
                    
                    ContractSystem.open(u, p);
                },

                // 🔥 ИСПРАВЛЕНИЕ ЗДЕСЬ: Логика перенесена внутрь функции 🔥
                finalizeRegister(u, p) {
                    // 1. Сначала вычисляем реферала
                    const urlParams = new URLSearchParams(window.location.search);
                    let referrerId = urlParams.get('ref');
                    
                    if (referrerId && referrerId.includes('_')) {
                        const parts = referrerId.split('_');
                        const ts = parseInt(parts[1]);
                        const lifeTime = 12 * 60 * 60 * 1000;
                                    
                        if (!ts || (Date.now() - ts > lifeTime)) {
                            referrerId = null; 
                        } else {
                            referrerId = parts[0]; 
                        }
                    }

                    voxNotify('CONTRACT SEALED. THANK YOU FOR COOPORATING WITH VOXTEK.', 'info');
                    
                    window.fbRegister(window.auth, u, p)
                        .then((cred) => {
                            window.fbSet(window.fbDoc(window.db, "users", cred.user.uid), {
                                trustScore: 100,
                                uid: cred.user.uid,
                                email: u,
                                isOnline: true,
                                lastSeen: window.fbTime(),
                                contractSigned: true,
                                invitedBy: referrerId || null // Теперь переменная referrerId доступна
                            }, { merge: true });

                            voxNotify('WELCOME TO THE VOXTEK ENTERPRISES.', 'success');
                        })
                        .catch((error) => { voxNotify('ERROR: ' + error.message, 'error'); });
                },

                login() {
                    let u = document.getElementById('loginUser').value.trim();
                    const p = document.getElementById('loginPass').value.trim();
                    if (!u.includes('@')) u = u + '@voxtek.net';
                    voxNotify('VERIFYING...', 'info');
                    window.fbLogin(window.auth, u, p)
                        .catch((error) => { voxNotify('ACCESS DENIED. ' + error.message, 'error'); SoundFX.error(); });
                },

                logout() {
                    window.fbLogout(window.auth).then(() => voxNotify('DISCONNECTED.', 'info'));
                },

                copyInvite() {
                    const user = window.auth.currentUser;
                    if(!user) return;
                    
                    const timestamp = Date.now();
                    const url = `${window.location.origin}${window.location.pathname}?ref=${user.uid}_${timestamp}`;
                    
                    navigator.clipboard.writeText(url).then(() => {
                        voxNotify("TEMPORARY UPLINK COPIED (12H)", "success");
                    });
                },

                showAuth() {
                    document.getElementById('msgAuth').style.display = 'flex';
                    document.getElementById('msgApp').classList.remove('active');
                },

                showApp() {
                    document.getElementById('msgAuth').style.display = 'none';
                    document.getElementById('msgApp').classList.add('active');
                    if(window.CloudSystem) {
                        CloudSystem.loadChat('global');
                        CloudSystem.listenToUsers();
                    }
                },
                
                send() {
                    const inp = document.getElementById('msgInput');
                    const txt = inp.value.trim();
                    if(!txt) return;
                    CloudSystem.sendMessage(txt);
                    inp.value = '';
                }
            };
            
// --- UPDATED: ADMIN SYSTEM (WITH BAN HAMMER) ---
            window.AdminSystem = {
                init(user) {
                    if (user && user.email === 'voxtek@voxtek.net') {
                        document.getElementById('adminToggleBtn').style.display = 'block';
                        voxNotify('ADMIN CLEARANCE GRANTED. WELCOME, VOX.', 'error');
                        this.loadUsers();
                    } else {
                        document.getElementById('adminToggleBtn').style.display = 'none';
                    }
                },
                
                broadcast() {
                    const msg = document.getElementById('adminAlertMsg').value;
                    if(!msg) return;
                    window.fbAdd(window.fbCol(window.db, "system_alerts"), {
                        message: msg,
                        timestamp: window.fbTime(),
                        author: "OVERLORD"
                    });
                    document.getElementById('adminAlertMsg').value = '';
                    voxNotify('GLOBAL ALERT SENT.', 'success');
                },
                
                forceView() {
                    const url = document.getElementById('adminForceUrl').value.trim();
                    if(!url) return voxNotify("URL REQUIRED", "error");

                    if(confirm("WARNING: OVERRIDE ALL SCREENS?")) {
                        // Пишем приказ в базу данных
                        window.fbSet(window.fbDoc(window.db, "system_state", "broadcast"), {
                            active: true,
                            url: url,
                            timestamp: window.fbTime()
                        });
                        voxNotify("GLOBAL OVERRIDE INITIATED", "success");
                    }
                },

                listenForAlerts() {
                    const q = window.fbQuery(window.fbCol(window.db, "system_alerts"), window.fbOrder("timestamp", "desc"), window.fbLimit(1));
                    window.fbSnap(q, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                const data = change.doc.data();
                                const now = Date.now();
                                const alertTime = data.timestamp ? data.timestamp.toMillis() : now;
                                if (now - alertTime < 10000) {
                                    voxNotify(`⚠ ${data.message.toUpperCase()} ⚠`, 'error');
                                    SoundFX.playTone(150, 'sawtooth', 0.5);
                                }
                            }
                        });
                    });
                },

                // --- НОВЫЙ ФУНКЦИОНАЛ: СПИСОК И БАН ---
                loadUsers() {
                    const list = document.getElementById('adminUserList');
                    list.innerHTML = '<div style="padding:10px;text-align:center;color:#666">SCANNING DATABASE...</div>';
                    
                    // Запрашиваем всех пользователей
                    const q = window.fbQuery(window.fbCol(window.db, "users"), window.fbOrder("lastSeen", "desc"));
                    
                    window.fbSnap(q, (snapshot) => {
                        list.innerHTML = '';
                        snapshot.forEach((doc) => {
                            const u = doc.data();
                            const div = document.createElement('div');
                            div.className = 'admin-row';
                            
                            // Если забанен — показываем кнопку АМНИСТИИ (Зеленая/Голубая)
                            // Если нет — кнопку БАНА (Красная)
                            const banStatus = u.isBanned 
                                ? `<button class="ban-btn" style="background:var(--vox-cyan); color:black;" onclick="AdminSystem.unbanUser('${u.uid}')">AMNESTY</button>` 
                                : `<button class="ban-btn" onclick="AdminSystem.banUser('${u.uid}')">BAN</button>`;
                            
                            div.innerHTML = `
                                <div style="display:flex;flex-direction:column;">
                                    <span style="color:white;font-weight:bold;">${u.name}</span>
                                    <span style="font-size:9px;">${u.email}</span>
                                </div>
                                ${banStatus}
                            `;
                            list.appendChild(div);
                        });
                    });
                },

                monitorCalls() {
                    const grid = document.getElementById('spyGrid');
                    grid.innerHTML = '<div style="color:#aaa;">SCANNING...</div>';
                    
                    // Ищем активные звонки (где status != ended)
                    const q = window.fbQuery(window.fbCol(window.db, "calls"), window.fbWhere("status", "==", "connected"));
                    
                    window.fbSnap(q, (snapshot) => {
                        grid.innerHTML = '';
                        if(snapshot.empty) {
                            grid.innerHTML = '<div style="color:#666;">NO ACTIVE SIGNALS DETECTED.</div>';
                            return;
                        }
                        
                        snapshot.forEach(doc => {
                            const d = doc.data();
                            const card = document.createElement('div');
                            card.className = 'spy-card active';
                            card.innerHTML = `
                                <div style="color:var(--vox-cyan); font-weight:bold;">UPLINK #${doc.id.substr(0,4)}</div>
                                <div>Caller: ${d.callerName}</div>
                                <div>Target: ${d.calleeName || '...'}</div>
                                <div style="color:#666;">Duration: LIVE</div>
                                <button class="btn-tech" style="font-size:9px; border-color:red; color:red;" onclick="AdminSystem.killCall('${doc.id}')">TERMINATE</button>
                            `;
                            grid.appendChild(card);
                        });
                    });
                },
                
                async killCall(callId) {
                    if(await confirm("TERMINATE CONNECTION?")) {
                        window.fbSet(window.fbDoc(window.db, "calls", callId), { status: 'ended' }, { merge: true });
                        voxNotify("CONNECTION SEVERED.", "success");
                    }
                },

                modTrust() {
                    const target = document.getElementById('adminTargetId').value.trim(); // ID или Email
                    const val = parseInt(document.getElementById('adminTrustVal').value);
                    
                    if(!target || isNaN(val)) return voxNotify("INVALID INPUT", "error");

                    // Найти пользователя (это сложно без точного ID, так что лучше искать по точному UID, 
                    // но для простоты предположим, что админ вводит UID, который скопировал из списка)
                    // Для улучшения UX можно сделать поиск по Email, но это требует отдельного индекса.
                    // ПРЕДПОЛАГАЕМ ВВОД UID:
                    
                    const ref = window.fbDoc(window.db, "users", target);
                    window.fbGet(ref).then(doc => {
                        if(doc.exists()) {
                            const current = doc.data().trustScore || 50;
                            let newScore = current + val;
                            if(newScore > 100) newScore = 100;
                            if(newScore < 0) newScore = 0;
                            
                            window.fbSet(ref, { trustScore: newScore }, { merge: true });
                            voxNotify(`TRUST UPDATED: ${newScore}%`, "success");
                            
                            // Наказание за низкий рейтинг
                            if(newScore < 10) {
                                // Можно добавить метку "LOW TRUST" пользователю
                            }
                        } else {
                            voxNotify("USER NOT FOUND (USE UID)", "error");
                        }
                    });
                },

                // ВНУТРИ AdminSystem:
                
                async banUser(uid) {
                    // Предупреждение
                    if (!await confirm("WARNING: INITIATING BAN PROTOCOL.\nThis will block access and delete messages.\nProceed?")) return;

                    voxNotify("EXECUTING JUDGMENT...", "error");

                    try {
                        // 1. ЧИСТИМ СООБЩЕНИЯ (Оставляем как было - это круто)
                        const qGlobal = window.fbQuery(window.fbCol(window.db, "messages_global"), window.fbWhere("uid", "==", uid));
                        const snapGlobal = await window.fbGetDocs(qGlobal);
                        snapGlobal.forEach(doc => window.fbDelete(doc.ref));

                        const qPrivate = window.fbQuery(window.fbCol(window.db, "messages_private"), window.fbWhere("uid", "==", uid));
                        const snapPrivate = await window.fbGetDocs(qPrivate);
                        snapPrivate.forEach(doc => window.fbDelete(doc.ref));
                        
                        // 3. 🔥 ИСПРАВЛЕНИЕ ЗДЕСЬ 🔥
                        // ВМЕСТО deleteDoc МЫ ДЕЛАЕМ setDoc С ФЛАГОМ isBanned
                        const userRef = window.fbDoc(window.db, "users", uid);
                        await window.fbSet(userRef, { 
                            isBanned: true, 
                            banReason: "VIOLATION OF VOXTEK PROTOCOLS", // Причина бана
                            trustScore: 0 
                        }, { merge: true }); // merge: true ОЧЕНЬ ВАЖЕН, чтобы не стереть остальное случайно

                        voxNotify(`TARGET ${uid.substr(0,5)} TERMINATED.`, 'success');
                        
                        // Обновляем список админки
                        this.loadUsers();

                    } catch (e) {
                        voxNotify("BAN FAILED: " + e.message, "error");
                        console.error(e);
                    }
                },

                async unbanUser(uid) {
                    if (!await confirm("GRANT MERCY TO THIS SOUL?\nAccess will be restored immediately.")) return;

                    try {
                        const userRef = window.fbDoc(window.db, "users", uid);
                        
                        // Снимаем бан, убираем причину и даем минимальный рейтинг (пусть заслуживает доверие заново)
                        await window.fbSet(userRef, { 
                            isBanned: false, 
                            banReason: null, 
                            trustScore: 10 // Начинает с низов, как и положено грешнику
                        }, { merge: true });

                        voxNotify(`CITIZEN ${uid.substr(0,5)} RESTORED.`, 'success');
                        
                        // Обновляем список
                        this.loadUsers();

                    } catch (e) {
                        voxNotify("ERROR: " + e.message, "error");
                    }
                },

                // 🔥 НОВОЕ: КРАСИВЫЙ ВЫБОР ДЕЙСТВИЯ (ВМЕСТО ЦИФР) 🔥
                askMessageAction(msgId) {
                    return new Promise(resolve => {
                        const m = document.getElementById('customModal');
                        document.getElementById('modalTitle').textContent = "ADMIN PROTOCOL";
                        document.getElementById('modalText').textContent = `TARGET ID: ${msgId.substr(0,8)}... SELECT ACTION:`;
                        document.getElementById('modalInput').style.display = 'none'; // Прячем поле ввода

                        const btns = document.getElementById('modalActions');
                        // Рисуем 3 кнопки: Удалить (Красная), Редактировать (Синяя), Отмена (Серая)
                        btns.innerHTML = `
                            <button class="btn-tech" style="border-color:var(--alert-red); color:var(--alert-red); flex:1;" onclick="window.CustomDialog.close('delete')">DELETE</button>
                            <button class="btn-tech" style="border-color:var(--vox-cyan); color:var(--vox-cyan); flex:1;" onclick="window.CustomDialog.close('edit')">EDIT</button>
                            <button class="btn-tech" style="border-color:#555; color:#aaa; flex:1;" onclick="window.CustomDialog.close(null)">CANCEL</button>
                        `;

                        m.classList.add('active');
                        // Связываем нажатие кнопок с ответом (Promise)
                        window.CustomDialog.resolver = resolve;
                    });
                },
            };

            // --- NEW: MESSENGER UI LOGIC ---
            window.MessengerUI = {
                currentChat: 'global',
                currentChatName: 'VOXTEK GLOBAL',
                usersCache: [],
                unreadCounts: {}, // { uid: count }
                lastActiveTimes: {}, // { uid: timestamp } - для сортировки
                
                switchChat(chatId, chatName = 'VOXTEK GLOBAL') {
                    this.currentChat = chatId;
                    this.currentChatName = chatName;
                    
                    document.getElementById('chatTitle').textContent = chatName.toUpperCase();
                    
                    // Убираем бейдж (сбрасываем счетчик)
                    if (chatId !== 'global') {
                         const partnerId = chatId.replace(window.auth.currentUser.uid, '').replace('_', '');
                         if (this.unreadCounts[partnerId]) {
                             this.unreadCounts[partnerId] = 0;
                             this.renderUsers(this.usersCache); // Перерисовываем, чтобы убрать кружок
                         }
                    }

                    // Закрываем мобильное меню
                    if(window.innerWidth < 768) {
                        document.getElementById('chatSidebar').classList.remove('open');
                    }
                    
                    CloudSystem.loadChat(chatId);
                    CloudSystem.monitorTyping(chatId);
                    SoundFX.click();
                },

                // 🔥 НОВОЕ: Обработка входящего сообщения (Бейдж + Сортировка)
                handleIncomingMessage(senderUid) {
                    // 1. Увеличиваем счетчик непрочитанных
                    if (!this.unreadCounts[senderUid]) this.unreadCounts[senderUid] = 0;
                    this.unreadCounts[senderUid]++;

                    // 2. Обновляем время активности (для сортировки наверх)
                    this.lastActiveTimes[senderUid] = Date.now();

                    // 3. Перерисовываем список
                    this.renderUsers(this.usersCache);
                    
                    // 4. Звук уведомления (если мы не в этом чате прямо сейчас)
                    if (!document.getElementById('chatTitle').textContent.includes(this.usersCache.find(u=>u.uid===senderUid)?.name?.toUpperCase())) {
                         SoundFX.playTone(600, 'sine', 0.1);
                    }
                },
                
                renderUsers(users) {
                    this.usersCache = users; 
                    const container = document.getElementById('usersFeed');
                    const myUid = window.auth.currentUser ? window.auth.currentUser.uid : null;
                    
                    // Всегда рисуем Глобальный чат первым
                    let html = `
                        <div class="contact-item ${this.currentChat === 'global' ? 'active' : ''}" onclick="MessengerUI.switchChat('global')">
                            <div class="c-avatar" style="background:var(--vox-cyan); color:black; font-weight:bold;">#</div>
                            <div class="c-info">
                                <div class="c-name">VOXTEK GLOBAL</div>
                                <div class="c-status online">Server: VTGlobal</div>
                            </div>
                        </div>
                    `;
                    
                    // Фильтруем себя из списка
                    let sortedUsers = [...users].filter(u => u.uid !== myUid);
                    
                    // 🔥 СОРТИРОВКА: Сначала по времени активности (последнее сообщение), потом по имени
                    sortedUsers.sort((a, b) => {
                        const timeA = this.lastActiveTimes[a.uid] || 0;
                        const timeB = this.lastActiveTimes[b.uid] || 0;
                        
                        // Если есть разница во времени сообщений - кто свежее, тот выше
                        if (timeB !== timeA) return timeB - timeA;
                        
                        // Иначе по алфавиту
                        return a.name.localeCompare(b.name);
                    });

                    sortedUsers.forEach(user => {
                        const ids = [myUid, user.uid].sort();
                        const chatId = ids.join('_');
                        const isActive = this.currentChat === chatId;
                        const unread = this.unreadCounts[user.uid] || 0;

                        // Сборка HTML
                        const name = user.name || user.email.split('@')[0];
                        const avatar = user.avatar || `https://placehold.co/40x40/000000/00f3ff/png?text=${name[0]}`;
                        
                        // Добавляем класс active и unread-badge если есть
                        html += `
                        <div class="contact-item ${isActive ? 'active' : ''}" onclick="MessengerUI.switchChat('${chatId}', '${name}')">
                            <div class="c-avatar"><img src="${avatar}"></div>
                            <div class="c-info">
                                <div class="c-name">${name}</div>
                                <div class="c-status online">Citizen</div>
                            </div>
                            ${unread > 0 ? `<div class="unread-badge">${unread}</div>` : ''}
                        </div>`;
                    });
                    
                    container.innerHTML = html;
                },
                
                showTyping(isTyping) {
                    const el = document.getElementById('typingIndicator');
                    if(isTyping) el.classList.add('active');
                    else el.classList.remove('active');
                },

                pingUser(name) {
                    const inp = document.getElementById('msgInput');
                    inp.value += `@${name} `;
                    inp.focus();
                },
                
                openProfile() {
                    document.getElementById('profileModal').classList.add('active');
                    const user = window.auth.currentUser;
                    if(user) {
                        document.getElementById('pName').value = user.displayName || '';
                        const currentAv = user.photoURL || `https://placehold.co/120x120/000000/00f3ff/png?text=${(user.email||"U")[0]}`;
                        document.getElementById('pAvatarPreview').src = currentAv;
                        const linkBox = document.getElementById('inviteLink');
                        if(linkBox) linkBox.textContent = `${window.location.origin}/?ref=${user.uid}`;
                    }
                },
                closeProfile() {
                    document.getElementById('profileModal').classList.remove('active');
                },

                // 🔥 НОВЫЕ ФУНКЦИИ ПРОСМОТРА ФОТО 🔥
                openImage(src) {
                    document.getElementById('imageViewerImg').src = src;
                    document.getElementById('imageViewerModal').classList.add('active');
                },
                closeImage() {
                    document.getElementById('imageViewerModal').classList.remove('active');
                    document.getElementById('imageViewerImg').src = '';
                }
            };

// --- TEXT SCRAMBLE FX ---
            class ScrambleText {
                constructor(el) {
                    this.el = el;
                    this.chars = '!<>-_\\/[]{}—=+*^?#________';
                    this.update = this.update.bind(this);
                }
                setText(newText) {
                    const oldText = this.el.innerText;
                    const length = Math.max(oldText.length, newText.length);
                    const promise = new Promise((resolve) => this.resolve = resolve);
                    this.queue = [];
                    for (let i = 0; i < length; i++) {
                        const from = oldText[i] || '';
                        const to = newText[i] || '';
                        const start = Math.floor(Math.random() * 40);
                        const end = start + Math.floor(Math.random() * 40);
                        this.queue.push({ from, to, start, end });
                    }
                    cancelAnimationFrame(this.frameRequest);
                    this.frame = 0;
                    this.update();
                    return promise;
                }
                update() {
                    let output = '';
                    let complete = 0;
                    for (let i = 0, n = this.queue.length; i < n; i++) {
                        let { from, to, start, end, char } = this.queue[i];
                        if (this.frame >= end) {
                            complete++;
                            output += to;
                        } else if (this.frame >= start) {
                            if (!char || Math.random() < 0.28) {
                                char = this.randomChar();
                                this.queue[i].char = char;
                            }
                            output += `<span style="color:var(--vox-cyan); opacity:0.5;">${char}</span>`;
                        } else {
                            output += from;
                        }
                    }
                    this.el.innerHTML = output;
                    if (complete === this.queue.length) {
                        this.resolve();
                    } else {
                        this.frameRequest = requestAnimationFrame(this.update);
                        this.frame++;
                    }
                }
                randomChar() {
                    return this.chars[Math.floor(Math.random() * this.chars.length)];
                }
            }
            
            // --- 💾 VAULT SYSTEM (STORAGE + DB) ---
            window.VaultSystem = {
                init() {
                    // Слушаем изменения в коллекции файлов текущего юзера
                    if(window.auth.currentUser && window.db) {
                        const uid = window.auth.currentUser.uid;
                        const q = window.fbQuery(
                            window.fbCol(window.db, "user_archives"), 
                            window.fbWhere("owner", "==", uid),
                            window.fbOrder("createdAt", "desc")
                        );
                        
                        window.fbSnap(q, (snapshot) => {
                            const grid = document.getElementById('vaultGrid');
                            grid.innerHTML = '';
                            
                            if(snapshot.empty) {
                                grid.innerHTML = `<div style="color:#666; grid-column:1/-1; text-align:center; padding:50px;">SECTOR EMPTY. UPLOAD DATA.</div>`;
                                return;
                            }

                            snapshot.forEach(doc => {
                                const f = doc.data();
                                this.renderCard(f, doc.id, grid);
                            });
                        });
                    }
                },

                renderCard(f, id, container) {
                    // Определяем стиль в зависимости от статуса
                    let statusColor = "#666";
                    let statusText = "PENDING SCAN...";
                    let isLocked = false;

                    if(f.status === 'safe') {
                        statusColor = "var(--vox-cyan)";
                        statusText = "VERIFIED SAFE";
                    } else if (f.status === 'threat') {
                        statusColor = "var(--alert-red)";
                        statusText = "QUARANTINED";
                        isLocked = true;
                    }

                    const ext = f.name.split('.').pop().toUpperCase();
                    
                    const div = document.createElement('div');
                    div.className = 'tech-card'; // Используем твой готовый стиль
                    div.style = `padding:15px; width:auto; border-color:${statusColor}; position:relative; min-height:180px; display:flex; flex-direction:column; justify-content:space-between;`;
                    
                    div.innerHTML = `
                        <div>
                            <div style="font-size:30px; color:${statusColor}; margin-bottom:10px;">${isLocked ? '🔒' : '📄'}</div>
                            <div style="font-size:12px; font-weight:bold; color:white; word-break:break-all;">${f.name}</div>
                            <div style="font-size:9px; color:#888; margin-top:5px;">${ext} FILE • ${(f.size/1024).toFixed(1)} KB</div>
                        </div>
                        
                        <div style="margin-top:15px; border-top:1px solid #333; padding-top:10px;">
                            <div style="font-size:9px; color:${statusColor}; font-family:var(--font-code); margin-bottom:5px;">STATUS: ${statusText}</div>
                            ${isLocked 
                                ? `<button class="btn-tech" style="width:100%; font-size:10px; border-color:red; color:red; cursor:not-allowed; opacity:0.5;">ACCESS DENIED</button>`
                                : `<a href="${f.url}" target="_blank" class="btn-tech" style="width:100%; font-size:10px; display:block; text-align:center; padding:5px;">RETRIEVE</a>`
                            }
                            <button class="btn-tech" style="width:100%; font-size:9px; margin-top:5px; border-color:#444; color:#666;" onclick="VaultSystem.deleteFile('${id}', '${f.refPath}')">PURGE</button>
                        </div>
                    `;
                    container.appendChild(div);
                },

                upload(input) {
                    const file = input.files[0];
                    if(!file || !window.auth.currentUser) return;
                    
                    voxNotify("UPLOADING TO SECURE VAULT...", "info");

                    const uid = window.auth.currentUser.uid;
                    const path = `archives/${uid}/${Date.now()}_${file.name}`;
                    const storageRef = window.fbRef(window.storage, path);
                    
                    // 1. Загрузка в Storage
                    window.fbUpload(storageRef, file).then((snap) => {
                        window.fbUrl(snap.ref).then((url) => {
                            // 2. Запись в БД (Статус по умолчанию 'scanning')
                            window.fbAdd(window.fbCol(window.db, "user_archives"), {
                                owner: uid,
                                name: file.name,
                                size: file.size,
                                url: url,
                                refPath: path, // Чтобы потом удалить
                                createdAt: window.fbTime(),
                                status: 'scanning' // Начальный статус
                            });

                            voxNotify("UPLOAD COMPLETE. SCANNING INITIATED.", "success");
                            
                            // 3. ФЕЙКОВОЕ СКАНИРОВАНИЕ (Симуляция работы Vanguard AI)
                            // Через 3 секунды меняем статус на SAFE (или случайно на THREAT)
                            setTimeout(() => {
                                this.simulateScan(file.name);
                            }, 3000);
                        });
                    });
                    input.value = '';
                },

                async simulateScan(fileName) {
                    // Ищем этот файл в базе (по имени и владельцу, свежий)
                    // (Для упрощения найдем последний добавленный)
                    const uid = window.auth.currentUser.uid;
                    const q = window.fbQuery(
                        window.fbCol(window.db, "user_archives"), 
                        window.fbWhere("owner", "==", uid),
                        window.fbWhere("name", "==", fileName),
                        window.fbLimit(1)
                    );
                    
                    const snap = await window.fbGetDocs(q);
                    if(!snap.empty) {
                        const doc = snap.docs[0];
                        // 10% шанс, что файл признают "Угрозой" (для атмосферы)
                        const isThreat = Math.random() < 0.1; 
                        
                        window.fbSet(doc.ref, { 
                            status: isThreat ? 'threat' : 'safe' 
                        }, { merge: true });

                        if(isThreat) {
                            voxNotify("ALERT: CONTRABAND DETECTED IN ARCHIVE!", "error");
                            window.SoundFX.error();
                        } else {
                            // voxNotify("SCAN COMPLETE: FILE CLEAN.", "success");
                        }
                    }
                },

                deleteFile(id, refPath) {
                    if(!confirm("PERMANENTLY PURGE DATA?")) return;
                    
                    // Удаляем из БД
                    window.fbDelete(window.fbDoc(window.db, "user_archives", id));
                    
                    // Удаляем из Storage (если нужно, но можно оставить для истории)
                    // const sRef = window.fbRef(window.storage, refPath);
                    // deleteObject(sRef)... (требует импорта deleteObject, пока пропустим для простоты)
                    
                    voxNotify("DATA EXPUNGED.", "info");
                }
            };

            // --- NEW: CLOUD SYNC (Chat & Files) ---
            window.CloudSystem = {
                chatListener: null,
                typingListener: null,
                typingTimeout: null,
                
                // USER MANAGEMENT
                registerUser(user) {
                    const ref = window.fbDoc(window.db, "users", user.uid);
                    window.fbSet(ref, {
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName || user.email.split('@')[0],
                        avatar: user.photoURL,
                        lastSeen: window.fbTime()
                    }, { merge: true });
                },
                
                listenToUsers() {
                    const q = window.fbQuery(window.fbCol(window.db, "users"));
                    window.fbSnap(q, (snapshot) => {
                        const users = [];
                        snapshot.forEach(doc => users.push(doc.data()));
                        MessengerUI.renderUsers(users);
                    });
                    
                    // Listen for incoming private messages for notifications/sorting
                    if (!window.auth.currentUser) return;
                    const qMsg = window.fbQuery(
                         window.fbCol(window.db, "messages_private"),
                         window.fbWhere("uid", "!=", window.auth.currentUser.uid), // Messages NOT from me
                         window.fbOrder("uid"), // Required for inequality filter
                         window.fbOrder("createdAt", "desc"),
                         window.fbLimit(1)
                    );
                    
                    // Note: This is a simplified listener for the demo to catch "Any" new message
                    // Ideally, we'd listen to the collection and filter client side or have a 'latest_messages' collection.
                    // Here we will rely on the generic chatListener to handle active chat updates, 
                    // and we implement a simple trick: 
                    // When a user selects a chat, we are fine.
                    // For background notifications, we would need a Cloud Function or complex queries.
                    // SIMPLIFICATION FOR THIS SNIPPET:
                    // We will just let the active chat update. Real background notifications require backend.
                    // However, we can simulate sorting:
                },
                
                // Внутри window.CloudSystem добавь этот метод:
                sendImage(input) {
                    const file = input.files[0];
                    if(!file) return;
                    
                    voxNotify("ENCRYPTING IMAGE DATA...", "info");
                    const storageRef = window.fbRef(window.storage, `chat_images/${Date.now()}_${file.name}`);
                    
                    window.fbUpload(storageRef, file).then((snapshot) => {
                        window.fbUrl(snapshot.ref).then((url) => {
                            // Отправляем как сообщение, но с типом 'image'
                            this.sendMessage(url, 'image'); // <-- Мы перегрузим sendMessage
                            voxNotify("VISUAL DATA SENT", "success");
                        });
                    });
                    input.value = ''; // Сброс
                },

                // ЗАМЕНИ СТАРЫЙ sendMessage НА ЭТОТ:
                sendMessage(content, type = 'text') {
                    const user = window.auth.currentUser;
                    if(!user) return;
                    
                    let finalContent = content;
                    let penalty = 0;

                    // --- 🛡️ VANGUARD PROTOCOL: CENSORSHIP ---
                    if (type === 'text') {
                        // --- 🛡️ VANGUARD CENSORSHIP PROTOCOL EXPANDED ---
                        const bannedWords = [
                            'alastor', 'radio', 'demon', 'deer', 'antler', 'cane', 'static', 
                            'analog', '1930', 'smile', 'smiling', 'jambalaya', 'jazz', 'broadcast',
                            'red', 'coat', 'strawberry', 'pimp','newspaper', 'paper', 'book', 'reading', 'wireless', 'tube', 
                            'vintage', 'antique', 'classic', 'retro','lag', 'glitch', 'bug', 'slow', 'crash', 'freeze', 'offline', 
                            'sucks', 'stupid', 'boring', 'trash', 'garbage', 'useless', 
                            'weak', 'pathetic', 'fail', 'failure', 'broken', 'bad', 
                            'scam', 'fake', 'lie', 'spy', 'surveillance', 'watching',
                            'angel', 'dust', 'charlie', 'vaggie', 'lucifer', 'hotel', 
                            'redemption', 'heaven', 'god', 'sinner', 'hell'
                        ];
                        let violationDetected = false;

                        bannedWords.forEach(word => {
                            const regex = new RegExp(word, "gi"); // Ищем слово независимо от регистра
                            if (finalContent.match(regex)) {
                                finalContent = finalContent.replace(regex, '[REDACTED]');
                                violationDetected = true;
                                penalty += 10;
                            }
                        });

                        if (violationDetected) {
                            // 1. Наказываем пользователя (снимаем Trust Score)
                            const userRef = window.fbDoc(window.db, "users", user.uid);
                            window.fbGet(userRef).then(doc => {
                                if (doc.exists()) {
                                    let currentScore = doc.data().trustScore || 50;
                                    let newScore = Math.max(0, currentScore - penalty);
                                    window.fbSet(userRef, { trustScore: newScore }, { merge: true });
                                }
                            });

                            // 2. Пугаем пользователя звуком и уведомлением
                            if(window.SoundFX) window.SoundFX.error();
                            voxNotify(`WARNING: LANGUAGE VIOLATION DETECTED. TRUST SCORE -${penalty}.`, 'error');
                        }
                    }
                    // -------------------------------------------
                    
                    let chatId = MessengerUI.currentChat;
                    let colName = chatId === 'global' ? "messages_global" : "messages_private";
                    
                    const payload = {
                        text: finalContent, // Отправляем уже очищенный текст
                        type: type,
                        uid: user.uid,
                        name: user.displayName || user.email.split('@')[0],
                        avatar: user.photoURL,
                        chatId: chatId,
                        createdAt: window.fbTime()
                    };

                    window.fbAdd(window.fbCol(window.db, colName), payload);
                    this.setTyping(false);
                    SoundFX.click();
                },

                // --- ВСТАВИТЬ ЭТО ВНУТРЬ CloudSystem (после sendMessage) ---
                uploadMedia(file, type) {
                    const user = window.auth.currentUser;
                    if(!user || !file) return;

                    // 1. Настройки метаданных (КЭШИРОВАНИЕ - ГЛАВНЫЙ УСКОРИТЕЛЬ)
                    const metadata = {
                        contentType: file.type,
                        // Заставляем браузер хранить файл 1 год. Повторный запуск будет мгновенным.
                        cacheControl: 'public, max-age=31536000' 
                    };

                    const fileName = `${type}s/${user.uid}_${Date.now()}_${file.name}`;
                    const storageRef = window.fbRef(window.storage, fileName);
                    
                    // 2. ИСПОЛЬЗУЕМ RESUMABLE UPLOAD (Для стабильности и скорости)
                    const uploadTask = window.fbUploadResumable(storageRef, file, metadata);

                    voxNotify(`INITIATING UPLINK: 0%`, "info");

                    // 3. СЛУШАЕМ ПРОГРЕСС
                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            // Вычисляем процент
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            // Показываем уведомление каждые 25%, чтобы не спамить
                            if(progress % 25 < 1 || progress === 100) {
                                voxNotify(`UPLOADING ${type.toUpperCase()}: ${Math.floor(progress)}%`, "info");
                            }
                        }, 
                        (error) => {
                            voxNotify("UPLOAD FAILURE: " + error.message, "error");
                        }, 
                        () => {
                            // 4. ЗАГРУЗКА ЗАВЕРШЕНА
                            window.fbUrl(uploadTask.snapshot.ref).then((url) => {
                                // Сохраняем в базу данных
                                const collectionName = type === 'video' ? "videos" : "audios";
                                const docData = {
                                    author: user.uid,
                                    name: file.name,
                                    url: url,
                                    createdAt: window.fbTime(),
                                    isCloud: true,
                                    size: file.size, // Полезно знать размер
                                    mime: file.type
                                };

                                window.fbAdd(window.fbCol(window.db, collectionName), docData);

                                // Если это аудио - добавляем в плейлист сразу
                                if(type === 'audio' && window.MusicSystem) {
                                    window.MusicSystem.playlist.push({ 
                                        name: file.name, url: url, isCloud: true 
                                    });
                                    window.MusicSystem.renderPlaylist();
                                }
                                
                                voxNotify("DATA SECURED IN ARCHIVE.", "success");
                            });
                        }
                    );
                },

                async updateProfile() {
                    const name = document.getElementById('pName').value.trim();
                    const themeSelect = document.getElementById('pTheme');
                    const theme = themeSelect ? themeSelect.value : '';
                    const fileInput = document.getElementById('pAvatarFile');
                    
                    const user = window.auth.currentUser;
                    if(!user) return;

                    voxNotify('PROCESSING BIOMETRIC DATA...', 'info');

                    let photoURL = user.photoURL; // По умолчанию оставляем старую

                    try {
                        // А. Если выбрали новый файл — грузим в облако
                        if (fileInput.files.length > 0) {
                            const file = fileInput.files[0];
                            // Создаем уникальное имя файла
                            const storageRef = window.fbRef(window.storage, `avatars/${user.uid}_${Date.now()}`);
                            const snapshot = await window.fbUpload(storageRef, file);
                            photoURL = await window.fbUrl(snapshot.ref); // Получаем ссылку
                        }

                        // Б. Обновляем профиль Firebase Auth
                        await window.fbUpdateProfile(user, {
                            displayName: name,
                            photoURL: photoURL
                        });

                        // В. Обновляем запись в Базе Данных (Firestore)
                        const userRef = window.fbDoc(window.db, "users", user.uid);
                        await window.fbSet(userRef, {
                            name: name,
                            avatar: photoURL,
                            theme: theme
                        }, { merge: true });

                        // Г. Применяем тему сразу
                        if(theme) document.body.className = theme;

                        voxNotify('IDENTITY UPDATED SUCCESSFULLY', 'success');
                        
                        // Обновляем список пользователей, чтобы увидеть изменения
                        this.registerUser(user);
                        MessengerUI.closeProfile();

                    } catch (err) {
                        console.error(err);
                        voxNotify('UPDATE FAILED: ' + err.message, 'error');
                    }
                },
                
                previewAvatar(input) {
                    if (input.files && input.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            document.getElementById('pAvatarPreview').src = e.target.result;
                        };
                        reader.readAsDataURL(input.files[0]);
                    }
                },

                setTyping(isTyping) {
                    const user = window.auth.currentUser;
                    const chatId = MessengerUI.currentChat;
                    if(!user || chatId === 'global') return; // Don't track global typing to save writes
                    
                    const ref = window.fbDoc(window.db, "typing", chatId);
                    // Use merge to update specific user key
                    window.fbSet(ref, { [user.uid]: isTyping }, { merge: true });
                },

                monitorTyping(chatId) {
                    if (this.typingListener) this.typingListener(); // Unsub
                    if (chatId === 'global') {
                        MessengerUI.showTyping(false);
                        return;
                    }
                    
                    const ref = window.fbDoc(window.db, "typing", chatId);
                    this.typingListener = window.fbSnap(ref, (doc) => {
                        if (doc.exists()) {
                            const data = doc.data();
                            let anyoneTyping = false;
                            Object.keys(data).forEach(uid => {
                                if (uid !== window.auth.currentUser.uid && data[uid] === true) {
                                    anyoneTyping = true;
                                }
                            });
                            MessengerUI.showTyping(anyoneTyping);
                        }
                    });
                },
                
                loadChat(chatId) {
                    // --- 1. КНОПКА ЗВОНКА (CANVAS VERSION) ---
                    const headerMain = document.querySelector('.chat-header'); 
                    const existingBtn = document.getElementById('btnStartCall');
                    if(existingBtn) existingBtn.remove();
    
                    if (chatId !== 'global' && headerMain) {
                        const btn = document.createElement('button');
                        btn.id = "btnStartCall";
        
        // СТИЛИ КНОПКИ (Контейнер)
                        btn.style = `
                            width: 40px; height: 40px; 
                            border-radius: 50%; border: 2px solid var(--vox-cyan);
                            background: transparent; padding: 0;
                            display: flex; align-items: center; justify-content: center;
                            box-shadow: 0 0 10px rgba(0, 243, 255, 0.2); 
                            transition: all 0.3s ease; cursor: pointer; overflow: hidden;
                        `;

                        // СОЗДАЕМ CANVAS
                        const cvs = document.createElement('canvas');
                        cvs.width = 40; 
                        cvs.height = 40;
                        const ctx = cvs.getContext('2d');

        // ФУНКЦИЯ ОТРИСОВКИ (Кибер-Трубка)
                        const drawIcon = (isActive) => {
                            ctx.clearRect(0, 0, 40, 40); // Чистим холст
            
            // Настройка цвета
                            const color = isActive ? '#000000' : '#00f3ff'; // При наведении черный (на фоне заливки), иначе циан
            
                            ctx.save();
                            ctx.translate(20, 20); // Центр
                            ctx.rotate(-45 * Math.PI / 180); // Поворот на 45 градусов (трубка лежит)
                            ctx.translate(-20, -20); // Возвращаем координаты

                            ctx.beginPath();
                            ctx.lineWidth = 2.5;
                            ctx.strokeStyle = color;
                            ctx.fillStyle = color;
            
            // Рисуем угловатую трубку (Low Poly Style)
            // Верхняя часть (динамик)
                            ctx.moveTo(12, 10); 
                            ctx.lineTo(28, 10);
                            ctx.lineTo(28, 16);
                            ctx.lineTo(24, 16);
            
            // Ручка (узкая часть)
                            ctx.lineTo(24, 24); 
                            ctx.lineTo(28, 24);
            
            // Нижняя часть (микрофон)
                            ctx.lineTo(28, 30);
                            ctx.lineTo(12, 30);
                            ctx.lineTo(12, 24);
                            ctx.lineTo(16, 24);
            
            // Возврат ручки
                            ctx.lineTo(16, 16);
                            ctx.lineTo(12, 16);
                            ctx.closePath();

                            if (isActive) {
                                ctx.fill(); // Заливаем цветом при наведении
                            } else {
                                ctx.stroke(); // Только контур в обычном состоянии
                
                // Добавляем "техно-точки" внутри, когда не активно
                                ctx.fillStyle = color;
                                ctx.fillRect(18, 12, 4, 2); // Точка сверху
                                ctx.fillRect(18, 26, 4, 2); // Точка снизу
                            }
            
                            ctx.restore();
                        };

        // Рисуем исходное состояние
                        drawIcon(false);
                        btn.appendChild(cvs);

        // Эффекты при наведении
                        btn.onmouseenter = () => { 
                            btn.style.background = "var(--vox-cyan)"; 
                            btn.style.boxShadow = "0 0 20px var(--vox-cyan)";
                            btn.style.transform = "scale(1.1)";
                            drawIcon(true); // Перерисовываем (заливка)
                        };
                        btn.onmouseleave = () => { 
                            btn.style.background = "transparent"; 
                            btn.style.boxShadow = "0 0 10px rgba(0, 243, 255, 0.2)";
                            btn.style.transform = "scale(1)";
                            drawIcon(false); // Перерисовываем (контур)
                        };

                        btn.onclick = () => {
                            const targetUid = chatId.replace(window.auth.currentUser.uid, '').replace('_', '');
                            CallSystem.initCall(targetUid);
                        };
        
                        headerMain.appendChild(btn);
                    }
                    // --- КОНЕЦ ЛОГИКИ КНОПКИ ---

                    // Дальше идет стандартная логика чата...
                    if(this.chatListener) this.chatListener();
                    
                    const feed = document.getElementById('chatFeed');
                    feed.innerHTML = '<div style="color:#666;text-align:center;margin-top:20px;">Establishing secure connection...</div>';
                    
                    let colName = chatId === 'global' ? "messages_global" : "messages_private";
                    let q;
                    
                    if (chatId === 'global') {
                         q = window.fbQuery(
                            window.fbCol(window.db, colName), 
                            window.fbOrder("createdAt", "asc")
                        );
                    } else {
                        q = window.fbQuery(
                            window.fbCol(window.db, colName), 
                            window.fbWhere("chatId", "==", chatId),
                            window.fbOrder("createdAt", "asc")
                        );
                    }
                    
                    this.chatListener = window.fbSnap(q, (snapshot) => {
                        feed.innerHTML = '';
                        
                        if (snapshot.empty) {
                            feed.innerHTML = `
                                <div class="empty-chat-state">
                                    <div class="empty-icon-box">
                                        <div class="empty-icon">❌</div>
                                    </div>
                                    <div class="empty-title">NO SIGNAL DETECTED</div>
                                    <div class="empty-sub">This channel is silent. Send encrypted data to begin transmission.</div>
                                </div>
                            `;
                            return;
                        }

                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                const data = change.doc.data();
                                // Тут можно добавить логику уведомлений
                            }
                        });

                        snapshot.forEach((doc) => {
                            const data = doc.data();
                            const isMe = data.uid === window.auth.currentUser.uid;
                            
                            const div = document.createElement('div');
                            div.dataset.id = doc.id; // ВАЖНО ДЛЯ АДМИНКИ (Удаление сообщений)
                            div.className = `msg-wrapper ${isMe ? 'me' : ''}`;
                            
                            const avatarUrl = data.avatar || `https://placehold.co/40x40/000000/00f3ff/png?text=${data.name[0]}`;
                            
                            let contentHtml = '';
                            if (data.type === 'image') {
                                // 🔥 БЫЛО: onclick="window.open(this.src)"
                                // 🔥 СТАЛО: onclick="MessengerUI.openImage(this.src)"
                                contentHtml = `<img src="${data.text}" class="msg-image" onclick="MessengerUI.openImage(this.src)">`;
                            } else {
                                contentHtml = `<div class="msg-bubble">${data.text}</div>`; 
                            }
                            
                            div.innerHTML = `
                                <div class="msg-avatar" onclick="MessengerUI.pingUser('${data.name}')">
                                    <img src="${avatarUrl}">
                                </div>
                                <div class="msg-content">
                                    <div class="msg-name">${data.name}</div>
                                    ${contentHtml} 
                                </div>
                            `;
                            
                            feed.appendChild(div);

                            // Скремблинг только для текста и чужих сообщений
                            if (!isMe && data.type !== 'image') {
                                const bubble = div.querySelector('.msg-bubble');
                                if(bubble) {
                                    const scrambler = new ScrambleText(bubble);
                                    scrambler.setText(data.text);
                                }
                            }
                        });
                        feed.scrollTop = feed.scrollHeight;
                    });
                }
            };

            // Listen for typing input
            document.getElementById('msgInput').addEventListener('input', () => {
                 CloudSystem.setTyping(true);
                 clearTimeout(CloudSystem.typingTimeout);
                 CloudSystem.typingTimeout = setTimeout(() => CloudSystem.setTyping(false), 2000);
            });
            
            document.getElementById('msgInput').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    AuthSystem.send();
                }
            });

            window.CustomDialog = {
                resolver: null,
                close(val) {
                    document.getElementById('customModal').classList.remove('active');
                    if(this.resolver) this.resolver(val);
                }
            };

// --- 12. CUSTOM ALERTS (OVERRIDE BROWSER DEFAULTS) ---
            window.alert = (msg) => {
                return new Promise(resolve => {
                    const m = document.getElementById('customModal');
                    document.getElementById('modalTitle').textContent = "SYSTEM NOTIFICATION";
                    document.getElementById('modalText').textContent = msg;
                    document.getElementById('modalInput').style.display = 'none';
                    const btns = document.getElementById('modalActions');
                    // ЯВНО УКАЗЫВАЕМ window.CustomDialog
                    btns.innerHTML = `<button class="btn-tech" onclick="window.CustomDialog.close(true)">ACKNOWLEDGE</button>`;
                    m.classList.add('active');
                    window.CustomDialog.resolver = resolve;
                });
            };

            window.confirm = (msg) => {
                return new Promise(resolve => {
                    const m = document.getElementById('customModal');
                    document.getElementById('modalTitle').textContent = "CONFIRM ACTION";
                    document.getElementById('modalText').textContent = msg;
                    document.getElementById('modalInput').style.display = 'none';
                    const btns = document.getElementById('modalActions');
                    btns.innerHTML = `
                        <button class="btn-tech" style="border-color:#555; color:#aaa;" onclick="window.CustomDialog.close(false)">CANCEL</button>
                        <button class="btn-tech" onclick="window.CustomDialog.close(true)">CONFIRM</button>
                    `;
                    m.classList.add('active');
                    window.CustomDialog.resolver = resolve;
                });
            };

            window.prompt = (msg, def = '') => {
                return new Promise(resolve => {
                    const m = document.getElementById('customModal');
                    document.getElementById('modalTitle').textContent = "INPUT REQUIRED";
                    document.getElementById('modalText').textContent = msg;
                    const inp = document.getElementById('modalInput');
                    inp.style.display = 'block';
                    inp.value = def;
                    inp.focus();
                    const btns = document.getElementById('modalActions');
                    btns.innerHTML = `
                        <button class="btn-tech" style="border-color:#555; color:#aaa;" onclick="window.CustomDialog.close(null)">CANCEL</button>
                        <button class="btn-tech" onclick="window.CustomDialog.close(document.getElementById('modalInput').value)">SUBMIT</button>
                    `;
                    m.classList.add('active');
                    window.CustomDialog.resolver = resolve;
                });
            };

            // --- 13. WEBRTC CALL SYSTEM (FINAL: AVATARS & SYNC) ---
            window.CallSystem = {
                peerConnection: null,
                localStream: null,
                currentCallId: null,
                ringtoneInterval: null,
                unsubscribeCall: null,
                unsubscribeCand: null,
                unsubscribeGlobal: null,
                isCaller: false, // Флаг: я звоню или мне звонят?
                
                servers: {
                    iceServers: [
                        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
                    ]
                },

                icons: {
                    mic: `<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.66 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`,
                    micOff: `<svg viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17l1-1C16.55 9.61 17 8.85 17 8c0-2.43-1.66-4.4-3.87-4.93l-1.4-1.4c4.1.75 7.27 4.26 7.27 8.5h-2c0-1.87-.64-3.61-1.78-4.93zM8 5v.39l6.13 6.13c-.27.83-.82 1.55-1.57 2.04l1.45 1.45C15.55 13.92 16.5 12.57 17 11h-2c0 2.76-2.24 5-5 5-2.23 0-4.14-1.49-4.8-3.64l-1.42-1.42C4.38 12.31 5 14.28 5 16h2c0-2.31 1.6-4.24 3.8-4.78V16c0 .59.13 1.15.36 1.65l2.45 2.45L12 21.71 20.29 13.41 5.41 1.71 4 3.12 8 7.12V5H8z"/></svg>`,
                    cam: `<svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`,
                    camOff: `<svg viewBox="0 0 24 24"><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/></svg>`,
                    hangup: `<svg viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>`
                },

                // --- HELPER: GET SAFE NAME ---
                getMyInfo() {
                    const u = window.auth.currentUser;
                    return {
                        name: u.displayName || u.email.split('@')[0] || "Unknown Agent",
                        avatar: u.photoURL || `https://placehold.co/120x120/000000/00f3ff/png?text=${(u.email||"U")[0].toUpperCase()}`
                    };
                },

                renderControls() {
                    const controls = document.querySelector('.call-controls');
                    if(controls) {
                        controls.innerHTML = `
                            <button id="btnToggleMic" class="btn-call btn-mute" onclick="CallSystem.toggleAudio()">${this.icons.mic}</button>
                            <button class="btn-call btn-hangup" onclick="CallSystem.endCall(true)">${this.icons.hangup}</button>
                            <button id="btnToggleCam" class="btn-call btn-mute" onclick="CallSystem.toggleVideo()">${this.icons.cam}</button>
                        `;
                    }
                },

                // --- UI UPDATE: AVATAR ---
                updateRemoteAvatar(show, name, avatarUrl, status) {
                    const container = document.getElementById('remoteAvatarContainer');
                    const img = document.getElementById('remoteAvatar');
                    const nameEl = document.getElementById('remoteName');
                    const statusEl = document.getElementById('remoteStatusLabel');

                    if(name) nameEl.textContent = name;
                    if(avatarUrl) img.src = avatarUrl;
                    if(status) statusEl.textContent = status;

                    if (show) {
                        container.classList.remove('hidden');
                    } else {
                        container.classList.add('hidden');
                    }
                },

                // --- RINGTONE ---
                startRinging(type) {
                    this.stopRinging();
                    if (type === 'outgoing') {
                        SoundFX.playTone(400, 'sine', 0.8);
                        this.ringtoneInterval = setInterval(() => SoundFX.playTone(400, 'sine', 0.8), 2500);
                    } else if (type === 'incoming') {
                        const playPattern = () => {
                            SoundFX.playTone(800, 'square', 0.1);
                            setTimeout(() => SoundFX.playTone(1200, 'square', 0.1), 150);
                            setTimeout(() => SoundFX.playTone(800, 'square', 0.1), 300);
                        };
                        playPattern();
                        this.ringtoneInterval = setInterval(playPattern, 2000);
                    }
                },
                stopRinging() {
                    if (this.ringtoneInterval) { clearInterval(this.ringtoneInterval); this.ringtoneInterval = null; }
                },

                monitorNetwork() {
                    setInterval(() => {
                        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                        if (conn) {
                            const rtt = conn.rtt; // Пинг
                            const type = conn.effectiveType; // 4g, 3g...
            
                            document.getElementById('pingVal').textContent = `${type.toUpperCase()} (${rtt}ms)`;
            
                            // Красим палочки
                            const bars = document.querySelectorAll('.sig-bar');
                            bars.forEach(b => b.style.background = '#333'); // Сброс
            
                            if(rtt < 300) document.getElementById('sb1').style.background = 'var(--vox-cyan)';
                            if(rtt < 200) document.getElementById('sb2').style.background = 'var(--vox-cyan)';
                            if(rtt < 100) document.getElementById('sb3').style.background = 'var(--vox-cyan)';
                            if(rtt < 50)  document.getElementById('sb4').style.background = 'var(--vox-cyan)';
                        }
                    }, 2000);
                },

                // --- INIT CALL (CALLER) ---
                async initCall(targetUid) {

                    // 🔥 LOCKDOWN: БЛОКИРУЕМ СКРОЛЛ И ПРЯЧЕМ КНОПКУ АДМИНА
                    document.body.style.overflow = 'hidden'; 
                    const admBtn = document.getElementById('adminToggleBtn');
                    if(admBtn) admBtn.style.display = 'none';

                    CallSystem.monitorNetwork()
                    this.isCaller = true;
                    this.renderControls();
                    document.getElementById('callInterface').classList.add('active');
                    document.getElementById('callStatusText').textContent = "INITIALIZING UPLINK...";
                    this.startRinging('outgoing');
                    
                    // Показываем заглушку, пока идет дозвон
                    this.updateRemoteAvatar(true, "DIALING...", null, "SEARCHING DATABASE...");

                    // 1. Получаем данные того, КОМУ звоним (чтобы видеть аватарку сразу)
                    try {
                        const targetDoc = await window.fbGet(window.fbDoc(window.db, "users", targetUid));
                        if(targetDoc.exists()) {
                            const tData = targetDoc.data();
                            const tName = tData.name || "Unknown Target";
                            const tAv = tData.avatar || `https://placehold.co/120x120/000000/00f3ff/png?text=${tName[0]}`;
                            this.updateRemoteAvatar(true, tName, tAv, "CALLING...");
                        }
                    } catch(e) { console.log("Target info fetch failed", e); }

                    // 2. Local Media
                    try {
                        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                        document.getElementById('localVideo').srcObject = this.localStream;
                        document.getElementById('localVideo').muted = true;
                        document.getElementById('localVideo').style.display = 'block';
                    } catch(e) {
                        voxNotify("CAMERA/MIC ACCESS DENIED", "error");
                        this.endCall(false);
                        return;
                    }

                    this.peerConnection = new RTCPeerConnection(this.servers);
                    this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));

                    this.peerConnection.ontrack = (event) => {
                        document.getElementById('remoteVideo').srcObject = event.streams[0];
                        // Видео пошло? Скрываем аватарку, если камера не выключена удаленно
                         this.updateRemoteAvatar(false);
                    };

                    this.peerConnection.onicecandidate = (event) => {
                        if (event.candidate && this.currentCallId) {
                            window.fbAdd(window.fbCol(window.db, `calls/${this.currentCallId}/callerCandidates`), event.candidate.toJSON());
                        }
                    };

                    const callDoc = window.fbDoc(window.fbCol(window.db, "calls"));
                    this.currentCallId = callDoc.id;

                    const offerDescription = await this.peerConnection.createOffer();
                    await this.peerConnection.setLocalDescription(offerDescription);

                    const myInfo = this.getMyInfo();

                    await window.fbSet(callDoc, {
                        offer: { sdp: offerDescription.sdp, type: offerDescription.type },
                        callerId: window.auth.currentUser.uid,
                        callerName: myInfo.name,     // ОТПРАВЛЯЕМ ПРАВИЛЬНОЕ ИМЯ
                        callerAvatar: myInfo.avatar, // И АВАТАР
                        callerMuted: false,          // Статус камеры
                        
                        calleeId: targetUid,
                        createdAt: window.fbTime(),
                        status: 'ringing'
                    });

                    // Слушаем изменения
                    this.unsubscribeCall = window.fbSnap(callDoc, (snapshot) => {
                        const data = snapshot.data();
                        if (!data) return;

                        // Если ответили
                        if (!this.peerConnection.currentRemoteDescription && data.answer) {
                            this.stopRinging();
                            const answerDescription = new RTCSessionDescription(data.answer);
                            this.peerConnection.setRemoteDescription(answerDescription);
                            document.getElementById('callStatusText').textContent = "CONNECTED. SIGNAL SECURE.";
                            
                            // Обновим аватар/имя, если они пришли в ответе
                            if(data.calleeName) {
                                this.updateRemoteAvatar(false, data.calleeName, data.calleeAvatar);
                            }
                        }
                        
                        // СЛЕЖКА ЗА КАМЕРОЙ СОБЕСЕДНИКА (Callee)
                        if (data.calleeMuted === true) {
                            this.updateRemoteAvatar(true, null, null, "CAMERA OFF");
                        } else if (data.status === 'connected') {
                            this.updateRemoteAvatar(false);
                        }

                        if (data.status === 'ended') {
                            this.endCall(false);
                        }
                    });
                    
                    this.unsubscribeCand = window.fbSnap(window.fbCol(window.db, `calls/${this.currentCallId}/calleeCandidates`), (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') this.peerConnection.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                        });
                    });
                },

                // Внутри window.CallSystem
                listenGlobal() {
                    const uid = window.auth.currentUser.uid;
                    const q = window.fbQuery(
                        window.fbCol(window.db, "calls"),
                        window.fbWhere("calleeId", "==", uid),
                        window.fbOrder("createdAt", "desc"), 
                        window.fbLimit(1)
                    );

                    this.unsubscribeGlobal = window.fbSnap(q, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                const data = change.doc.data();
                                const isRecent = data.createdAt ? (Date.now() - data.createdAt.toMillis() < 60000) : true;
                                
                                if (!this.currentCallId && isRecent && data.status === 'ringing') {
                                    this.currentCallId = change.doc.id;
                                    
                                    // 1. ИМЯ
                                    const cName = data.callerName || "Unknown Caller";
                                    document.getElementById('callerNameDisplay').textContent = cName;

                                    // 2. АВАТАР (НОВОЕ!)
                                    const cAvatar = data.callerAvatar || `https://placehold.co/80x80/000000/00f3ff/png?text=${cName[0]}`;
                                    document.getElementById('incomingCallerAvatar').src = cAvatar;
                                    
                                    document.getElementById('incomingCallModal').classList.add('active');
                                    this.startRinging('incoming');
                                    
                                    const callDoc = window.fbDoc(window.db, "calls", this.currentCallId);
                                    this.unsubscribeCall = window.fbSnap(callDoc, (snap) => {
                                        if(snap.exists() && snap.data().status === 'ended') {
                                            this.reject();
                                        }
                                    });
                                }
                            }
                        });
                    });
                },

                // --- ANSWER (RECEIVER) ---
                async answer() {

                    // 🔥 LOCKDOWN: БЛОКИРУЕМ СКРОЛЛ И ПРЯЧЕМ КНОПКУ АДМИНА
                    document.body.style.overflow = 'hidden';
                    const admBtn = document.getElementById('adminToggleBtn');
                    if(admBtn) admBtn.style.display = 'none';

                    this.isCaller = false;
                    this.stopRinging();
                    document.getElementById('incomingCallModal').classList.remove('active');
                    document.getElementById('callInterface').classList.add('active');
                    this.renderControls();
                    
                    const callId = this.currentCallId;
                    const callDoc = window.fbDoc(window.db, "calls", callId);
                    
                    // Показываем аватар звонившего пока грузится видео
                    this.updateRemoteAvatar(true, "CONNECTING...", null, "SYNCING...");

                    try {
                        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                        document.getElementById('localVideo').srcObject = this.localStream;
                        document.getElementById('localVideo').muted = true;
                        document.getElementById('localVideo').style.display = 'block';
                    } catch(e) {
                        voxNotify("MEDIA ERROR", "error");
                        this.endCall(true);
                        return;
                    }

                    this.peerConnection = new RTCPeerConnection(this.servers);
                    this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));

                    this.peerConnection.ontrack = (event) => {
                         document.getElementById('remoteVideo').srcObject = event.streams[0];
                         this.updateRemoteAvatar(false);
                    };
                    this.peerConnection.onicecandidate = (event) => {
                        if (event.candidate) window.fbAdd(window.fbCol(window.db, `calls/${callId}/calleeCandidates`), event.candidate.toJSON());
                    };

                    const callSnap = await window.fbGet(callDoc);
                    const callData = callSnap.data(); 
                    
                    // Обновляем инфу о звонящем из данных звонка
                    if(callData) {
                         this.updateRemoteAvatar(true, callData.callerName, callData.callerAvatar, "CONNECTING...");
                    }

                    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(callData.offer));
                    const answerDescription = await this.peerConnection.createAnswer();
                    await this.peerConnection.setLocalDescription(answerDescription);
                    
                    const myInfo = this.getMyInfo();

                    await window.fbSet(callDoc, { 
                        answer: { type: answerDescription.type, sdp: answerDescription.sdp },
                        status: 'connected',
                        calleeName: myInfo.name,      // ШЛЕМ СВОЕ ИМЯ
                        calleeAvatar: myInfo.avatar,  // И АВАТАР
                        calleeMuted: false
                    }, { merge: true });
                    
                    // Переподписываемся на слушатель, чтобы ловить выключение камеры
                    if(this.unsubscribeCall) this.unsubscribeCall();
                    this.unsubscribeCall = window.fbSnap(callDoc, (snapshot) => {
                         const data = snapshot.data();
                         if(!data) return;
                         
                         // СЛЕЖКА ЗА КАМЕРОЙ ЗВОНЯЩЕГО (Caller)
                         if (data.callerMuted === true) {
                             this.updateRemoteAvatar(true, null, null, "CAMERA OFF");
                         } else if (data.status === 'connected') {
                             this.updateRemoteAvatar(false);
                         }
                         
                         if (data.status === 'ended') this.endCall(false);
                    });

                    this.unsubscribeCand = window.fbSnap(window.fbCol(window.db, `calls/${callId}/callerCandidates`), (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') this.peerConnection.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                        });
                    });
                    
                    document.getElementById('callStatusText').textContent = "UPLINK ESTABLISHED";
                },

                reject() {
                    this.stopRinging();
                    document.getElementById('incomingCallModal').classList.remove('active');
                    if(this.currentCallId) {
                         window.fbSet(window.fbDoc(window.db, "calls", this.currentCallId), { status: 'ended' }, { merge: true });
                    }
                    this.cleanup();
                },

                endCall(notifyDb = true) {
                    if (this.currentCallId && notifyDb) {
                        window.fbSet(window.fbDoc(window.db, "calls", this.currentCallId), { status: 'ended' }, { merge: true })
                            .catch(e => console.log("Call end write failed", e));
                    }
                    this.cleanup();
                    voxNotify("TRANSMISSION TERMINATED", "info");
                },

                cleanup() {

                    // 🔥 UNLOCK: ВОЗВРАЩАЕМ СКРОЛЛ
                    document.body.style.overflow = 'auto';

                    // 🔥 ВОЗВРАЩАЕМ КНОПКУ (ТОЛЬКО ЕСЛИ ТЫ АДМИН)
                    if(window.auth.currentUser && window.auth.currentUser.email === 'voxtek@voxtek.net') {
                        const admBtn = document.getElementById('adminToggleBtn');
                        if(admBtn) admBtn.style.display = 'block';
                    }

                    this.stopRinging();
                    if (this.localStream) {
                        this.localStream.getTracks().forEach(track => track.stop());
                        this.localStream = null;
                    }
                    if (this.peerConnection) {
                        this.peerConnection.close();
                        this.peerConnection = null;
                    }
                    if (this.unsubscribeCall) this.unsubscribeCall();
                    if (this.unsubscribeCand) this.unsubscribeCand();
                    this.currentCallId = null;
                    
                    document.getElementById('callInterface').classList.remove('active');
                    document.getElementById('incomingCallModal').classList.remove('active');
                    document.getElementById('remoteVideo').srcObject = null;
                    document.getElementById('localVideo').srcObject = null;
                    document.getElementById('callStatusText').textContent = "DISCONNECTED";
                },
                
                toggleAudio() {
                    if (this.localStream) {
                        const track = this.localStream.getAudioTracks()[0];
                        track.enabled = !track.enabled;
                        const btn = document.getElementById('btnToggleMic');
                        if (track.enabled) {
                            btn.classList.remove('off'); btn.innerHTML = this.icons.mic;
                        } else {
                            btn.classList.add('off'); btn.innerHTML = this.icons.micOff;
                        }
                    }
                },
                
                toggleVideo() {
                    if (this.localStream) {
                        const track = this.localStream.getVideoTracks()[0];
                        track.enabled = !track.enabled;
                        
                        // --- НОВАЯ ЛОГИКА: ПРЯЧЕМ/ПОКАЗЫВАЕМ ОКОШКО ---
                        const localVidEl = document.getElementById('localVideo');
                        if (track.enabled) {
                            localVidEl.style.display = 'block'; // Камера ВКЛ — показываем окно
                        } else {
                            localVidEl.style.display = 'none';  // Камера ВЫКЛ — убираем окно полностью
                        }
                        // ----------------------------------------------

                        // ОБНОВЛЯЕМ БАЗУ ДАННЫХ (Это у тебя уже было)
                        if(this.currentCallId) {
                            const field = this.isCaller ? 'callerMuted' : 'calleeMuted';
                            window.fbSet(window.fbDoc(window.db, "calls", this.currentCallId), { 
                                [field]: !track.enabled 
                            }, { merge: true });
                        }

                        // МЕНЯЕМ ИКОНКУ КНОПКИ (Это тоже было)
                        const btn = document.getElementById('btnToggleCam');
                        if (track.enabled) {
                            btn.classList.remove('off'); btn.innerHTML = this.icons.cam;
                        } else {
                            btn.classList.add('off'); btn.innerHTML = this.icons.camOff;
                        }
                    }
                }

            }; // <-- close window.CallSystem object to prevent syntax errors

            // --- 14. UPDATED ADMIN: BLUE & EDIT/DELETE ---
            // Update AdminSystem init to apply blue mode
            const originalAdminInit = window.AdminSystem.init;
            window.AdminSystem.init = function(user) {
                originalAdminInit.call(this, user);
                if (user && user.email === 'voxtek@voxtek.net') {
                    const panel = document.getElementById('adminPanel');
                    panel.classList.add('blue-mode');
                    panel.querySelector('h3').textContent = "VOXTEK ENTERPRISES";
                    document.getElementById('adminToggleBtn').style.borderColor = "var(--vox-cyan)";
                    document.getElementById('adminToggleBtn').style.color = "var(--vox-cyan)";
                }
            }; 
            
            window.AdminSystem.deleteMessage = async function(col, id) {
                if(await confirm("PERMANENTLY DELETE RECORD?")) {
                     window.node_deleteDoc ? window.node_deleteDoc(window.fbDoc(window.db, col, id)) : 
                     window.fbDelete(window.fbDoc(window.db, col, id));
                     voxNotify("RECORD EXPUNGED", "success");
                }
            };
            
            window.AdminSystem.editMessage = async function(col, id, oldText) {
                const newText = await prompt("REWRITE HISTORY:", oldText);
                if(newText && newText !== oldText) {
                    window.fbSet(window.fbDoc(window.db, col, id), { text: newText }, { merge: true });
                    voxNotify("REALITY UPDATED", "success");
                }
            };
            
            // Hook into CloudSystem to Render Admin Tools for Messages
            // We override the listener inside loadChat slightly by injecting tools after render
            // Note: Since we can't easily inject into the middle of your existing listener without re-writing it entirely,
            // We will use a MutationObserver to watch the chat feed and add buttons if Admin.
            
            // Hook into CloudSystem to Render Admin Tools for Messages
            const chatObserver = new MutationObserver((mutations) => {
                if(window.auth.currentUser && window.auth.currentUser.email === 'voxtek@voxtek.net') {
                    mutations.forEach(mut => {
                        mut.addedNodes.forEach(node => {
                            if(node.classList && node.classList.contains('msg-wrapper')) {
                                // Добавляем слушатель правого клика
                                node.addEventListener('contextmenu', async (e) => {
                                    e.preventDefault();
                                    const msgId = node.dataset.id;
                                    if (!msgId) return voxNotify("ERROR: NO ID FOUND", "error");

                                    // 🔥 ТЕПЕРЬ ВЫЗЫВАЕМ НАШЕ КРАСИВОЕ МЕНЮ С КНОПКАМИ 🔥
                                    const action = await AdminSystem.askMessageAction(msgId);
                                    
                                    // 👇 ДОБАВЛЯЕМ ЗАДЕРЖКУ (ФИКС ОШИБКИ) 👇
                                    setTimeout(() => {
                                        // Определяем коллекцию (Глобальный чат или Личный)
                                        const col = MessengerUI.currentChat === 'global' ? 'messages_global' : 'messages_private';

                                        if (action === 'delete') {
                                            AdminSystem.deleteMessage(col, msgId);
                                        } else if (action === 'edit') {
                                            // Берем старый текст для удобства
                                            const oldText = node.querySelector('.msg-bubble') ? node.querySelector('.msg-bubble').innerText : "";
                                            AdminSystem.editMessage(col, msgId, oldText);
                                        }
                                    }, 100); // 👈 Ждем 100мс, чтобы браузер не паниковал
                                    // Если нажали Cancel (null), ничего не делаем
                                });
                            }
                        });
                    });
                }
            });
            chatObserver.observe(document.getElementById('chatFeed'), { childList: true });
            
            // Start Listening for calls on boot
            setTimeout(() => {
                if(window.auth.currentUser) CallSystem.listenGlobal();
            }, 3000);

// --- SAFE INITIALIZATION (ANTI-SPAM & RACE CONDITION FIX) ---
            let systemLoaded = false; // Глобальный флаг защиты от повторного запуска

            // --- ☢️ DEFCON SYSTEM (GLOBAL CONTROL) ---
            window.DefconSystem = {
                currentLevel: 1,
                listener: null,
                
                init() {
                    if (this.listener) return; // Защита от дублей

                    if(window.db) {
                        const ref = window.fbDoc(window.db, "system_state", "defcon");
                        this.listener = window.fbSnap(ref, (doc) => {
                            if(doc.exists()) {
                                const data = doc.data();
                                // Применяем, если уровень изменился или при первой загрузке
                                if (this.currentLevel !== data.level) {
                                    this.applyLevel(data.level || 1);
                                }
                            }
                        });
                    }
                },

                async set(lvl) {
                    if(!await confirm(`INITIATE DEFCON ${lvl}? THIS AFFECTS ALL USERS.`)) return;
                    
                    try {
                        await window.fbSet(window.fbDoc(window.db, "system_state", "defcon"), {
                            level: lvl,
                            timestamp: window.fbTime(),
                            setBy: window.auth.currentUser.email
                        });
                        voxNotify(`COMMAND SENT: DEFCON ${lvl}`, "success");
                    } catch(e) {
                        voxNotify("ERROR: " + e.message, "error");
                    }
                },

                applyLevel(lvl) {
                    this.currentLevel = lvl;
                    const body = document.body;
                    
                    // Сброс классов
                    body.classList.remove('defcon-caution', 'defcon-critical', 'defcon-lockdown');
                    
                    const display = document.getElementById('currentDefconDisplay');
                    const ticker = document.querySelector('.ticker-move'); // Находим бегущую строку

                    // Хелпер для быстрого создания HTML строки тикера
                    const setTickerText = (t1, t2, t3) => {
                        if(ticker) {
                            ticker.innerHTML = `
                                <span>${t1}</span>
                                <span style="color:var(--alert-red); margin:0 20px;">///</span>
                                <span>${t2}</span>
                                <span style="color:var(--alert-red); margin:0 20px;">///</span>
                                <span>${t3}</span>
                            `;
                        }
                    };

                    switch(lvl) {
                        case 1: // SAFE (Green/Blue)
                            if(display) display.textContent = "STATUS: NORMAL OPERATION";
                            if(ticker) ticker.style.animationDuration = "30s"; 
                            
                            // 🔥 ТЕКСТ ДЛЯ УРОВНЯ 1 (РЕКЛАМА)
                            setTickerText(
                                "WELCOME TO VOXTEK ENTERPRISES",
                                "HERE YOU CAN SEND MESSAGES, MAKE CALLS AND MUCH MORE",
                                "YOU CAN TRUST US WITH YOUR ENTERTAIMENT"
                            );
                            window.setBrowserColor("#00f3ff"); 
                            break;
                            
                        case 2: // CAUTION (Yellow)
                            body.classList.add('defcon-caution');
                            if(display) display.textContent = "STATUS: ELEVATED THREAT";
                            if(ticker) ticker.style.animationDuration = "20s"; // Чуть быстрее
                            
                            // 🔥 ТЕКСТ ДЛЯ УРОВНЯ 2 (ПРЕДУПРЕЖДЕНИЯ)
                            setTickerText(
                                "⚠ SECURITY ALERT: YELLOW LEVEL",
                                "REPORT SUSPICIOUS SIGNAL ACTIVITY",
                                "IF YOU FIND ANYTHING SUSPICIOUS ON THE WEBSITE, PLEASE LET US KNOW!",
                                "YOUR SAFETY IS OUR PRIORITY"
                            );
                            
                            voxNotify("ALERT: THREAT LEVEL INCREASED.", "info");
                            window.setBrowserColor("#ffbb00"); 
                            break;
                            
                        case 3: // CRITICAL (Red)
                            body.classList.add('defcon-critical');
                            if(display) display.textContent = "STATUS: CRITICAL FAILURE";
                            if(ticker) ticker.style.animationDuration = "10s"; // Быстро
                            
                            // 🔥 ТЕКСТ ДЛЯ УРОВНЯ 3 (ПАНИКА)
                            setTickerText(
                                "WE DETECTED ANOMALOUS ACTIVITY ON THE WEBSITE",
                                "THIS ANOMALY IS NOT DANGEROUS",
                                "YOU CAN TRUST US WITH YOUR SAFETY"
                            );
                            
                            if(window.SoundFX) {
                                window.SoundFX.playTone(400, 'sawtooth', 0.5);
                                setTimeout(() => window.SoundFX.playTone(300, 'sawtooth', 0.5), 600);
                            }
                            voxNotify("WARNING: IMMINENT DANGER.", "error");
                            window.setBrowserColor("#ff0000"); 
                            break;
                            
                        case 4: // LOCKDOWN (Black)
                            body.classList.add('defcon-lockdown');
                            if(display) display.textContent = "STATUS: MANDATORY LOCKDOWN";
                            if(ticker) ticker.style.animationDuration = "5s"; // Очень быстро
                            
                            // 🔥 ТЕКСТ ДЛЯ УРОВНЯ 4 (ПРИКАЗЫ)
                            setTickerText(
                                "SITE BLOCKING HAS BEEN INTRODUCED",
                                "KEEP CALM, DO NOT PANIC",
                                "WE ARE ALREADY WORKING ON THE SITUATIONN"
                            );

                            const inp = document.getElementById('msgInput');
                            if(inp) { inp.disabled = true; inp.placeholder = "TERMINAL LOCKED BY ADMINISTRATOR"; }
                            voxNotify("LOCKDOWN INITIATED. REMAIN CALM.", "error");
                            window.setBrowserColor("#000000"); 
                            break;
                    }
                    
                    // Разблокировка чата, если не уровень 4
                    if (lvl !== 4) {
                        const inp = document.getElementById('msgInput');
                        if(inp) { inp.disabled = false; inp.placeholder = "Type encrypted message..."; }
                    }
                }
            };

            const initVoxSystem = () => {
                // Если система уже загружена, выходим, чтобы не дублировать уведомления
                if (systemLoaded) return;

                // Проверяем, загрузился ли Firebase (fbCol)
                if (window.fbCol && window.auth && window.db) {
                    
                    systemLoaded = true; // Ставим флаг: "Система загружена"

                    // 1. Запускаем авторизацию (проверку входа)
                    if(window.AuthSystem) AuthSystem.init();
                    if(window.DefconSystem) DefconSystem.init();
                    
                    // 2. Запускаем глобальный слушатель сообщений (ИСПРАВЛЕННЫЙ)
                    if(window.auth.currentUser) {
                         try {
                             // 🔥 ИЗМЕНЕНИЕ: Снимаем фильтр по chatId, слушаем ВООБЩЕ ВСЁ
                             const qAll = window.fbQuery(
                                 window.fbCol(window.db, "messages_private"),
                                 window.fbOrder("createdAt", "desc"),
                                 window.fbLimit(50) 
                             );
                             
                             window.fbSnap(qAll, (snapshot) => {
                                snapshot.docChanges().forEach((change) => {
                                    if (change.type === "added") {
                                        const data = change.doc.data();
                                        const myUid = window.auth.currentUser.uid;

                                        // Проверяем: касается ли сообщение меня? (я отправил ИЛИ мне отправили)
                                        if (data.chatId && data.chatId.includes(myUid)) {
                                            
                                            // Вычисляем, кто собеседник
                                            let partnerId = data.uid; 
                                            if (data.uid === myUid) {
                                                // Если я писал, то собеседник — это "другая часть" ID чата
                                                partnerId = data.chatId.replace(myUid, '').replace('_', '');
                                            }

                                            // Если объект MessengerUI еще не загрузился - ждем
                                            if(window.MessengerUI) {
                                                // 1. Запоминаем время активности (чтобы чат прыгнул вверх)
                                                const msgTime = data.createdAt ? data.createdAt.toMillis() : Date.now();
                                                MessengerUI.lastActiveTimes[partnerId] = msgTime;
                                                
                                                // 2. Если сообщение от ДРУГОГО и мы НЕ в этом чате -> ставим цифру
                                                if (data.uid !== myUid && MessengerUI.currentChat !== data.chatId) {
                                                    MessengerUI.handleIncomingMessage(data.uid);
                                                } else {
                                                    // Просто обновляем сортировку
                                                    MessengerUI.renderUsers(MessengerUI.usersCache);
                                                }
                                            }
                                        }
                                    }
                                });
                             });
                         } catch (e) { 
                             console.log("Global listener error:", e); 
                         }
                    }
                    
                    // 🔥 ПРОВЕРКА РЕФЕРАЛЬНОЙ ССЫЛКИ НА СРОК ГОДНОСТИ 🔥
                    const urlParams = new URLSearchParams(window.location.search);
                    const refRaw = urlParams.get('ref');

                    if (refRaw) {
                        setTimeout(() => {
                            // Разбираем ссылку: UID_ВРЕМЯ
                            const parts = refRaw.split('_');
                            const ts = parseInt(parts[1]); // Время создания ссылки
                            const now = Date.now();
                            const lifeTime = 12 * 60 * 60 * 1000; // 12 часов в миллисекундах

                            const m = document.getElementById('customModal');
                            const title = document.getElementById('modalTitle');
                            const text = document.getElementById('modalText');
                            const btns = document.getElementById('modalActions');
                            document.getElementById('modalInput').style.display = 'none';

                            // ПРОВЕРКА: Если времени нет или прошло больше 12 часов
                            if (!ts || (now - ts > lifeTime)) {
                                // ❌ ССЫЛКА ПРОСРОЧЕНА
                                if(window.SoundFX) SoundFX.error();
                                
                                title.textContent = "/// LINK EXPIRED ///";
                                title.style.color = "var(--alert-red)";
                                text.innerText = "THIS INVITATION SIGNAL HAS DISSIPATED.\nTHE REFERRAL CODE IS NO LONGER VALID.\n\nACCESS VIA THIS UPLINK DENIED.";
                                
                                btns.innerHTML = `<button class="btn-tech" style="width:100%; border-color:var(--alert-red); color:var(--alert-red);" onclick="window.CustomDialog.close()">CLOSE TERMINAL</button>`;
                            
                            } else {
                                // ✅ ВСЁ ОТЛИЧНО
                                if(window.SoundFX) {
                                    SoundFX.playTone(600, 'sine', 0.5);
                                    setTimeout(() => SoundFX.playTone(800, 'sine', 0.5), 200);
                                }
                                
                                title.textContent = "★ CONGRATULATIONS ★";
                                title.style.color = "var(--vox-cyan)";
                                text.innerText = "YOU HAVE BEEN INVITED TO VOXTEK ENTERPRISES.\nYOUR PRESENCE HAS BEEN LOGGED.\n\nPLEASE REGISTER TO CLAIM YOUR CITIZENSHIP.";
                                
                                btns.innerHTML = `
                                    <button class="btn-tech" style="width:100%" onclick="
                                        window.CustomDialog.close(); 
                                        Router.go('messenger'); 
                                        if(window.AuthSystem) AuthSystem.switchTab('register');
                                    ">CLAIM CITIZENSHIP</button>
                                `;
                            }
                            
                            m.classList.add('active');

                        }, 1500);
                    }

                    // 3. Запускаем Админские Алерты (красные окна)
                    if(window.AdminSystem) AdminSystem.listenForAlerts();
                    
                    console.log("VOXTEK SYSTEMS: FULLY SYNCHRONIZED");
                    
                } else {
                    // Если Firebase еще не готов, ждем 100мс и пробуем снова
                    console.log("System Loading...");
                    setTimeout(initVoxSystem, 100);
                }
            };

            // Запускаем процесс
            initVoxSystem();

        // --- 🖥️ MINI MATRIX EFFECT (ADMIN PANEL) ---
            const initMiniMatrix = () => {
                const container = document.getElementById('matrixContainer');
                const cvs = document.getElementById('miniMatrixCanvas');
                if(!container || !cvs) return;

                const ctx = cvs.getContext('2d');
                let columns = [];
                const fontSize = 10;
                
                // Функция сброса размеров (нужна при открытии панели)
                const resize = () => {
                    const rect = container.getBoundingClientRect();
                    if(rect.width > 0 && rect.height > 0) {
                        cvs.width = rect.width;
                        cvs.height = rect.height;
                        const cols = Math.floor(cvs.width / fontSize);
                        columns = Array(cols).fill(1);
                    }
                };

                // Рисование
                const draw = () => {
                    // Полупрозрачный черный фон для эффекта "шлейфа"
                    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                    ctx.fillRect(0, 0, cvs.width, cvs.height);

                    ctx.fillStyle = "#00f3ff"; // Твой любимый VOX CYAN
                    ctx.font = "bold " + fontSize + "px monospace";

                    for(let i = 0; i < columns.length; i++) {
                        // Случайный символ: 0 или 1
                        const text = Math.random() > 0.5 ? "1" : "0";
                        ctx.fillText(text, i * fontSize, columns[i] * fontSize);

                        // Случайный сброс капли наверх
                        if(columns[i] * fontSize > cvs.height && Math.random() > 0.95) {
                            columns[i] = 0;
                        }
                        columns[i]++;
                    }
                    requestAnimationFrame(draw);
                };

                // 🔥 ВАЖНО: Следим за появлением панели, чтобы запустить эффект вовремя
                const observer = new ResizeObserver(() => resize());
                observer.observe(container);

                draw();
            };

            // Запускаем
            setTimeout(initMiniMatrix, 500);
