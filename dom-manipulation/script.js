let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do or do not. There is no try.", category: "Motivation" }
];

let filteredQuotes = [];
let currentQuoteIndex = null;

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const opt = document.createElement('option');
    opt.value = category;
    opt.textContent = category;
    categoryFilter.appendChild(opt);
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
  filteredQuotes = category === 'all' ? quotes.slice() : quotes.filter(q => q.category === category);
  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "No quotes available for this category.";
    return;
  }
  currentQuoteIndex = Math.floor(Math.random() * filteredQuotes.length);
  displayQuote(filteredQuotes[currentQuoteIndex]);
}

function displayQuote(quote) {
  document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - [${quote.category}]`;
  sessionStorage.setItem('lastViewedQuoteIndex', currentQuoteIndex);
}

function showRandomQuote() {
  if (!filteredQuotes.length) {
    filterQuotes();
    return;
  }
  currentQuoteIndex = Math.floor(Math.random() * filteredQuotes.length);
  displayQuote(filteredQuotes[currentQuoteIndex]);
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
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (!Array.isArray(imported)) {
        alert("Invalid JSON format.");
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
      alert("Error importing quotes.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function fetchQuotesFromServer() {
  return fetch('https://jsonplaceholder.typicode.com/posts')
    .then(res => res.json())
    .then(data => data.slice(0, 5).map(post => ({
      text: post.title,
      category: 'Server'
    })));
}

function postQuotesToServer() {
  quotes.forEach(quote => {
    fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(quote)
    })
    .then(res => res.json())
    .then(data => {
      console.log("Posted to server:", data);
    });
  });
}

function mergeQuotes(serverQuotes) {
  let conflicts = 0;
  serverQuotes.forEach(sq => {
    const idx = quotes.findIndex(lq => lq.text === sq.text);
    if (idx === -1) {
      quotes.push(sq);
    } else if (quotes[idx].category !== sq.category) {
      quotes[idx].category = sq.category;
      conflicts++;
    }
  });
  saveQuotes();
  populateCategories();
  filterQuotes();
  if (conflicts > 0) {
    showSyncStatus(`${conflicts} conflict(s) resolved with server data.`);
  } else {
    showSyncStatus("Data synced successfully with server.");
  }
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    mergeQuotes(serverQuotes);
    postQuotesToServer();
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
  const category = document.getElementById('categoryFilter').value;
  filteredQuotes = category === 'all' ? quotes.slice() : quotes.filter(q => q.category === category);
  const lastIdx = sessionStorage.getItem('lastViewedQuoteIndex');
  if (lastIdx !== null && lastIdx < filteredQuotes.length) {
    currentQuoteIndex = Number(lastIdx);
    displayQuote(filteredQuotes[currentQuoteIndex]);
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
  syncQuotes();
  setInterval(syncQuotes, 30000);
};
