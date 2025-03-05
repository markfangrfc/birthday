// 全局變數
let currentSection = 'countdown';
const wishes = [];
let countdownInterval;
let birthdaySong;

// DOM 載入完成後執行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化音樂
    birthdaySong = document.getElementById('birthday-song');
    
    // 初始化倒數計時
    startCountdown();
    
    // 按鈕事件監聽
    document.getElementById('next-button').addEventListener('click', () => {
        switchSection('cake-section', 'wish-section');
    });
    
    document.getElementById('add-wish').addEventListener('click', addWish);
    
    document.getElementById('wish-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addWish();
        }
    });
    
    document.getElementById('blow-candles-button').addEventListener('click', () => {
        switchSection('wish-section', 'blow-section');
    });
    
    document.getElementById('restart-button').addEventListener('click', () => {
        resetApp();
    });
    
    // 初始化願望列表事件
    document.getElementById('wishes-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-wish')) {
            const index = parseInt(e.target.dataset.index);
            deleteWish(index);
        }
    });
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
    // 確保音樂從頭開始播放
    birthdaySong.currentTime = 0;
    
    // 播放音樂
    const playPromise = birthdaySong.play();
    
    // 處理自動播放政策
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log('自動播放被阻止，請點擊頁面以啟用音樂');
            
            // 添加點擊事件來播放音樂
            const clickToPlay = () => {
                birthdaySong.play();
                document.removeEventListener('click', clickToPlay);
            };
            
            document.addEventListener('click', clickToPlay);
        });
    }
}

// 切換頁面區塊
function switchSection(fromSection, toSection) {
    document.getElementById(fromSection).classList.remove('active');
    document.getElementById(toSection).classList.add('active');
    currentSection = toSection;
}

// 添加願望
function addWish() {
    const wishInput = document.getElementById('wish-input');
    const wish = wishInput.value.trim();
    
    if (wish) {
        wishes.push(wish);
        updateWishList();
        
        // 清空輸入框
        wishInput.value = '';
        wishInput.focus();
        
        // 將願望發送到 Google Sheets
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
    // 停止音樂
    birthdaySong.pause();
    birthdaySong.currentTime = 0;
    
    // 重置願望
    wishes.length = 0;
    updateWishList();
    
    // 重置所有區塊
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
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