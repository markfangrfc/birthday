// 全局變數
let currentSection = "countdown";
const wishes = []; // 用於顯示的願望列表
const allWishes = []; // 包含所有願望，包括界面上已"刪除"的
let countdownInterval;
let birthdaySong;
let shootingStarsInterval;
let starScore = 0;
let totalStars = 0;
let starSound;
let musicStarted = false;

// Flappy Bird 遊戲變量
let flappyGameActive = false;
let flappyScore = 0;
let flappyGravity = 0.0025; // 大幅降低重力效果 (再降低10倍)
let flappyVelocity = 0;
let flappyPosition = 40; // 設定初始位置在畫面中間偏上位置
let pipes = [];
let flappyAnimationFrame;
let pipeGenerationInterval;

// DOM 載入完成後執行
document.addEventListener("DOMContentLoaded", () => {
  // 初始化音樂
  birthdaySong = document.getElementById("birthday-song");

  // 初始化倒數計時
  startCountdown();

  // 按鈕事件監聽
  document.getElementById("next-button").addEventListener("click", () => {
    switchSection("cake-section", "wish-section");

    // 許願時播放音樂
    if (!musicStarted) {
      playBirthdaySong();
      musicStarted = true;
    }
  });

  document.getElementById("add-wish").addEventListener("click", addWish);

  document.getElementById("wish-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addWish();
    }
  });

  document
    .getElementById("blow-candles-button")
    .addEventListener("click", () => {
      switchSection("wish-section", "blow-section");

      // 進入吹蠟燭遊戲時立即將音量降至30%
      if (birthdaySong) {
        birthdaySong.volume = 0.3;
      }
    });

  document
    .getElementById("start-shooting-stars")
    .addEventListener("click", () => {
      switchSection("success-section", "shooting-stars-section");
      prepareShootingStarsGame();
    });

  // 確保開始遊戲按鈕正確綁定事件
  const startGameButton = document.getElementById("start-game-button");
  if (startGameButton) {
    startGameButton.addEventListener("click", startShootingStarsGame);
    console.log("開始遊戲按鈕已綁定事件");
  } else {
    console.error("找不到開始遊戲按鈕元素");
  }

  // 正確地初始化願望列表的刪除事件
  setupWishListEvents();

  // 初始化流星音效
  starSound = new Audio(
    "https://assets.mixkit.co/sfx/preview/mixkit-fairy-glitter-sweep-1826.mp3"
  );
  starSound.volume = 0.4;

  // 初始檢查 - 調試用
  console.log("DOM載入完成，初始化已執行");

  // 初始化 Flappy Bird 遊戲
  document
    .getElementById("start-flappy-button")
    .addEventListener("click", startFlappyGame);
});

// 設置願望列表的事件處理
function setupWishListEvents() {
  document.getElementById("wishes-list").addEventListener("click", (e) => {
    // 檢查是否點擊了刪除按鈕或其圖標
    if (
      e.target.classList.contains("delete-wish") ||
      (e.target.tagName === "I" &&
        e.target.parentElement.classList.contains("delete-wish"))
    ) {
      let target = e.target;
      // 如果點擊的是圖標，則獲取其父元素（即按鈕）
      if (e.target.tagName === "I") {
        target = e.target.parentElement;
      }

      const index = parseInt(target.dataset.index);
      console.log(`嘗試刪除願望，索引: ${index}`);
      deleteWish(index);
    }
  });

  console.log("願望列表刪除事件已設置");
}

// 開始倒數計時
function startCountdown() {
  let count = 3;
  const countdownElement = document.getElementById("countdown-number");

  countdownElement.textContent = count;

  countdownInterval = setInterval(() => {
    count--;

    if (count > 0) {
      countdownElement.textContent = count;
      // 重新觸發動畫
      countdownElement.style.animation = "none";
      void countdownElement.offsetWidth; // 觸發重繪
      countdownElement.style.animation = "countdownAnimation 1s ease-in-out";
    } else {
      clearInterval(countdownInterval);

      // 倒數結束，顯示蛋糕
      setTimeout(() => {
        switchSection("countdown", "cake-section");

        // 播放生日歌
        playBirthdaySong();

        // 創建煙火效果
        createFireworks();
      }, 1000);
    }
  }, 1500);
}

