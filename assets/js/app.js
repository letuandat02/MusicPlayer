/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repead when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click 
 * 
 * fix: random hạn chế phát lại 1 bài trong 1 vòng (tạo ra 1 mảng chứa các bài hát đã phát )
 *      xử lý active
 *      xử lý into view
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const heading = $('h2');
const cdThumb = $('.cd .cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const togglePlay = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const btnPrev = $('.btn-prev');
const btnNext = $('.btn-next');
const btnRandom = $('.btn-random');
const btnRepeat = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config:JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Hẹn một mai',
            singer: 'Bùi Anh Tuấn',
            path: './assets/music/henmotmai.mp3',
            image: './assets/img/henmotmai.jpg'
        },
        {
            name: 'Lạc',
            singer: 'Rhymastic',
            path: './assets/music/lac.mp3',
            image: './assets/img/lac.jpg'
        },
        {
            name: 'Lặng yên',
            singer: 'Bùi Anh Tuấn',
            path: './assets/music/langyen.mp3',
            image: './assets/img/langyen.jpg'
        },
        {
            name: 'Nhắm mắt thấy mùa hè',
            singer: 'Bùi Anh Tuấn',
            path: './assets/music/nhammatthaymuahe.mp3',
            image: './assets/img/nhammatthaymuahe.jpg'
        },
        {
            name: 'Túy âm',
            singer: 'Masew & Xesi',
            path: './assets/music/tuyam.mp3',
            image: './assets/img/tuyam.jpg'
        },
        {
            name: 'Vài lần đón đưa',
            singer: 'Soobin Hoàng Sơn',
            path: './assets/music/vailandondua.mp3',
            image: './assets/img/vailandondua.jpg'
        },
        {
            name: 'Vạn sự tùy duyên',
            singer: 'Thanh Hưng',
            path: './assets/music/vansutuyduyen.mp3',
            image: './assets/img/vansutuyduyen.jpg'
        },
        {
            name: 'Yêu 5',
            singer: 'Rhymastic',
            path: './assets/music/yeu5.mp3',
            image: './assets/img/yeu5.jpg'
        },
    ],
    setConfig: function(key, value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${ index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`;
        });
        playlist.innerHTML = htmls.join('');
    },
    handleEvents: function() {
        // xử lý phóng to thu nhỏ cd
        const _this = this;
        const cdWidth = cd.offsetWidth;
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // xử lý next
        btnNext.onclick = function(){
            if(_this.isRandom){
                _this.randomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render()
            _this.scrollToActiveSong()
        }

        // xử lý prev
        btnPrev.onclick = function(){
            if(_this.isRandom){
                _this.randomSong();
            }else{
                _this.prevSong();
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // xử lý nut random
        btnRandom.onclick = function(){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom)
            btnRandom.classList.toggle('active',_this.isRandom)
        }

        // xử lý cd quay
        const cdThumbAnimate = cdThumb.animate([{transform: 'rotate(360deg)'}],
            {
                duration:10000,
                iterations:Infinity
            }
        )
        cdThumbAnimate.pause();

        // Xử lý nút play
        togglePlay.onclick = function() {
            if(_this.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        }
        
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause()
        }
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play()
        }
        
        progress.oninput = function(){
            audio.currentTime = progress.value /100 * audio.duration;
        }

        audio.ontimeupdate = function() {
            if(audio.duration){
                const progressPersent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPersent;
            }
        }
        // xử lý khi nhấn repeat
        btnRepeat.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            btnRepeat.classList.toggle('active', _this.isRepeat);
        }
         // xử lý next khi kết thúc bài hát
         audio.onended = function() {
            if(_this.isRepeat){
                audio.play()
            }else{
                btnNext.click()
            }
        }
        // lắng nghe hành vi click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option')
            if(songNode || optionNode){
                // xử lý click vào song
                if(songNode){
                    const songIndex = songNode.dataset.index
                    _this.currentIndex = Number(songIndex) 
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                // xử lý khi click vào option
                if(e.target.closest('.option')){
                    console.log('handle option')
                }
            }
        }
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function(){
        console.log(this.config.isRandom,this.config.isRepeat)
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function(){
        let songs = $$('.song')
        songs[this.currentIndex].classList.remove('active')
        this.currentIndex ++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        songs[this.currentIndex].classList.add('active')
        this.loadCurrentSong();
    },
    prevSong: function() {
        let songs = $$('.song')
        songs[this.currentIndex].classList.remove('active')
        this.currentIndex --
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length -1
        }
        songs[this.currentIndex].classList.add('active')
        this.loadCurrentSong();
    },
    randomSong: function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 500)
        $('.song.active')
    },
    start: function() {
        // Gán cấu hình config từ ứng dụng
        this.loadConfig();

        //Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM Events)
        this.handleEvents();

        // Load bài hát đầu tiên vào UI khi load vào ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // set trạng thái nút repeat và random
        btnRepeat.classList.toggle('active',this.isRepeat);
        btnRandom.classList.toggle('active', this.isRandom);

    }
}

app.start();