// 全局變數
let currentSection = 'countdown';
const wishes = [];
let countdownInterval;
let birthdaySong;
let shootingStarsInterval;
let starScore = 0;
let totalStars = 0;
let starSound;
let musicStarted = false;

// DOM 載入完成後執行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化音樂
    birthdaySong = document.getElementById('birthday-song');
    
    // 初始化倒數計時
    startCountdown();
    
    // 按鈕事件監聽
    document.getElementById('next-button').addEventListener('click', () => {
        switchSection('cake-section', 'wish-section');
        
        // 許願時播放音樂
        if (!musicStarted) {
            playBirthdaySong();
            musicStarted = true;
        }
    });
    
    document.getElementById('add-wish').addEventListener('click', addWish);
    
    document.getElementById('wish-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addWish();
        }
    });
    
    document.getElementById('blow-candles-button').addEventListener('click', () => {
        switchSection('wish-section', 'blow-section');
        
        // 進入吹蠟燭遊戲時立即將音量降至30%
        if (birthdaySong) {
            birthdaySong.volume = 0.3;
        }
    });
    
    document.getElementById('start-shooting-stars').addEventListener('click', () => {
        switchSection('success-section', 'shooting-stars-section');
        prepareShootingStarsGame();
    });
    
    // 確保開始遊戲按鈕正確綁定事件
    const startGameButton = document.getElementById('start-game-button');
    if (startGameButton) {
        startGameButton.addEventListener('click', startShootingStarsGame);
        console.log('開始遊戲按鈕已綁定事件');
    } else {
        console.error('找不到開始遊戲按鈕元素');
    }
    
    document.getElementById('restart-button').addEventListener('click', () => {
        console.log('重新開始按鈕被點擊');
        resetApp();
    });
    
    // 初始化願望列表事件
    document.getElementById('wishes-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-wish')) {
            const index = parseInt(e.target.dataset.index);
            deleteWish(index);
        }
    });
    
    // 初始化流星音效
    starSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fairy-glitter-sweep-1826.mp3');
    starSound.volume = 0.4;
    
    // 初始檢查 - 調試用
    console.log('DOM載入完成，初始化已執行');
});

// 開始倒數計時
function startCountdown() {
    let count = 3;
    const countdownElement = document.getElementById('countdown-number');
    
    countdownElement.textContent = count;
    
    countdownInterval = setInterval(() => {
        count--;
        
        if (count > 0) {
            countdownElement.textContent = count;
            // 重新觸發動畫
            countdownElement.style.animation = 'none';
            void countdownElement.offsetWidth; // 觸發重繪
            countdownElement.style.animation = 'countdownAnimation 1s ease-in-out';
        } else {
            clearInterval(countdownInterval);
            
            // 倒數結束，顯示蛋糕
            setTimeout(() => {
                switchSection('countdown', 'cake-section');
                
                // 播放生日歌
                playBirthdaySong();
            }, 1000);
        }
    }, 1500);
}

// 播放生日歌
function playBirthdaySong() {
    console.log('嘗試播放生日歌...');
    
    // 確保音樂從頭開始播放
    birthdaySong.currentTime = 0;
    
    // 添加載入事件監聽器
    birthdaySong.addEventListener('canplaythrough', () => {
        console.log('音樂已加載完成，準備播放');
    }, { once: true });
    
    // 添加錯誤處理
    birthdaySong.addEventListener('error', (e) => {
        console.error('音樂播放錯誤:', e);
        // 嘗試使用備用音源
        console.log('嘗試使用備用音源');
        birthdaySong.src = 'https://assets.mixkit.co/music/preview/mixkit-happy-birthday-tune-1964.mp3';
        birthdaySong.load();
        birthdaySong.play().catch(error => {
            console.error('備用音源播放失敗:', error);
        });
    }, { once: true });
    
    // 播放音樂
    const playPromise = birthdaySong.play();
    
    // 處理自動播放政策
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('音樂開始播放成功!');
        }).catch(error => {
            console.error('自動播放被阻止:', error);
            console.log('請點擊頁面以啟用音樂');
            
            // 添加點擊事件來播放音樂
            const clickToPlay = () => {
                birthdaySong.play().then(() => {
                    console.log('用戶交互後音樂開始播放');
                }).catch(e => {
                    console.error('用戶交互後音樂播放仍然失敗:', e);
                });
                document.removeEventListener('click', clickToPlay);
            };
            
            document.addEventListener('click', clickToPlay);
        });
    }
}

