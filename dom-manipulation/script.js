// Initial load from localStorage or fallback
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is really simple, but we insist on making it complicated.", category: "Life" },
  { text: "Simplicity is the ultimate sophistication.", category: "Design" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// --- DISPLAY ---

function showQuote(quote) {
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>— Category: ${quote.category}</em></p>
  `;
}

function showRandomQuote() {
  const category = categoryFilter.value;
  let filteredQuotes = category === "all" ? quotes : quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p><em>No quotes available in this category.</em></p>";
    return;
  }

  const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  showQuote(quote);

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function showLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) showQuote(JSON.parse(last));
}

// --- ADD QUOTES ---

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

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  alert("Quote added successfully!");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Sync to server
  postQuoteToServer(newQuote);
}

// --- CATEGORY FILTERING ---

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

function filterQuotes() {
  localStorage.setItem("selectedCategory", categoryFilter.value);
  showRandomQuote();
}

// --- STORAGE ---

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// --- JSON Import/Export ---

function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid format.");
      }
    } catch {
      alert("Error parsing file.");
    }
  };
  reader.readAsText(file);
}

// --- MOCK API SYNC (SIMULATED) ---

const API_URL = "https://jsonplaceholder.typicode.com/posts"; // Replace with your API if needed

async function fetchQuotesFromServer() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    const newQuotes = serverQuotes.filter(
      sq => !quotes.some(lq => lq.text === sq.text)
    );

    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      populateCategories();
      showNotification("Quotes synced from server.");
    }
  } catch (err) {
    console.error("Failed to fetch quotes from server", err);
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" }
    });
    console.log("Quote sent to server");
  } catch (err) {
    console.error("Failed to sync quote to server", err);
  }
}

function syncQuotes() {
  fetchQuotesFromServer();
}

// --- UI NOTIFICATIONS ---

function showNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style = `
    position: fixed; top: 1rem; right: 1rem;
    background: #007BFF; color: white; padding: 1rem;
    border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 1000;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}

// --- EVENT LISTENERS ---

newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.querySelector("button[onclick='exportToJsonFile()']").addEventListener("click", exportToJsonFile);

// --- INIT ---

createAddQuoteForm();
populateCategories();
showLastViewedQuote();
syncQuotes(); // initial sync
setInterval(syncQuotes, 30000); // periodic sync every 30s
