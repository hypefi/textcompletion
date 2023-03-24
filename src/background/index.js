console.info('chrome-ext template-vanilla-js background script')

// background.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getStorageData") {
    chrome.storage.local.get([request.key], function (result) {
      sendResponse({ data: result[request.key] });
    });
    return true;
  } else if (request.action === "setStorageData") {
    let data = {};
    data[request.key] = request.value;
    chrome.storage.local.set(data, function () {
      sendResponse({ success: true });
    });
    return true;
  }
});


export {}