// 創建煙火效果
function createFireworks() {
  const cakeSection = document.getElementById("cake-section");
  const fireworksCount = 10; // 煙火數量

  // 在不同位置創建多個煙火
  for (let i = 0; i < fireworksCount; i++) {
    setTimeout(() => {
      // 根據視窗大小隨機位置
      const x =
        Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
      const y =
        Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.2;

      createSingleFirework(cakeSection, x, y);
    }, i * 300); // 每300毫秒發射一個煙火
  }
}

// 創建單個煙火
function createSingleFirework(container, x, y) {
  // 煙火中心點
  const firework = document.createElement("div");
  firework.classList.add("firework");
  firework.style.left = `${x}px`;
  firework.style.top = `${y}px`;

  // 隨機顏色
  const colors = [
    "#FF5252",
    "#FFEB3B",
    "#2196F3",
    "#4CAF50",
    "#9C27B0",
    "#FF9800",
    "#00BCD4",
    "#F44336",
    "#E91E63",
    "#3F51B5",
  ];

  // 創建煙火粒子
  const particleCount = 30;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("firework-particle");

    // 隨機角度和距離
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    // 設置CSS變量控制動畫終點
    particle.style.setProperty("--tx", `${tx}px`);
    particle.style.setProperty("--ty", `${ty}px`);

    // 隨機顏色
    const colorIndex = Math.floor(Math.random() * colors.length);
    particle.style.backgroundColor = colors[colorIndex];

    // 設置起始位置
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    // 添加到容器
    container.appendChild(particle);

    // 動畫結束後移除元素
    setTimeout(() => {
      particle.remove();
    }, 1200);
  }

  // 添加到容器
  container.appendChild(firework);

  // 煙火中心動畫結束後移除
  setTimeout(() => {
    firework.remove();
  }, 1000);
}

// 播放生日歌
function playBirthdaySong() {
  console.log("嘗試播放生日歌...");

  // 確保音樂從頭開始播放
  birthdaySong.currentTime = 0;

  // 添加載入事件監聽器
  birthdaySong.addEventListener(
    "canplaythrough",
    () => {
      console.log("音樂已加載完成，準備播放");
    },
    { once: true }
  );

  // 添加錯誤處理
  birthdaySong.addEventListener(
    "error",
    (e) => {
      console.error("音樂播放錯誤:", e);
      // 嘗試使用備用音源
      console.log("嘗試使用備用音源");
      birthdaySong.src =
        "https://assets.mixkit.co/music/preview/mixkit-happy-birthday-tune-1964.mp3";
      birthdaySong.load();
      birthdaySong.play().catch((error) => {
        console.error("備用音源播放失敗:", error);
      });
    },
    { once: true }
  );

  // 播放音樂
  const playPromise = birthdaySong.play();

  // 處理自動播放政策
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log("音樂開始播放成功!");
      })
      .catch((error) => {
        console.error("自動播放被阻止:", error);
        console.log("請點擊頁面以啟用音樂");

        // 添加點擊事件來播放音樂
        const clickToPlay = () => {
          birthdaySong
            .play()
            .then(() => {
              console.log("用戶交互後音樂開始播放");
            })
            .catch((e) => {
              console.error("用戶交互後音樂播放仍然失敗:", e);
            });
          document.removeEventListener("click", clickToPlay);
        };

        document.addEventListener("click", clickToPlay);
      });
  }
}

// 切換頁面區塊
function switchSection(fromSection, toSection) {
  console.log(`切換從 ${fromSection} 到 ${toSection}`);

  // 處理可能的字符串ID或DOM元素
  const fromElement =
    typeof fromSection === "string"
      ? document.getElementById(fromSection)
      : fromSection;

  const toElement =
    typeof toSection === "string"
      ? document.getElementById(toSection)
      : toSection;

  if (!fromElement || !toElement) {
    console.error("無法找到區塊元素:", !fromElement ? fromSection : toSection);
    return;
  }

  fromElement.classList.remove("active");
  toElement.classList.add("active");
  currentSection = toElement.id;

  console.log(`已切換到 ${currentSection}`);
}

