let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do or do not. There is no try.", category: "Motivation" }
];

let currentQuoteIndex = null;

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "No quotes available.";
    return;
  }
  currentQuoteIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[currentQuoteIndex];
  document.getElementById("quoteDisplay").innerHTML = `"${quote.text}" - [${quote.category}]`;
  sessionStorage.setItem('lastViewedQuoteIndex', currentQuoteIndex);
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote and category!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  document.getElementById("quoteDisplay").innerHTML = `"${text}" - [${category}]`;

  textInput.value = "";
  categoryInput.value = "";
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert('Invalid JSON: expected an array of quotes');
        return;
      }
      importedQuotes.forEach(q => {
        if (q.text && q.category) {
          quotes.push(q);
        }
      });
      saveQuotes();
      alert('Quotes imported successfully!');
      showRandomQuote();
    } catch (e) {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

function exportQuotes() {
  const jsonStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function restoreLastViewedQuote() {
  const lastIndex = sessionStorage.getItem('lastViewedQuoteIndex');
  if (lastIndex !== null && lastIndex < quotes.length) {
    currentQuoteIndex = Number(lastIndex);
    const quote = quotes[currentQuoteIndex];
    document.getElementById("quoteDisplay").innerHTML = `"${quote.text}" - [${quote.category}]`;
  } else {
    showRandomQuote();
  }
}

function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

window.onload = function() {
  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
  document.getElementById("exportBtn").addEventListener("click", exportQuotes);

  restoreLastViewedQuote();
};
