// ==== Initial Quotes or Load from localStorage ====
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is really simple, but we insist on making it complicated.", category: "Life" },
  { text: "Simplicity is the ultimate sophistication.", category: "Design" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// ==== DOM Elements ====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// ==== Show Quote ====
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found in this category.</p>`;
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>— Category: ${quote.category}</em></p>
  `;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ==== Show Last Viewed ====
function showLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerHTML = `
      <blockquote>"${quote.text}"</blockquote>
      <p><em>— Category: ${quote.category}</em></p>
    `;
  }
}

// ==== Add Quote ====
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = `
    <h2>Add Your Own Quote</h2>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please fill out both fields.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added successfully!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ==== Save to LocalStorage ====
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ==== Populate Category Dropdown ====
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter && uniqueCategories.includes(savedFilter)) {
    categoryFilter.value = savedFilter;
    filterQuotes();
  }
}

// ==== Filter by Category ====
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

// ==== Export to JSON ====
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
  alert("Quotes exported.");
}

// ==== Import from JSON ====
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid format. Expected an array of quotes.");
      }
    } catch (err) {
      alert("Failed to import quotes.");
    }
  };
  reader.readAsText(file);
}

// ==== Sync with Server (Mock) ====
function fetchQuotesFromServer() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { text: "Talk is cheap. Show me the code.", category: "Programming" },
        { text: "Stay hungry, stay foolish.", category: "Motivation" }
      ]);
    }, 1000);
  });
}

function syncQuotes() {
  fetchQuotesFromServer().then(serverQuotes => {
    let updated = false;
    const existing = new Set(quotes.map(q => q.text));
    serverQuotes.forEach(quote => {
      if (!existing.has(quote.text)) {
        quotes.push(quote);
        updated = true;
        alert("Conflict detected! Server version used.");
      }
    });
    if (updated) {
      saveQuotes();
      populateCategories();
      alert("Quotes synced with server!");
    }
  }).catch(() => {
    alert("Failed to sync with server.");
  });
}

// ==== Setup Event Listeners ====
newQuoteBtn.addEventListener("click", showRandomQuote);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.querySelector("button[onclick='exportToJsonFile()']").addEventListener("click", exportToJsonFile);
categoryFilter.addEventListener("change", filterQuotes);

// ==== Initialize ====
createAddQuoteForm();
populateCategories();
showLastViewedQuote();
syncQuotes();
setInterval(syncQuotes, 30000); // Sync every 30 seconds