// 添加願望
function addWish() {
  const wishInput = document.getElementById("wish-input");
  const wish = wishInput.value.trim();

  if (wish) {
    console.log("添加願望:", wish);
    wishes.push(wish);
    allWishes.push(wish); // 添加到所有願望列表
    updateWishList();

    // 清空輸入框
    wishInput.value = "";
    wishInput.focus();

    // 將願望發送到 Google Sheets
    console.log("正在調用 sendWishToGoogleSheets 函數...");
    sendWishToGoogleSheets(wish);
  }
}

// 刪除願望（只從界面中刪除，保留在總列表中）
function deleteWish(index) {
  console.log(`從界面中刪除願望，索引: ${index}`);
  if (index >= 0 && index < wishes.length) {
    // 只從顯示列表中移除，但保留在 allWishes 中
    wishes.splice(index, 1);
    updateWishList();
    console.log(
      `願望已從界面刪除，剩餘顯示願望數: ${wishes.length}，總願望數: ${allWishes.length}`
    );
  } else {
    console.error(`刪除願望失敗: 索引 ${index} 超出範圍`);
  }
}

// 更新願望列表
function updateWishList() {
  const wishList = document.getElementById("wishes-list");
  wishList.innerHTML = "";

  wishes.forEach((wish, index) => {
    const li = document.createElement("li");
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
  const finalWishList = document.getElementById("final-wishes-list");
  finalWishList.innerHTML = "";

  // 只使用當前顯示的願望列表
  wishes.forEach((wish) => {
    const li = document.createElement("li");
    li.textContent = wish;
    finalWishList.appendChild(li);
  });

  console.log(`最終願望列表已更新，顯示 ${wishes.length} 個願望`);
}

// 重置應用
function resetApp() {
  console.log("重置應用開始");

  // 停止音樂
  birthdaySong.pause();
  birthdaySong.currentTime = 0;
  musicStarted = false;

  // 重置願望
  wishes.length = 0;
  allWishes.length = 0; // 也清空所有願望列表
  updateWishList();

  // 清空流星
  clearShootingStars();

  // 重置所有區塊
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  // 重置流星遊戲界面
  document.getElementById("game-intro").style.display = "block";
  document.getElementById("game-play").style.display = "none";
  document.getElementById("game-complete").style.display = "none";

  // 重置蠟燭
  document.querySelectorAll(".blow-flame").forEach((flame) => {
    flame.classList.remove("shrink", "extinguished");
  });

  document.querySelectorAll(".smoke").forEach((smoke) => {
    smoke.classList.remove("active");
  });

  // 重新開始倒數
  document.getElementById("countdown").classList.add("active");
  document.getElementById("countdown-number").textContent = "3";
  startCountdown();

  // 取消 Flappy Bird 遊戲的循環和間隔
  clearInterval(pipeGenerationInterval);
  cancelAnimationFrame(flappyAnimationFrame);

  // 重置卡片狀態
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.classList.remove("flipped");
  });

  console.log("重置應用完成");
}

// 檢查所有蠟燭是否熄滅
function checkAllCandlesExtinguished() {
  const flames = document.querySelectorAll(".blow-flame");
  let allExtinguished = true;

  flames.forEach((flame) => {
    if (!flame.classList.contains("extinguished")) {
      allExtinguished = false;
    }
  });

  if (allExtinguished) {
    // 所有蠟燭都熄滅了，顯示煙霧並切換到成功頁面
    document.querySelectorAll(".smoke").forEach((smoke) => {
      smoke.classList.add("active");
    });

    setTimeout(() => {
      switchSection("blow-section", "success-section");
    }, 2000);
  }
}

// 準備流星遊戲
function prepareShootingStarsGame() {
  console.log("準備流星遊戲");

  // 重置分數
  starScore = 0;

  // 使用當前顯示的願望列表，而不是所有願望
  totalStars = wishes.length;

  // 注意：不再從 allWishes 恢復願望，只使用當前界面上顯示的願望
  console.log(`流星遊戲將僅使用當前顯示的 ${wishes.length} 個願望`);

  // 更新總共的願望數量
  document.getElementById("total-stars").textContent = totalStars;
  document.getElementById("total-stars-playing").textContent = totalStars;
  document.getElementById("score").textContent = 0;

  // 顯示遊戲介紹，隱藏遊戲畫面和完成畫面
  document.getElementById("game-intro").style.display = "block";
  document.getElementById("game-play").style.display = "none";
  document.getElementById("game-complete").style.display = "none";

  // 創建背景星星
  createBackgroundStars();

  console.log(`流星遊戲準備完成，共有 ${totalStars} 個願望`);
}