// 切換頁面區塊
function switchSection(fromSection, toSection) {
    console.log(`切換從 ${fromSection} 到 ${toSection}`);
    document.getElementById(fromSection).classList.remove('active');
    document.getElementById(toSection).classList.add('active');
    currentSection = toSection;
}

// 添加願望
function addWish() {
    const wishInput = document.getElementById('wish-input');
    const wish = wishInput.value.trim();
    
    if (wish) {
        console.log('添加願望:', wish);
        wishes.push(wish);
        updateWishList();
        
        // 清空輸入框
        wishInput.value = '';
        wishInput.focus();
        
        // 將願望發送到 Google Sheets
        console.log('正在調用 sendWishToGoogleSheets 函數...');
        sendWishToGoogleSheets(wish);
    }
}

// 刪除願望
function deleteWish(index) {
    wishes.splice(index, 1);
    updateWishList();
}

// 更新願望列表
function updateWishList() {
    const wishList = document.getElementById('wishes-list');
    wishList.innerHTML = '';
    
    wishes.forEach((wish, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${wish}
            <button class="delete-wish" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        wishList.appendChild(li);
    });
    
    // 同時更新最終願望列表
    updateFinalWishList();
}

// 更新最終願望列表
function updateFinalWishList() {
    const finalWishList = document.getElementById('final-wishes-list');
    finalWishList.innerHTML = '';
    
    wishes.forEach(wish => {
        const li = document.createElement('li');
        li.textContent = wish;
        finalWishList.appendChild(li);
    });
}

// 重置應用
function resetApp() {
    console.log('重置應用開始');
    
    // 停止音樂
    birthdaySong.pause();
    birthdaySong.currentTime = 0;
    musicStarted = false;
    
    // 重置願望
    wishes.length = 0;
    updateWishList();
    
    // 清空流星
    clearShootingStars();
    
    // 重置所有區塊
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 重置流星遊戲界面
    document.getElementById('game-intro').style.display = 'block';
    document.getElementById('game-play').style.display = 'none';
    document.getElementById('game-complete').style.display = 'none';
    
    // 重置蠟燭
    document.querySelectorAll('.blow-flame').forEach(flame => {
        flame.classList.remove('shrink', 'extinguished');
    });
    
    document.querySelectorAll('.smoke').forEach(smoke => {
        smoke.classList.remove('active');
    });
    
    // 重新開始倒數
    document.getElementById('countdown').classList.add('active');
    document.getElementById('countdown-number').textContent = '3';
    startCountdown();
    
    console.log('重置應用完成');
}

// 檢查所有蠟燭是否熄滅
function checkAllCandlesExtinguished() {
    const flames = document.querySelectorAll('.blow-flame');
    let allExtinguished = true;
    
    flames.forEach(flame => {
        if (!flame.classList.contains('extinguished')) {
            allExtinguished = false;
        }
    });
    
    if (allExtinguished) {
        // 所有蠟燭都熄滅了，顯示煙霧並切換到成功頁面
        document.querySelectorAll('.smoke').forEach(smoke => {
            smoke.classList.add('active');
        });
        
        setTimeout(() => {
            switchSection('blow-section', 'success-section');
        }, 2000);
    }
}

