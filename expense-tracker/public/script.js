const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "always",
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

form.addEventListener("submit", addTransaction);

// Fetch transactions from the server
async function fetchTransactions() {
  const response = await fetch("/api/transactions");
  const transactions = await response.json();
  renderList(transactions);
  updateTotal(transactions);
}

// Add a new transaction to the server
async function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const transaction = {
    name: formData.get("name"),
    amount: parseFloat(formData.get("amount")),
    date: formData.get("date"),
    type: formData.get("type") === "on" ? "income" : "expense",
  };

  await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  this.reset();
  fetchTransactions(); // Refresh the list
}

// Delete a transaction
async function deleteTransaction(id) {
  await fetch(`/api/transactions/${id}`, { method: "DELETE" });
  fetchTransactions(); // Refresh the list
}

// Update totals (balance, income, expense)
function updateTotal(transactions) {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0);

  const balanceTotal = incomeTotal - expenseTotal;

  balance.textContent = formatter.format(balanceTotal).substring(1);
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
}

// Render the transaction list
function renderList(transactions) {
  list.innerHTML = "";
  status.textContent = transactions.length === 0 ? "No transactions." : "";

  transactions.forEach(({ id, name, amount, date, type }) => {
    const sign = type === "income" ? 1 : -1;

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="name">
        <h4>${name}</h4>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>

      <div class="amount ${type}">
        <span>${formatter.format(amount * sign)}</span>
      </div>
    
      <div class="action">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${id})">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `;
    list.appendChild(li);
  });
}

fetchTransactions(); // Load the transactions when the page loads
