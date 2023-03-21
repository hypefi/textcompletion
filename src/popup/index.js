import './index.css'

const crx = 'textcompletion'

// Function to prompt the user for an API key
function promptApiKey() {
  console.log("prompt api key")
  var apiKey = prompt("Please enter your API key:");
  return apiKey;
}

// Function to save the API key to Chrome storage
function saveApiKey(apiKey) {
  console.log("save api key")
  console.log(chrome.storage);
  chrome.storage.local.set({ "apiKey": apiKey }, function() {
    console.log("API key saved: " + apiKey);
  });
}

// Function to load the API key from Chrome storage
function loadApiKey(callback) {
  console.log("load api key");
  chrome.storage.local.get("apiKey", function(data) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    callback(data.apiKey);
  });
}

// Load the API key from Chrome storage, prompt the user for a new one if it's not found
loadApiKey(function(apiKey) {
  if (!apiKey) {
    apiKey = promptApiKey();
    saveApiKey(apiKey);
  } else {
    console.log("API key found: " + apiKey);
  }
});
// import './index.css'

// const crx = 'textcompletion'

// // Function to prompt the user for an API key
// function promptApiKey() {
//   console.log("prompt api key")
//   // if no api key in storage then
//   var apiKey = prompt("Please enter your API key:");
//   return apiKey;
// }

// // Function to save the API key to Chrome storage
// function saveApiKey(apiKey) {
//   console.log("save api key")
//   console.log(chrome.storage);
//   // chrome.storage.sync.set({ "apiKey": apiKey }, function() {
//   chrome.storage.local.set({ "apiKey": apiKey }, function(res) {
//     console.log("API key saved: " + apiKey);
//     console.log(res);
//   });
// }

// // if apikey is not already present Call the promptApiKey function and save the result to Chrome storage
// var apiKey = promptApiKey();
// saveApiKey(apiKey);
