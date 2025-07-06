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

function restoreLastState() {
  populateCategories();

  const categoryFilter = document.getElementById('categoryFilter');
  const selectedCategory = categoryFilter.value;

  if (selectedCategory === 'all') {
    filteredQuotes = quotes.slice();
  } else {
    filteredQuo