// 準備流星遊戲
function prepareShootingStarsGame() {
    console.log('準備流星遊戲');
    
    // 重置分數
    starScore = 0;
    totalStars = wishes.length;
    
    // 更新總共的願望數量
    document.getElementById('total-stars').textContent = totalStars;
    document.getElementById('total-stars-playing').textContent = totalStars;
    document.getElementById('score').textContent = 0;
    
    // 顯示遊戲介紹，隱藏遊戲畫面和完成畫面
    document.getElementById('game-intro').style.display = 'block';
    document.getElementById('game-play').style.display = 'none';
    document.getElementById('game-complete').style.display = 'none';
    
    // 創建背景星星
    createBackgroundStars();
    
    console.log(`流星遊戲準備完成，共有 ${totalStars} 個願望`);
}

// 開始流星遊戲
function startShootingStarsGame() {
    console.log('開始流星遊戲');
    
    // 隱藏介紹，顯示遊戲畫面
    document.getElementById('game-intro').style.display = 'none';
    document.getElementById('game-play').style.display = 'block';
    
    // 清除之前的流星
    clearShootingStars();
    
    // 開始發射流星
    shootingStarsInterval = setInterval(() => {
        if (wishes.length > 0) {
            const randomIndex = Math.floor(Math.random() * wishes.length);
            const wish = wishes[randomIndex];
            createShootingStar(wish);
            console.log(`發射流星，願望: ${wish}`);
        } else {
            clearInterval(shootingStarsInterval);
            console.log('沒有更多願望，停止發射流星');
            
            // 如果沒有願望但遊戲已開始，直接顯示完成
            if (starScore >= totalStars && totalStars > 0) {
                setTimeout(showGameCompleteMessage, 1000);
            }
        }
    }, 2000); // 每2秒發射一顆流星
}

function clearShootingStars() {
    // 清除定時器
    if (shootingStarsInterval) {
        clearInterval(shootingStarsInterval);
        shootingStarsInterval = null;
    }
    
    // 清除所有流星元素
    const stars = document.querySelectorAll('.shooting-star');
    stars.forEach(star => star.remove());
    console.log('清除所有流星');
}

function createBackgroundStars() {
    // 清除現有的背景星星
    const existingStars = document.querySelectorAll('.tiny-star');
    existingStars.forEach(star => star.remove());
    
    // 創建新的背景星星
    const container = document.getElementById('shooting-stars-container');
    const starsCount = 100;
    
    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.classList.add('tiny-star');
        
        // 隨機位置
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        
        // 隨機大小
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // 隨機閃爍
        star.style.animation = `starTwinkle ${Math.random() * 3 + 2}s infinite alternate`;
        
        container.appendChild(star);
    }
}

function createShootingStar(wish) {
    console.log(`創建流星，願望內容: ${wish}`);
    
    const container = document.getElementById('shooting-stars-container');
    const shootingStar = document.createElement('div');
    shootingStar.classList.add('shooting-star');
    
    // 創建流星的尾巴和頭部
    const starTail = document.createElement('div');
    starTail.classList.add('star-tail');
    
    const starHead = document.createElement('div');
    starHead.classList.add('star-head');
    
    // 添加願望文字
    const wishText = document.createElement('div');
    wishText.classList.add('star-wish');
    wishText.textContent = wish;
    
    // 添加閃光效果元素
    const sparkle = document.createElement('div');
    sparkle.classList.add('star-sparkle');
    
    // 組合流星元素
    shootingStar.appendChild(starTail);
    shootingStar.appendChild(starHead);
    shootingStar.appendChild(wishText);
    shootingStar.appendChild(sparkle);
    
    // 設置隨機起始位置和角度
    const startX = -150; // 從畫面左側開始
    const startY = Math.random() * window.innerHeight * 0.7;
    const angle = Math.random() * 20 - 10; // -10度到10度的隨機角度
    
    shootingStar.style.left = `${startX}px`;
    shootingStar.style.top = `${startY}px`;
    shootingStar.style.transform = `rotate(${angle}deg)`;
    
    // 添加到容器
    container.appendChild(shootingStar);
    
    // 設置點擊事件
    shootingStar.addEventListener('click', () => {
        console.log(`流星被點擊，願望: ${wish}`);
        collectStar(shootingStar, wish);
    });
    
    // 設置流星動畫
    const duration = Math.random() * 3000 + 4000; // 4-7秒
    
    // 計算終點位置
    const endX = window.innerWidth + 150;
    const endY = startY + (endX - startX) * Math.tan(angle * Math.PI / 180);
    
    console.log(`流星動畫：起點(${startX},${startY})，終點(${endX},${endY})，持續時間:${duration}ms`);
    
    // 開始動畫
    try {
        const animation = shootingStar.animate([
            { left: `${startX}px`, top: `${startY}px` },
            { left: `${endX}px`, top: `${endY}px` }
        ], {
            duration: duration,
            easing: 'linear',
            fill: 'forwards'
        });
        
        // 動畫結束後移除流星
        animation.onfinish = () => {
            shootingStar.remove();
            console.log('流星動畫結束，已移除');
        };
    } catch (error) {
        console.error('創建流星動畫時出錯:', error);
        
        // 備用方案：如果animate API失敗，使用CSS過渡
        shootingStar.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
        setTimeout(() => {
            shootingStar.style.left = `${endX}px`;
            shootingStar.style.top = `${endY}px`;
        }, 10);
        
        // 到達終點後移除
        setTimeout(() => {
            shootingStar.remove();
        }, duration + 100);
    }
}

