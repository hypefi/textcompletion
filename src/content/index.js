console.info('chrome-ext template-vanilla-js content script')

let textInputField;
let OPENAI_API_KEY;

async function handleResponse(response) {
  try {
    const data = await response.json();
    console.log(data);
    const recommendedText = data.choices[0].text.trim();
    const textAfterRecommendation = textAfterCursor.trimLeft();
    let completedText = recommendedText.slice(textToComplete.length);
    let newText = textBeforeCursor.slice(0, -textToComplete.length) + completedText + textAfterRecommendation;
    console.log({ recommendedText });
    console.log({ newText });

    document.activeElement.innerHTML = newText;
    selectionStart = selectionStart + completedText.length;
    selectionEnd = selectionStart;
  } catch (error) {
    console.error(error);
  }
}


function fetchCompletions(prompt, apiKey) {
  return fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 500,
      model: "text-davinci-003",
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

document.addEventListener("keydown", async function(event) {
  // console.log("1", event)
  // console.log("2", event.metaKey, event.code)
  console.log("3", textInputField , document.activeElement)
  let noden =  document.activeElement.nodeName;
  // console.log(document.activeElement)
  if (event.metaKey && event.code === "KeyK" && ("TEXTAREA" === noden || "INPUT" === noden)) {
    event.preventDefault();
    // console.log("key pressed k ");
    textInputField = document.activeElement.innerHTML
    let selectionStart = document.activeElement.selectionStart;
    // console.log(selectionStart)
    // console.log(textInputField)
    const textBeforeCursor = textInputField.slice(0, selectionStart);
    const textAfterCursor = textInputField.slice(selectionStart);
    const textToComplete = textBeforeCursor.split(" ").pop();
    // console.log({textToComplete})
    // console.log({textAfterCursor})
    console.log({textBeforeCursor})

    OPENAI_API_KEY = await getApiKey();

    console.log(OPENAI_API_KEY);
    const prompt = textBeforeCursor + "\n";
    const response = await fetchCompletions(prompt, OPENAI_API_KEY);
    handleResponse(response);
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

// document.addEventListener("keydown", function(event) {
//   if (event.key === "a" && event.target === textInputField) {
//     event.preventDefault();
//     // Accept recommended text
//   }
//   if (event.key === "c" && event.target === textInputField) {
//     event.preventDefault();
//     // Request change of recommendation
//   }
// });

export {}
