console.info('chrome-ext template-vanilla-js content script')

let textInputField;


document.addEventListener("keydown", function(event) {
  console.log("1", event)
  console.log("2", event.metaKey, event.code)
  // console.log("3", textInputField , document.activeElement)
  let noden =  document.activeElement.nodeName;
  console.log(document.activeElement)
  if (event.metaKey && event.code === "KeyK" && ("TEXTAREA" === noden || "INPUT" === noden)) {
    event.preventDefault();
    console.log("key pressed k ");
    textInputField = document.activeElement.innerHTML
    const selectionStart = document.activeElement.selectionStart;
    console.log(selectionStart)
    console.log(textInputField)
    const textBeforeCursor = textInputField.slice(0, selectionStart);
    const textAfterCursor = textInputField.slice(selectionStart);
    const textToComplete = textBeforeCursor.split(" ").pop();
    console.log({textToComplete})
    console.log({textAfterCursor})
    console.log({textBeforeCursor})
    const prompt = textBeforeCursor + "\n";
    fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
        // "Authorization": "Bearer $OPENAI_API_KEY"
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 500,
        model: "text-davinci-003"	,
        temperature: 0.7
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      const recommendedText = data.choices[0].text.trim();
      const textAfterRecommendation = textAfterCursor.trimLeft();
      const completedText = recommendedText.slice(textToComplete.length);
      const newText = textBeforeCursor.slice(0, -textToComplete.length) + completedText + textAfterRecommendation;
      textInputField.value = newText;
      textInputField.selectionStart = selectionStart + completedText.length;
      textInputField.selectionEnd = textInputField.selectionStart;
    })
    .catch(error => console.error(error));
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

document.addEventListener("keydown", function(event) {
  if (event.key === "a" && event.target === textInputField) {
    event.preventDefault();
    // Accept recommended text
  }
  if (event.key === "c" && event.target === textInputField) {
    event.preventDefault();
    // Request change of recommendation
  }
});

export {}