function collectStar(starElement, wish) {
    console.log(`收集流星，願望: ${wish}`);
    
    // 停止移動動畫
    try {
        const animations = starElement.getAnimations();
        animations.forEach(animation => animation.cancel());
    } catch (error) {
        console.error('取消流星動畫時出錯:', error);
        // 對於不支援Web Animation API的瀏覽器，使用備用方法
        starElement.style.transition = 'none';
    }
    
    // 播放收集動畫
    starElement.classList.add('star-collect-animation');
    
    // 播放閃光動畫
    const sparkle = starElement.querySelector('.star-sparkle');
    if (sparkle) {
        sparkle.classList.add('star-sparkle-animation');
    }
    
    // 播放音效
    if (starSound) {
        starSound.currentTime = 0;
        starSound.play().catch(error => {
            console.error('播放收集音效失敗:', error);
        });
    }
    
    // 更新分數
    starScore++;
    updateScoreDisplay();
    console.log(`分數更新: ${starScore}/${totalStars}`);
    
    // 從願望列表中移除
    const wishIndex = wishes.indexOf(wish);
    if (wishIndex !== -1) {
        wishes.splice(wishIndex, 1);
        console.log(`願望已從列表中移除，剩餘願望數: ${wishes.length}`);
    }
    
    // 動畫結束後移除流星
    setTimeout(() => {
        starElement.remove();
        
        // 檢查遊戲是否結束
        if (starScore >= totalStars) {
            console.log('所有願望已收集，顯示完成訊息');
            setTimeout(showGameCompleteMessage, 1000);
        }
    }, 600);
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = starScore;
}

function showGameCompleteMessage() {
    // 清除流星生成
    clearShootingStars();
    
    // 隱藏遊戲畫面，顯示完成畫面
    document.getElementById('game-play').style.display = 'none';
    document.getElementById('game-complete').style.display = 'block';
    
    // 創建特效
    createCelebrationEffect();
}

function createCelebrationEffect() {
    const container = document.getElementById('shooting-stars-container');
    const starsCount = 50;
    
    for (let i = 0; i < starsCount; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.classList.add('star-head');
            star.style.position = 'absolute';
            star.style.top = '50%';
            star.style.left = '50%';
            star.style.width = '10px';
            star.style.height = '10px';
            
            container.appendChild(star);
            
            // 隨機方向擴散
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 300 + 100;
            const duration = Math.random() * 1500 + 1000;
            
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            const animation = star.animate([
                { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
                { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 1, offset: 0.1 },
                { transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) scale(0.1)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'ease-out',
                fill: 'forwards'
            });
            
            animation.onfinish = () => {
                star.remove();
            };
        }, i * 100);
    }
} 