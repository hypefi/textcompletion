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



async function getModel() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getStorageData", key: "selectedModel" }, function (response) {
      console.log("Model retrieved: ", response.data);

      const modelMap = {
        chatweb: "text-davinci-002-render-sha",
        chat3: "text-davinci-003",
        chat35: "gpt-3.5-turbo",
        chatgptplus4: "gpt-4",
        chatgptapi4_8k: "gpt-4",
        chatgptapi4_32k: "gpt-4-32k",
      };

      const selectedModel = response.data;
      const modelName = modelMap[selectedModel];

      resolve(modelName);
    });
  });
}



async function handleResponse(response, model, textAfterCursor, textToComplete, textBeforeCursor, slstart) {
  try {
    
    if(model){
      let data = await response.then(res => fetchAndRead(res));
      console.log(data)
      // console.log(data.choices)
      let data_ = JSON.parse(data);
      console.log(data_.choices)
      const recommendedText = data_.choices[0].message.content.trim();
      const textAfterRecommendation = textAfterCursor.trimLeft();
      let completedText = recommendedText.slice(textToComplete.length);
      let newText = textBeforeCursor.slice(0, -textToComplete.length) + completedText + textAfterRecommendation;
      console.log({ recommendedText });
      console.log({ newText });

      document.activeElement.value = textBeforeCursor + newText;
      slstart = slstart + completedText.length;
      let slend = slstart;

    }else{
    // const data = await response;
      console.log(response);
      let data = await response.then(res => fetchAndRead(res));
      console.log(data);
// .json();
      let data_ = JSON.parse(data);
      const recommendedText = data_.choices[0].text.trim();
      const textAfterRecommendation = textAfterCursor.trimLeft();
      let completedText = recommendedText.slice(textToComplete.length);
      let newText = textBeforeCursor.slice(0, -textToComplete.length) + completedText + textAfterRecommendation;
      console.log({ recommendedText });
      console.log({ newText });

      document.activeElement.value = textBeforeCursor + newText;
      slstart = slstart + completedText.length;
      let slend = slstart;


    }
  } catch (error) {
    console.error(error);
  }
}


function fetchCompletions(prompt, apiKey, model) {
  console.log(model, " apikey ", apiKey);
  let mod;

  const chatModels = ["gpt-4", "gpt-4-0314", "gpt-4-32k", "gpt-4-32k-0314", "gpt-3.5-turbo", "gpt-3.5-turbo-0301"];
  const completionModels = ["text-davinci-003", "text-davinci-002-render-sha", "text-davinci-002", "text-curie-001", "text-babbage-001", "text-ada-001", "davinci", "curie", "babbage", "ada"];
  
  let endpoint, payload;
  
  if (chatModels.includes(model)) {
    mod = true
    endpoint = "https://api.openai.com/v1/chat/completions";
    payload = "messages"
    prompt = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "finish this sentence : " + prompt},
    ];
  } else if (completionModels.includes(model)) {
    mod = false
    endpoint = "https://api.openai.com/v1/completions";
    payload = "prompt";
  } else {
    throw new Error("Invalid model specified.");
  }

  // let PL = {
  //     payload: prompt,
  //     max_tokens: 500,
  //     model: model,
  //     temperature: 0.7,
  //   };
  // console.log(PL);

  return [fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      [payload]: prompt,
      max_tokens: 500,
      model: model,
      temperature: 0.7,
    }),
  }), mod];
}


async function fetchAndRead(response) {
  try {
    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Get the ReadableStream from the response
    const readableStream = response.body;

    // Create a new reader for the stream
    const reader = readableStream.getReader();

    // Define a text decoder to decode the stream
    const decoder = new TextDecoder('utf-8');
    let result = '';

    // Read the stream and process the data
    while (true) {
      // Read a chunk from the stream
      const { value, done } = await reader.read();

      // If the stream is done, break the loop
      if (done) {
        break;
      }

      // Decode the chunk and append it to the result
      result += decoder.decode(value);
    }

    // Log the result to the console
    console.log(result);
    return result;

  } catch (error) {
    console.error('Fetch and read failed: ', error);
  }
}




async function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getStorageData", key: "apiKey" }, function (response) {
      console.log("API key retrieved: ", response.data);
      resolve(response.data);
    });
  });
}

async function updateApiKey(newApiKey) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "setStorageData", key: "apiKey", value: newApiKey }, function (response) {
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
    
    console.log(response[0])
    handleResponse(response[0], response[1], textAfterCursor, textToComplete, textBeforeCursor, selectionStart);
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
