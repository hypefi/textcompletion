import './index.css'

const crx = 'create-chrome-ext'


// Function to prompt the user for an API key
function promptApiKey() {
  var apiKey = prompt("Please enter your API key:");
  return apiKey;
}

// Function to save the API key to Chrome storage
function saveApiKey(apiKey) {
  chrome.storage.sync.set({ "apiKey": apiKey }, function() {
    console.log("API key saved: " + apiKey);
  });
}

// if apikey is not already present Call the promptApiKey function and save the result to Chrome storage
var apiKey = promptApiKey();
saveApiKey(apiKey);


// document.querySelector('#app').innerHTML = `
// <main>
// <h3>Popup Page!</h3>

// <h6>v 0.0.0</h6>

// <a
//   href="https://www.npmjs.com/package/create-chrome-ext"
//   target="_blank"
// >
//   Power by ${crx}
// </a>
// </main>
`
