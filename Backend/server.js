
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Temporary sample data
let transactions = [
  {
    id: 1,
    title: "Hostel Mess",
    amount: 2500,
    type: "expense",
    category: "Food",
    date: "2026-10-18",
  },
  {
    id: 2,
    title: "Monthly Allowance",
    amount: 8000,
    type: "income",
    category: "Income",
    date: "2026-10-17",
  },
];
let nextTransactionId =
  Math.max(...transactions.map((transaction) => transaction.id)) + 1;

function isValidDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

// Test route
app.get("/", (req, res) => {
  res.send("Expense Tracker API is running!");
});

// GET: retrieve all transactions
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

// POST: create a transaction
app.post("/api/transactions", (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      message: "Please provide valid transaction details.",
    });
  }

  const { title, amount, type, category, date } = req.body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !["income", "expense"].includes(type) ||
    typeof category !== "string" ||
    !category.trim() ||
    !isValidDate(date)
  ) {
    return res.status(400).json({
      message: "Please provide valid transaction details.",
    });
  }

  const newTransaction = {
    id: nextTransactionId++,
    title: title.trim(),
    amount,
    type,
    category: category.trim(),
    date,
  };

  transactions.push(newTransaction);

  res.status(201).json({
    message: "Transaction created successfully",
    transaction: newTransaction,
  });
});

// DELETE: remove a transaction
app.delete("/api/transactions/:id", (req, res) => {
  const id = Number(req.params.id);

  const existingTransaction = transactions.find(
    (item) => item.id === id
  );

  if (!existingTransaction) {
    return res.status(404).json({
      message: "Transaction not found",
    });
  }

  transactions = transactions.filter((item) => item.id !== id);

  res.json({
    message: "Transaction deleted successfully",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
