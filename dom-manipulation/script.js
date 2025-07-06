let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do or do not. There is no try.", category: "Motivation" }
];

let currentQuoteIndex = null;
let filteredQuotes = [];

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory && categories.includes(savedCategory)) {
    categoryFilter.value = savedCategory;
  } else {
    categoryFilter.value = 'all';
  }
}

function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  const selectedCategory = categoryFilter.value;

  localStorage.setItem('selectedCategory', selectedCategory);

  if (selectedCategory === 'all') {
    filteredQuotes = quotes.slice();
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "No quotes available for this category.";
    return;
  }

  currentQuoteIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[currentQuoteIndex];
  document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - [${quote.category}]`;

  sessionStorage.setItem('lastViewedQuoteIndex', currentQuoteIndex);
}

function showRandomQuote() {
  if (!filteredQuotes.length) {
    filterQuotes();
    return;
  }
  currentQuoteIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[currentQuoteIndex];
  document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - [${quote.category}]`;
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

  textInput.value = "";
  categoryInput.value = "";

  populateCategories();
  filterQuotes();
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
      populateCategories();
      filterQuotes();
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

function showSyncStatus(message) {
  const syncDiv = document.getElementById('syncStatus');
  syncDiv.textContent = message;
  setTimeout(() => {
    syncDiv.textContent = '';
  }, 5000);
}

let mockServerQuotes = [
  { text: "Server quote example 1", category: "Server" },
  { text: "Do or do not. There is no try.", category: "Motivation" } // same text, same category - no conflict
];

function fetchServerQuotes() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockServerQuotes);
    }, 1000);
  });
}

function mergeQuotes(serverQuotes) {
  let conflictsResolved = 0;

  serverQuotes.forEach(serverQuote => {
    const localIndex = quotes.findIndex(q => q.text === serverQuote.text);

    if (localIndex === -1) {
      // New quote from server
      quotes.push(serverQuote);
    } else {
      const localQuote = quotes[localIndex];
      if (localQuote.category !== serverQuote.category) {
        quotes[localIndex].category = serverQuote.category;
        conflictsResolved++;
      }
    }
  });

  if (conflictsResolved > 0) {
    showSyncStatus(`${conflictsResolved} conflict(s) resolved using server data.`);
  } else {
    showSyncStatus('Data synced successfully with server.');
  }

  saveQuotes();
  populateCategories();
  filterQuotes();
}

async function syncWithServer() {
  try {
    const serverQuotes = await fetchServerQuotes();
    mergeQuotes(serverQuotes);
  } catch (error) {
    showSyncStatus('Error syncing with server.');
  }
}

function restoreLastState() {
  populateCategories();

  const categoryFilter = document.getElementById('categoryFilter');
  const selectedCategory = categoryFilter.value;

  if (selectedCategory === 'all') {
    filteredQuotes = quotes.slice();
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  const lastIndex = sessionStorage.getItem('lastViewedQuoteIndex');
  if (lastIndex !== null && lastIndex < filteredQuotes.length) {
    currentQuoteIndex = Number(lastIndex);
    const quote = filteredQuotes[currentQuoteIndex];
    document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - [${quote.category}]`;
  } else {
    filterQuotes();
  }
}

// Create add quote form dynamically
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

  restoreLastState();

  syncWithServer();       
  setInterval(syncWithServer, 30000); 
};