// 開始流星遊戲
function startShootingStarsGame() {
  console.log("開始流星遊戲");

  // 隱藏介紹，顯示遊戲畫面
  document.getElementById("game-intro").style.display = "none";
  document.getElementById("game-play").style.display = "block";

  // 清除之前的流星
  clearShootingStars();

  // 開始發射流星 - 只使用當前顯示的願望
  shootingStarsInterval = setInterval(() => {
    if (wishes.length > 0) {
      const randomIndex = Math.floor(Math.random() * wishes.length);
      const wish = wishes[randomIndex];
      createShootingStar(wish);
      console.log(`發射流星，願望: ${wish}`);
    } else {
      clearInterval(shootingStarsInterval);
      console.log("沒有更多願望，停止發射流星");

      // 如果沒有願望但遊戲已開始，直接顯示完成
      if (totalStars === 0) {
        setTimeout(() => {
          showGameCompleteMessage();
        }, 1000);
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
  const stars = document.querySelectorAll(".shooting-star");
  stars.forEach((star) => star.remove());
  console.log("清除所有流星");
}

function createBackgroundStars() {
  // 清除現有的背景星星
  const existingStars = document.querySelectorAll(".tiny-star");
  existingStars.forEach((star) => star.remove());

  // 創建新的背景星星
  const container = document.getElementById("shooting-stars-container");
  const starsCount = 100;

  for (let i = 0; i < starsCount; i++) {
    const star = document.createElement("div");
    star.classList.add("tiny-star");

    // 隨機位置
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;

    // 隨機大小
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    // 隨機閃爍
    star.style.animation = `starTwinkle ${
      Math.random() * 3 + 2
    }s infinite alternate`;

    container.appendChild(star);
  }
}

function createShootingStar(wish) {
  console.log(`創建流星，願望內容: ${wish}`);

  const container = document.getElementById("shooting-stars-container");
  const shootingStar = document.createElement("div");
  shootingStar.classList.add("shooting-star");

  // 創建流星的尾巴和頭部
  const starTail = document.createElement("div");
  starTail.classList.add("star-tail");

  const starHead = document.createElement("div");
  starHead.classList.add("star-head");

  // 添加願望文字
  const wishText = document.createElement("div");
  wishText.classList.add("star-wish");
  wishText.textContent = wish;

  // 添加閃光效果元素
  const sparkle = document.createElement("div");
  sparkle.classList.add("star-sparkle");

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
  shootingStar.addEventListener("click", () => {
    console.log(`流星被點擊，願望: ${wish}`);
    collectStar(shootingStar, wish);
  });

  // 設置流星動畫
  const duration = Math.random() * 3000 + 4000; // 4-7秒

  // 計算終點位置
  const endX = window.innerWidth + 150;
  const endY = startY + (endX - startX) * Math.tan((angle * Math.PI) / 180);

  console.log(
    `流星動畫：起點(${startX},${startY})，終點(${endX},${endY})，持續時間:${duration}ms`
  );

  // 開始動畫
  try {
    const animation = shootingStar.animate(
      [
        { left: `${startX}px`, top: `${startY}px` },
        { left: `${endX}px`, top: `${endY}px` },
      ],
      {
        duration: duration,
        easing: "linear",
        fill: "forwards",
      }
    );

    // 動畫結束後移除流星
    animation.onfinish = () => {
      shootingStar.remove();
      console.log("流星動畫結束，已移除");
    };
  } catch (error) {
    console.error("創建流星動畫時出錯:", error);

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
    animations.forEach((animation) => animation.cancel());
  } catch (error) {
    console.error("取消流星動畫時出錯:", error);
    // 對於不支援Web Animation API的瀏覽器，使用備用方法
    starElement.style.transition = "none";
  }

  // 播放收集動畫
  starElement.classList.add("star-collect-animation");

  // 播放閃光動畫
  const sparkle = starElement.querySelector(".star-sparkle");
  if (sparkle) {
    sparkle.classList.add("star-sparkle-animation");
  }

  // 播放音效
  if (starSound) {
    starSound.currentTime = 0;
    starSound.play().catch((error) => {
      console.error("播放收集音效失敗:", error);
    });
  }

  // 更新分數
  starScore++;
  updateScoreDisplay();
  console.log(`分數更新: ${starScore}/${totalStars}`);

  // 從願望列表中移除 - 只從當前顯示的願望中移除
  const wishIndex = wishes.indexOf(wish);
  if (wishIndex !== -1) {
    wishes.splice(wishIndex, 1);
    console.log(`願望已從遊戲列表中移除，剩餘願望數: ${wishes.length}`);
  }

  // 動畫結束後移除流星
  setTimeout(() => {
    starElement.remove();

    // 檢查遊戲是否結束
    if (starScore >= totalStars) {
      console.log("所有願望已收集，顯示完成訊息");
      setTimeout(showGameCompleteMessage, 1000);
    }
  }, 600);
}

function updateScoreDisplay() {
  document.getElementById("score").textContent = starScore;
}

function showGameCompleteMessage() {
  // 清除流星生成
  clearShootingStars();

  // 隱藏遊戲畫面，顯示完成畫面
  document.getElementById("game-play").style.display = "none";
  document.getElementById("game-complete").style.display = "block";

  // 創建特效
  createCelebrationEffect();

  // 移除現有按鈕以防重複添加
  const existingButton = document.getElementById("to-flappy-button");
  if (existingButton) {
    existingButton.remove();
  }

  // 添加導向 flappy bird 遊戲的按鈕
  const gameCompleteDiv = document.querySelector(".game-success-message");
  if (gameCompleteDiv) {
    const toFlappyButton = document.createElement("button");
    toFlappyButton.id = "to-flappy-button";
    toFlappyButton.className = "button";
    toFlappyButton.innerHTML =
      '前往祝福留言牆 <i class="fas fa-arrow-right"></i>';

    // 確保添加正確的事件監聽器
    toFlappyButton.onclick = function () {
      console.log("前往祝福留言牆按鈕被點擊");
      switchSection("shooting-stars-section", "flappy-section");
    };

    gameCompleteDiv.appendChild(toFlappyButton);
    console.log("已添加前往祝福留言牆按鈕");
  }
}

function createCelebrationEffect() {
  const container = document.getElementById("shooting-stars-container");
  const starsCount = 50;

  for (let i = 0; i < starsCount; i++) {
    setTimeout(() => {
      const star = document.createElement("div");
      star.classList.add("star-head");
      star.style.position = "absolute";
      star.style.top = "50%";
      star.style.left = "50%";
      star.style.width = "10px";
      star.style.height = "10px";

      container.appendChild(star);

      // 隨機方向擴散
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 300 + 100;
      const duration = Math.random() * 1500 + 1000;

      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;

      const animation = star.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.5)", opacity: 0 },
          {
            transform: "translate(-50%, -50%) scale(1.5)",
            opacity: 1,
            offset: 0.1,
          },
          {
            transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) scale(0.1)`,
            opacity: 0,
          },
        ],
        {
          duration: duration,
          easing: "ease-out",
          fill: "forwards",
        }
      );

      animation.onfinish = () => {
        star.remove();
      };
    }, i * 100);
  }
}

// 遊戲開始函數
function startFlappyGame() {
  console.log("開始Flappy Bird遊戲");
  document.getElementById("flappy-intro").style.display = "none";
  document.getElementById("flappy-game").style.display = "block";
  document.getElementById("flappy-complete").style.display = "none";

  const flappyCharacter = document.getElementById("flappy-character");
  const gameContainer = document.querySelector(".flappy-game-container");

  // 重置遊戲狀態
  flappyGameActive = true;
  flappyScore = 0;
  flappyVelocity = -0.1; // 給予非常輕微的向上初始速度，讓小鳥緩慢下降
  flappyPosition = 40; // 設定初始位置在畫面中間偏上位置
  pipes = [];
  updateFlappyScore();

  // 設定使用main.png作為遊戲主角
  flappyCharacter.style.backgroundImage = "url('main.png')";
  flappyCharacter.style.backgroundSize = "contain";
  flappyCharacter.style.backgroundRepeat = "no-repeat";
  flappyCharacter.style.backgroundColor = "transparent"; // 移除黃色背景
  // 移除原有的CSS陰影效果(眼睛和嘴巴)
  flappyCharacter.style.boxShadow = "none";

  // 確保小鳥可見且位於正確位置
  flappyCharacter.style.display = "block";
  flappyCharacter.style.top = flappyPosition + "%";
  flappyCharacter.style.transform = "translateY(-50%)";

  // 移除現有的管道
  const existingPipes = document.querySelectorAll(".pipe");
  existingPipes.forEach((pipe) => pipe.remove());

  // 移除現有的事件監聽器以避免重複
  document.removeEventListener("keydown", handleFlappyJump);
  document.removeEventListener("touchstart", handleFlappyJump);
  gameContainer.removeEventListener("click", handleFlappyJump);

  // 添加事件監聽器 - 確保點擊事件正確綁定
  document.addEventListener("keydown", handleFlappyJump);

  // 增加提示訊息
  console.log("綁定點擊和觸摸事件到遊戲容器");

  // 移動端觸摸事件
  gameContainer.addEventListener(
    "touchstart",
    function (event) {
      event.preventDefault(); // 阻止默認行為
      console.log("觸摸事件觸發");
      handleFlappyJump(event);
    },
    { passive: false }
  );

  // 滑鼠點擊事件
  gameContainer.addEventListener("click", function (event) {
    event.stopPropagation(); // 阻止事件冒泡
    console.log("點擊事件觸發");
    handleFlappyJump(event);
  });

  // 先清除之前的間隔計時器
  clearInterval(pipeGenerationInterval);

  // 延遲更長時間後再開始生成管道
  setTimeout(() => {
    if (flappyGameActive) {
      // 開始生成管道，增加時間間隔，降低難度
      pipeGenerationInterval = setInterval(generatePipe, 1500); // 縮短管道生成間隔，加快遊戲節奏
      generatePipe(); // 生成第一個管道
    }
  }, 2000); // 再延長初始等待時間

  // 開始遊戲循環
  cancelAnimationFrame(flappyAnimationFrame);
  flappyGameLoop();

  console.log("Flappy Bird遊戲已初始化");
}

// 遊戲循環
function flappyGameLoop() {
  if (!flappyGameActive) return;

  // 更新鳥的位置
  flappyVelocity += flappyGravity;
  flappyPosition += flappyVelocity;

  const flappyCharacter = document.getElementById("flappy-character");
  flappyCharacter.style.top = flappyPosition + "%";

  // 旋轉角度 - 根據速度調整角度，使用較小的旋轉效果
  const rotation = Math.min(Math.max(flappyVelocity * 15, -10), 30);
  flappyCharacter.style.transform = `translateY(-50%) rotate(${rotation}deg)`;

  // 檢查碰撞
  checkFlappyCollisions();

  // 移動和刪除管道
  movePipes();

  // 繼續遊戲循環
  flappyAnimationFrame = requestAnimationFrame(flappyGameLoop);
}

// 處理跳躍
function handleFlappyJump(event) {
  if (!flappyGameActive) return;

  // 避免冒泡和預設行為
  if (event.type === "click") {
    event.stopPropagation();
  }
  if (
    event.type === "touchstart" ||
    event.key === " " ||
    event.key === "ArrowUp"
  ) {
    event.preventDefault();
  }

  console.log("小鳥跳躍");

  // 跳躍 - 顯著降低跳躍力度，讓小鳥只跳約半個角色高度
  flappyVelocity = -0.25; // 大幅降低跳躍力度，從-2降到-0.5

  // 添加跳躍的視覺反饋
  const flappyCharacter = document.getElementById("flappy-character");
  flappyCharacter.classList.add("flappy-jump");

  // 短暫之後移除動畫類
  setTimeout(() => {
    flappyCharacter.classList.remove("flappy-jump");
  }, 300);
}

// 生成管道
function generatePipe() {
  if (!flappyGameActive) return;

  console.log("生成新管道");
  const gameContainer = document.querySelector(".flappy-game-container");
  const containerWidth = gameContainer.offsetWidth;

  // 隨機生成缺口位置
  const gap = 35; // 百分比 (增加缺口大小，使遊戲略微簡單一些)
  const gapPosition = Math.floor(Math.random() * (70 - 30) + 15); // 15% - 85%

  // 創建頂部管道
  const topPipe = document.createElement("div");
  topPipe.className = "pipe pipe-top";
  topPipe.style.height = `${gapPosition}%`;
  topPipe.style.right = "-80px"; // 確保從畫面外開始

  // 創建頂部管道頭部
  const topPipeHead = document.createElement("div");
  topPipeHead.className = "pipe-head";
  topPipe.appendChild(topPipeHead);

  // 創建底部管道
  const bottomPipe = document.createElement("div");
  bottomPipe.className = "pipe pipe-bottom";
  bottomPipe.style.height = `${100 - gapPosition - gap}%`;
  bottomPipe.style.right = "-80px"; // 確保從畫面外開始

  // 創建底部管道頭部
  const bottomPipeHead = document.createElement("div");
  bottomPipeHead.className = "pipe-head";
  bottomPipe.appendChild(bottomPipeHead);

  // 將管道添加到遊戲區域
  gameContainer.appendChild(topPipe);
  gameContainer.appendChild(bottomPipe);

  // 將管道添加到陣列中
  pipes.push({
    top: topPipe,
    bottom: bottomPipe,
    passed: false,
  });

  console.log("新管道已生成");
}

// 移動管道
function movePipes() {
  // 遍歷所有管道
  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];

    // 獲取目前位置
    const topPipeRect = pipe.top.getBoundingClientRect();
    let currentRight = parseInt(pipe.top.style.right || "0");

    // 確保currentRight是有效數字
    if (isNaN(currentRight)) currentRight = 0;

    // 移動管道
    const newRight = currentRight + 2; // 增加速度為2px
    pipe.top.style.right = newRight + "px";
    pipe.bottom.style.right = newRight + "px";

    // 檢查是否通過了鳥兒（中心點）
    const flappyCharacter = document.getElementById("flappy-character");
    const flappyRect = flappyCharacter.getBoundingClientRect();
    const gameContainer = document.querySelector(".flappy-game-container");
    const containerRect = gameContainer.getBoundingClientRect();

    // 計算管道在畫面上的實際位置
    const pipeLeft = containerRect.right - topPipeRect.width - newRight;
    const flappyCenterX = flappyRect.left + flappyRect.width / 2;

    if (!pipe.passed && pipeLeft < flappyCenterX) {
      pipe.passed = true;
      flappyScore++;
      updateFlappyScore();
      console.log("通過管道，得分：", flappyScore);

      // 檢查是否達到勝利條件
      if (flappyScore >= 10) {
        // 達到10分通關
        endFlappyGame(true);
      } else {
        // 更新得分時顯示剩餘分數提示
        showScoreNotification(flappyScore);
      }
    }

    // 移除超出屏幕的管道
    if (newRight > containerRect.width + 100) {
      // 確保完全超出畫面
      pipe.top.remove();
      pipe.bottom.remove();
      pipes.splice(i, 1);
      console.log("移除超出畫面的管道");
    }
  }
}

// 檢查碰撞
function checkFlappyCollisions() {
  if (!flappyGameActive) return;

  const flappyCharacter = document.getElementById("flappy-character");
  const flappyRect = flappyCharacter.getBoundingClientRect();
  const gameContainer = document.querySelector(".flappy-game-container");
  const containerRect = gameContainer.getBoundingClientRect();

  // 計算實際的遊戲區域邊界（考慮地面高度）
  const groundHeight = containerRect.height * 0.1; // 地面高度為10%
  const topLimit = containerRect.top + 20; // 增加頂部邊界容忍度
  const bottomLimit = containerRect.bottom - groundHeight - 10; // 增加底部邊界容忍度

  // 檢查是否碰到上下邊界
  if (flappyRect.top <= topLimit || flappyRect.bottom >= bottomLimit) {
    console.log("撞到上下邊界", {
      birdTop: flappyRect.top,
      topLimit: topLimit,
      birdBottom: flappyRect.bottom,
      bottomLimit: bottomLimit,
    });
    endFlappyGame(false);
    return;
  }

  // 檢查是否碰到管道 - 使用更寬鬆的碰撞檢測
  for (const pipe of pipes) {
    const topPipeRect = pipe.top.getBoundingClientRect();
    const bottomPipeRect = pipe.bottom.getBoundingClientRect();

    // 獲取管道的實際位置
    const currentRight = parseInt(pipe.top.style.right || "0");
    if (isNaN(currentRight)) continue;

    const pipeLeft = containerRect.right - topPipeRect.width - currentRight;
    const pipeRight = pipeLeft + topPipeRect.width;

    // 碰撞檢測 - 給小鳥更多"寬容度"
    const horizontalOverlap =
      flappyRect.right - 20 > pipeLeft && flappyRect.left + 20 < pipeRight;

    if (horizontalOverlap) {
      // 檢查垂直方向是否有碰撞，給予更寬鬆的判定
      const hitTopPipe = flappyRect.top + 15 < topPipeRect.bottom - 5;
      const hitBottomPipe = flappyRect.bottom - 15 > bottomPipeRect.top + 5;

      if (hitTopPipe || hitBottomPipe) {
        console.log("撞到管道", {
          hitTop: hitTopPipe,
          hitBottom: hitBottomPipe,
          birdTop: flappyRect.top,
          pipeBottom: topPipeRect.bottom,
          birdBottom: flappyRect.bottom,
          pipeTop: bottomPipeRect.top,
        });
        endFlappyGame(false);
        return;
      }
    }
  }
}

// 更新分數
function updateFlappyScore() {
  const scoreElement = document.querySelector("#flappy-score span");
  scoreElement.textContent = flappyScore;
}

// 結束遊戲
function endFlappyGame(success) {
  console.log("結束遊戲，成功:", success);

  // 防止重複調用
  if (!flappyGameActive) return;

  flappyGameActive = false;
  clearInterval(pipeGenerationInterval);
  cancelAnimationFrame(flappyAnimationFrame);

  // 添加視覺反饋
  const flappyCharacter = document.getElementById("flappy-character");

  if (success) {
    // 成功動畫
    flappyCharacter.classList.add("flappy-success");
  } else {
    // 失敗動畫
    flappyCharacter.classList.add("flappy-crash");
  }

  // 移除事件監聽器
  document.removeEventListener("keydown", handleFlappyJump);
  document.removeEventListener("touchstart", handleFlappyJump);
  const gameContainer = document.querySelector(".flappy-game-container");
  if (gameContainer) {
    gameContainer.removeEventListener("click", handleFlappyJump);
  }

  if (success) {
    // 顯示成功訊息
    setTimeout(() => {
      document.getElementById("flappy-game").style.display = "none";
      document.getElementById("flappy-complete").style.display = "block";

      // 增加前往卡片的按鈕
      setTimeout(() => {
        console.log("切換到卡片區塊");
        switchSection(
          document.getElementById("flappy-section"),
          document.getElementById("cards-section")
        );
      }, 3000);
    }, 1000);
  } else {
    // 重置遊戲 - 延遲時間增加到2秒，給玩家更多時間看到結果
    console.log("遊戲失敗，準備重置");
    setTimeout(() => {
      flappyCharacter.classList.remove("flappy-crash");
      document.getElementById("flappy-intro").style.display = "block";
      document.getElementById("flappy-game").style.display = "none";
    }, 2000);
  }
}

// 卡片相關功能
document.addEventListener("DOMContentLoaded", function () {
  // 初始化卡片點擊事件
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("click", function () {
      this.classList.toggle("flipped");
    });
  });

  // 重新開始按鈕
  document
    .getElementById("restart-all-button")
    .addEventListener("click", function () {
      resetApp();
    });
});

// 顯示得分通知
function showScoreNotification(score) {
  const gameContainer = document.querySelector(".flappy-game-container");

  // 創建通知元素
  const notification = document.createElement("div");
  notification.className = "score-notification";

  // 計算剩餘分數
  const remaining = 10 - score;

  // 設置通知內容
  notification.textContent = `+1分! 還需${remaining}分通關`;

  // 添加到遊戲容器
  gameContainer.appendChild(notification);

  // 設置動畫
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // 動畫結束後移除
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 1500);
}
