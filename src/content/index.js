console.info('chrome-ext template-vanilla-js content script')

let textInputField;
let OPENAI_API_KEY;
let selectedModel;



//custom cursor when fetching 
const style = document.createElement('style');
style.textContent = `
  .custom-cursor {
  cursor: url('/Users/admin/Downloads/output-onlinegiftools.gif'), auto;
  }
`;
document.head.appendChild(style);


function getModel() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("selectedModel", function (data) {
      console.log("Model retrieved: ", data.selectedModel);

      const modelMap = {
        chatweb: "text-davinci-002-render-sha",
        chat3: "text-davinci-003",
        chat35: "gpt-3.5-turbo", 
        chatgptplus4 : "gpt-4",
        chatgptapi4_8k: "gpt-4",
        chatgptapi4_32k: "gpt-4-32k",
      };

      const selectedModel = data.selectedModel;
      const modelName = modelMap[selectedModel];

      resolve(modelName);
    });
  });
}



async function handleResponse(response, textAfterCursor, textToComplete, textBeforeCursor, slstart) {
  try {
    const data = await response.json();
    console.log(data);
    const recommendedText = data.choices[0].text.trim();
    const textAfterRecommendation = textAfterCursor.trimLeft();
    let completedText = recommendedText.slice(textToComplete.length);
    let newText = textBeforeCursor.slice(0, -textToComplete.length) + completedText + textAfterRecommendation;
    console.log({ recommendedText });
    console.log({ newText });

    document.activeElement.value = textBeforeCursor + newText;
    slstart = slstart + completedText.length;
    let slend = slstart;
  } catch (error) {
    console.error(error);
  }
}


function fetchCompletions(prompt, apiKey, model) {
  console.log(model, " apikey ", apiKey)
  return fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 500,
      model: model,
      temperature: 0.7,
    }),
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

function updateApiKey(newApiKey) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ apiKey: newApiKey }, () => {
      console.log("API key updated: ", newApiKey);
      resolve();
    });
  });
}


document.addEventListener("keydown", async function(event) {
  console.log("keydown");
  let noden =  document.activeElement.nodeName;
  if (event.metaKey && event.code === "KeyK" && ("TEXTAREA" === noden || "INPUT" === noden)) {
    event.preventDefault();
    textInputField = document.activeElement.innerHTML
    let selectionStart = document.activeElement.selectionStart;
    const textBeforeCursor = textInputField.slice(0, selectionStart);
    const textAfterCursor = textInputField.slice(selectionStart);
    const textToComplete = textBeforeCursor.split(" ").pop();
    console.log({textBeforeCursor})

    OPENAI_API_KEY = await getApiKey();
    selectedModel = await getModel();

    console.log(OPENAI_API_KEY);
    const prompt = textBeforeCursor + "\n";
    
    // Add the custom cursor class to the body
    document.body.classList.add('custom-cursor');
    
    const response = await fetchCompletions(prompt, OPENAI_API_KEY, selectedModel);
    
    // Remove the custom cursor class from the body
    document.body.classList.remove('custom-cursor');
    
    handleResponse(response, textAfterCursor, textToComplete, textBeforeCursor, selectionStart);
  }
});

document.addEventListener("focusin", function(event) {
  console.log("focusin")
  if (event.target instanceof HTMLInputElement && event.target.type === "text") {
    textInputField = event.target;
  }
});

document.addEventListener("focusout", function(event) {
  if (event.target === textInputField) {
    textInputField = null;
  }
});


export {}
