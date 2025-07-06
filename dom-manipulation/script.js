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
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', category);

  filteredQuotes = (category === 'all') ? quotes.slice() : quotes.filter(q => q.category === category);

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
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (!Array.isArray(imported)) {
        alert("Invalid JSON format: must be an array of quotes.");
        return;
      }
      imported.forEach(q => {
        if (q.text && q.category) quotes.push(q);
      });
      saveQuotes();
      alert("Quotes imported successfully!");
      populateCategories();
      filterQuotes();
    } catch {
      alert("Failed to import quotes. Invalid file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

function exportQuotes() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

let mockServerQuotes = [
  { text: "Server quote example 1", category: "Server" },
  { text: "Do or do not. There is no try.", category: "Motivation" }
];

function fetchQuotesFromServer() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockServerQuotes);
    }, 1000);
  });
}

function mergeQuotes(serverQuotes) {
  let conflicts = 0;
  serverQuotes.forEach(serverQuote => {
    const localIndex = quotes.findIndex(q => q.text === serverQuote.text);
    if (localIndex === -1) {
      quotes.push(serverQuote);
    } else if (quotes[localIndex].category !== serverQuote.category) {
      quotes[localIndex].category = serverQuote.category;
      conflicts++;
    }
  });

  if (conflicts > 0) {
    showSyncStatus(`${conflicts} conflict(s) resolved with server data.`);
  } else {
    showSyncStatus("Data synced successfully with server.");
  }

  saveQuotes();
  populateCategories();
  filterQuotes();
}

async function syncWithServer() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    mergeQuotes(serverQuotes);
  } catch {
    showSyncStatus("Error syncing with server.");
  }
}

function showSyncStatus(message) {
  const div = document.getElementById('syncStatus');
  div.textContent = message;
  setTimeout(() => div.textContent = '', 5000);
}

function createAddQuoteForm() {
  const div = document.createElement('div');

  const text = document.createElement('input');
  text.id = 'newQuoteText';
  text.placeholder = 'Enter a new quote';

  const cat = document.createElement('input');
  cat.id = 'newQuoteCategory';
  cat.placeholder = 'Enter quote category';

  const btn = document.createElement('button');
  btn.textContent = 'Add Quote';
  btn.onclick = addQuote;

  div.appendChild(text);
  div.appendChild(cat);
  div.appendChild(btn);

  document.body.appendChild(div);
}

function restoreLastState() {
  populateCategories();

  const lastIndex = sessionStorage.getItem('lastViewedQuoteIndex');
  const category = document.getElementById('categoryFilter').value;
  filteredQuotes = (category === 'all') ? quotes.slice() : quotes.filter(q => q.category === category);

  if (lastIndex !== null && lastIndex < filteredQuotes.length) {
    const quote = filteredQuotes[lastIndex];
    document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - [${quote.category}]`;
  } else {
    filterQuotes();
  }
}

window.onload = function() {
  createAddQuoteForm();
  document.getElementById('newQuote').onclick = showRandomQuote;
  document.getElementById('importFile').onchange = importFromJsonFile;
  document.getElementById('exportBtn').onclick = exportQuotes;

  restoreLastState();
  syncWithServer();
  setInterval(syncWithServer, 30000);
};
