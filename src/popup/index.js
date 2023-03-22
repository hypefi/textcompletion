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


// Load the API key from Chrome storage, prompt the user for a new one if it's not found
loadApiKey(function(apiKey) {

  return new Promise((resolve, reject) => {
        
  if (!apiKey) {
    apiKey = promptApiKey();
    saveApiKey(apiKey);
    resolve(apiKey);
  } else {
    console.log("API key found: " + apiKey);
    resolve(apiKey);
    }
   });
});

// Add this function below your existing functions
async function getOpenAIAccountBalance(apiKey) {
  const response = await fetch('https://api.openai.com/dashboard/billing/credit_grants', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching balance: ${response.statusText}`);
  }

  const balanceData = (await response.json()).total_available.toFixed(2)

  return balanceData;
}


// Function to load the API key from Chrome storage
function loadApiKey() {
  return new Promise((resolve, reject) => {
    console.log("load api key");
    chrome.storage.local.get("apiKey", function(data) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(data.apiKey);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {

  const apiKeyInput = document.getElementById('apiKeyInput');
  const updateApiKeyButton = document.getElementById('updateApiKeyButton');
  const checkBalanceButton = document.getElementById('checkBalanceButton');

  updateApiKeyButton.addEventListener('click', () => {
      apiKeyInput.type = 'password';
    });

  let apiKey_

  checkBalanceButton.addEventListener('click', async () => {
    try {
      apiKey_ = await loadApiKey();
      if (!apiKey_) {
        apiKey_ = promptApiKey();
        saveApiKey(apiKey_);
      } else {
        console.log("API key found: " + apiKey_);
      }

      console.log({ apiKey_ });
      const balance = await getOpenAIAccountBalance(apiKey_);
      console.log('Account balance:', balance);
      // You can display the balance in your extension's popup here
      checkBalanceButton.innerHTML = balance;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      // You can display an error message in your extension's popup here
    }
  });
});
