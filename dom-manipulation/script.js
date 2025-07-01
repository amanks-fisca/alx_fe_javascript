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

// ==== Notification Function ====
function showNotification(message, color = 'green') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.color = color;
  notification.style.opacity = '1';
  setTimeout(() => {
    notification.style.opacity = '0';
  }, 4000);
}

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

async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    showNotification("Please fill out both fields.", "red");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showNotification("Quote added successfully!", "green");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  await postQuoteToServer(newQuote); // POST to mock server
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
  showNotification("Quotes exported.", "blue");
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
        showNotification("Quotes imported successfully!", "green");
      } else {
        showNotification("Invalid format. Expected an array of quotes.", "red");
      }
    } catch (err) {
      showNotification("Failed to import quotes.", "red");
    }
  };
  reader.readAsText(file);
}

// ==== Fetch from Mock API ====
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await response.json();
    return data.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    showNotification("Failed to fetch from server.", "red");
    return [];
  }
}

// ==== Post to Mock API ====
async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const result = await response.json();
    console.log("Quote posted to server:", result);
    showNotification("Quote posted to server.", "blue");
  } catch (error) {
    showNotification("Error posting quote to server.", "red");
  }
}

// ==== Sync with Server ====
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const existing = new Set(quotes.map(q => q.text));
  let updated = false;

  serverQuotes.forEach(quote => {
    if (!existing.has(quote.text)) {
      quotes.push(quote);
      updated = true;
      showNotification("Conflict detected! Server version added.", "orange");
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced with server.", "green");
      alert("Quotes synced with server!");
  }
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
