import './index.css'


const crx = 'textcompletion'



const apiKeyInput = document.getElementById("apiKeyInput");
const updateApiKeyButton = document.getElementById("updateApiKeyButton");


function updateApiKey(newApiKey) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ apiKey: newApiKey }, () => {
      console.log("API key updated: ", newApiKey);
      resolve();
    });
  });
}

function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("apiKey", function (data) {
      console.log("API key retrieved: ", data.apiKey);
      resolve(data.apiKey);
    });
  });
}


(async function() {
  // Set the initial value of the input field to the current API key
  const currentApiKey = await getApiKey();
  apiKeyInput.value = currentApiKey;
})();

// Listen for changes in the input field
apiKeyInput.addEventListener("input", (event) => {
  console.log(event.target.value);
  const newApiKey = event.target.value;
  updateApiKey(newApiKey);
});

// Listen for button clicks
updateApiKeyButton.addEventListener("click", async () => {
  console.log("click")
  const newApiKey = apiKeyInput.value;
  await updateApiKey(newApiKey);
  alert("API key updated!");
});





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
