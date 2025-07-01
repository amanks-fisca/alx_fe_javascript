// Initial array of quotes
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is really simple, but we insist on making it complicated.", category: "Life" },
  { text: "Simplicity is the ultimate sophistication.", category: "Design" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// Display container
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>— Category: ${quote.category}</em></p>
  `;
}

// Form to add new quote
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <h2>Add Your Own Quote</h2>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.body.appendChild(formContainer);

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// Add a new quote to array and DOM
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please fill out both fields.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });
  alert("New quote added!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize form on page load
createAddQuoteForm();
