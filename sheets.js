// Google Sheets API 相關變數
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx__OWRZbiN8XQywvrSdvFKg0fd_aBxRwXY1RzBMhwIXhoF3JFTq_6n2QkDoT27IpMSLA/exec";

// 發送願望到 Google Sheets
function sendWishToGoogleSheets(wish) {
  try {
    // 獲取當前時間
    const timestamp = new Date().toISOString();

    // 準備要發送的數據 - 恢復原始結構
    const data = {
      timestamp: timestamp,
      wish: wish,
    };

    console.log("正在發送願望到 Google Sheets:", data);

    // 使用 fetch API 發送數據
    return fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // 這是必要的，因為 Google Apps Script 不支持 CORS
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify(data),
    })
      .then((response) => {
        console.log("數據發送成功，響應狀態:", response.status);
        // 由於使用了 no-cors 模式，無法讀取響應內容
        console.log("注意：由於使用了 no-cors 模式，無法讀取詳細響應內容");

        // 嘗試直接訪問 Google Script URL 以檢查是否可訪問
        fetch(GOOGLE_SCRIPT_URL, { method: "GET", mode: "no-cors" })
          .then(() => console.log("Google Script URL 可以訪問"))
          .catch((error) =>
            console.error("無法訪問 Google Script URL:", error)
          );

        return response;
      })
      .catch((error) => {
        console.error("發送數據時出錯:", error);
        throw error;
      });
  } catch (error) {
    console.error("發送願望過程中發生異常:", error);
    // 如果發送失敗，使用模擬函數作為備份
    return mockSendWishToGoogleSheets(wish);
  }
}

// 以下是 Google Apps Script 代碼，需要部署為 Web 應用程序
/*
function doPost(e) {
  try {
    // 解析傳入的 JSON 數據
    const data = JSON.parse(e.postData.contents);
    
    // 打開 Google 試算表（需要替換為您的試算表 ID）
    const spreadsheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
    const sheet = spreadsheet.getSheetByName('Wishes') || spreadsheet.insertSheet('Wishes');
    
    // 如果是新表格，添加標題行
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['時間戳記', '願望']);
    }
    
    // 添加新行
    sheet.appendRow([data.timestamp, data.wish]);
    
    // 返回成功響應
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'success',
      'message': '願望已成功記錄'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // 返回錯誤響應
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return HtmlService.createHtmlOutput('這是一個用於接收生日願望的 API。請使用 POST 請求發送願望。');
}
*/

// 設置 Google Sheets API 的說明
document.addEventListener("DOMContentLoaded", () => {
  // 檢查是否已設置 Google Script URL
  if (
    GOOGLE_SCRIPT_URL.includes(
      "AKfycbx__OWRZbiN8XQywvrSdvFKg0fd_aBxRwXY1RzBMhwIXhoF3JFTq_6n2QkDoT27IpMSLA"
    )
  ) {
    console.warn("請替換 Google Script URL 為您的實際部署 URL");
  }
});

// 模擬發送願望（當 Google Sheets API 未設置時使用）
function mockSendWishToGoogleSheets(wish) {
  console.log("模擬發送願望到 Google Sheets:", wish);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("願望已模擬發送成功");
      resolve({ success: true });
    }, 500);
  });
}
