const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000; // Use dynamic port for cloud deployment

// In-memory store for transactions (replace with a database for production)
let transactions = [];

// Middleware to parse JSON data
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

// API to get all transactions
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

// API to add a new transaction
app.post("/api/transactions", (req, res) => {
  try {
    const { name, amount, date, type } = req.body;

    if (!name || !amount || !date || !type) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const id = transactions.length > 0 ? transactions[transactions.length - 1].id + 1 : 1;

    const newTransaction = {
      id,
      name,
      amount: parseFloat(amount),
      date: new Date(date),
      type,
    };

    transactions.push(newTransaction);
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while adding the transaction." });
  }
});

// API to delete a transaction by ID
app.delete("/api/transactions/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = transactions.length;
  transactions = transactions.filter((trx) => trx.id !== parseInt(id));

  if (transactions.length === initialLength) {
    return res.status(404).json({ error: "Transaction not found." });
  }

  res.sendStatus(200);
});

// Default route for unmatched paths
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
