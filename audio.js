// 音頻相關變數
let audioContext;
let microphone;
let analyser;
let dataArray;
let microphoneActive = false;
let blowDetectionInterval;

// 麥克風敏感度設置
const BLOW_THRESHOLD = 50; // 吹氣檢測閾值 (降低閾值，使更小的聲音也能觸發)
const BLOW_DURATION = 400; // 持續吹氣時間（毫秒）(縮短時間，使蠟燭更快熄滅)
const VOLUME_MULTIPLIER = 8; // 音量顯示倍數 (增加倍數，使音量顯示更明顯)

// DOM 載入完成後執行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化麥克風按鈕事件
    document.getElementById('start-mic').addEventListener('click', toggleMicrophone);
});

// 切換麥克風
async function toggleMicrophone() {
    const startMicButton = document.getElementById('start-mic');
    
    if (!microphoneActive) {
        try {
            // 請求麥克風權限
            await initMicrophone();
            
            // 更新按鈕文字
            startMicButton.textContent = '停止監聽';
            startMicButton.classList.add('active');
            
            // 降低背景音樂音量至30%
            const bgMusic = document.getElementById('birthday-song');
            if (bgMusic) {
                bgMusic.volume = 0.3;
            }
            
            // 開始監聽吹氣
            startBlowDetection();
            
            microphoneActive = true;
        } catch (error) {
            console.error('無法訪問麥克風:', error);
            alert('無法訪問麥克風，請確保您已授予麥克風權限，並使用支援的瀏覽器（如 Chrome、Firefox 或 Edge）。');
        }
    } else {
        // 停止麥克風
        stopMicrophone();
        
        // 恢復背景音樂音量
        const bgMusic = document.getElementById('birthday-song');
        if (bgMusic) {
            bgMusic.volume = 1.0;
        }
        
        // 更新按鈕文字
        startMicButton.textContent = '開始吹蠟燭';
        startMicButton.classList.remove('active');
        
        microphoneActive = false;
    }
}

// 初始化麥克風
async function initMicrophone() {
    // 創建音頻上下文
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 獲取麥克風流
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // 創建麥克風源
    microphone = audioContext.createMediaStreamSource(stream);
    
    // 創建分析器
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    // 連接麥克風到分析器
    microphone.connect(analyser);
    
    // 創建數據數組
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

// 停止麥克風
function stopMicrophone() {
    if (blowDetectionInterval) {
        clearInterval(blowDetectionInterval);
        blowDetectionInterval = null;
    }
    
    if (microphone && microphone.mediaStream) {
        microphone.mediaStream.getTracks().forEach(track => track.stop());
    }
    
    if (audioContext) {
        audioContext.close();
    }
    
    // 重置音量顯示
    document.getElementById('volume-level').style.width = '0%';
}

// 開始吹氣檢測
function startBlowDetection() {
    let blowStartTime = null;
    let candleIndex = 0;
    const flames = document.querySelectorAll('.blow-flame');
    
    // 顯示調試信息
    console.log('開始吹蠟燭檢測，閾值：', BLOW_THRESHOLD, '持續時間：', BLOW_DURATION);
    
    blowDetectionInterval = setInterval(() => {
        // 獲取音頻數據
        analyser.getByteFrequencyData(dataArray);
        
        // 計算平均音量
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        // 顯示當前音量（調試用）
        console.log('當前音量：', average);
        
        // 更新音量顯示
        const volumeLevel = Math.min(average * VOLUME_MULTIPLIER, 100);
        document.getElementById('volume-level').style.width = volumeLevel + '%';
        
        // 檢測吹氣 - 使用更寬鬆的條件
        if (average > BLOW_THRESHOLD) {
            // 如果是第一次檢測到吹氣，記錄開始時間
            if (blowStartTime === null) {
                blowStartTime = Date.now();
                console.log('開始吹氣檢測');
            }
            
            // 計算吹氣持續時間
            const blowDuration = Date.now() - blowStartTime;
            console.log('吹氣持續時間：', blowDuration);
            
            // 根據吹氣持續時間縮小火焰 - 加快縮小速度
            const shrinkLevel = Math.min(blowDuration / BLOW_DURATION, 1);
            
            // 縮小當前蠟燭的火焰
            if (candleIndex < flames.length) {
                const flame = flames[candleIndex];
                
                if (shrinkLevel < 1) {
                    // 火焰縮小 - 增加縮小效果
                    flame.style.transform = `scale(${1 - shrinkLevel * 0.9})`;
                    flame.style.opacity = 1 - shrinkLevel * 0.9;
                } else {
                    // 火焰熄滅
                    flame.classList.add('extinguished');
                    console.log('蠟燭', candleIndex + 1, '已熄滅');
                    
                    // 顯示煙霧
                    const smokeId = flame.id.replace('flame', 'smoke');
                    document.getElementById(smokeId).classList.add('active');
                    
                    // 移動到下一個蠟燭
                    candleIndex++;
                    blowStartTime = null;
                    
                    // 檢查是否所有蠟燭都熄滅
                    if (candleIndex >= flames.length) {
                        // 所有蠟燭都熄滅了
                        console.log('所有蠟燭都已熄滅！');
                        setTimeout(() => {
                            stopMicrophone();
                            checkAllCandlesExtinguished();
                        }, 500);
                    }
                }
            }
        } else {
            // 如果停止吹氣但已經開始了吹氣檢測，不要立即重置
            // 給用戶一個短暫的緩衝時間繼續吹
            if (blowStartTime !== null) {
                const timeSinceLastBlow = Date.now() - blowStartTime;
                // 只有超過200毫秒沒有檢測到吹氣才重置
                if (timeSinceLastBlow > 200) {
                    console.log('停止吹氣，重置檢測');
                    blowStartTime = null;
                    
                    // 如果當前蠟燭還沒熄滅，恢復其大小
                    if (candleIndex < flames.length) {
                        const flame = flames[candleIndex];
                        if (!flame.classList.contains('extinguished')) {
                            flame.style.transform = '';
                            flame.style.opacity = '';
                        }
                    }
                }
            }
        }
    }, 100);
} 