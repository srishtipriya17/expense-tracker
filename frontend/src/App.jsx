
import { useEffect, useState } from "react";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:5000/api/transactions";

  // Fetch transactions when the component loads
  async function fetchTransactions() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not fetch transactions");

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      setMessage("Backend connection failed. Is the server running?");
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Add a transaction
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          type,
          category,
          date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add transaction");
      }

      setTitle("");
      setAmount("");
      setCategory("Food");
      await fetchTransactions();
      setMessage("Transaction added successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  // Delete a transaction
  async function handleDelete(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete transaction");
      }

      await fetchTransactions();
      setMessage("Transaction deleted successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  return (
    <main>
      <h1>Expense Tracker</h1>
      <p>Manage your income and expenses</p>

      <section>
        <h2>Balance: ₹{income - expenses}</h2>
        <p>Income: ₹{income}</p>
        <p>Expenses: ₹{expenses}</p>
      </section>

      <h2>Add Transaction</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Transaction title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          min="0.01"
          step="0.01"
          required
        />

        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
        />

        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />

        <button type="submit">Add Transaction</button>
      </form>

      {message && <p>{message}</p>}

      <h2>All Transactions</h2>

      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <ul>
          {transactions.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              {" — "}
              {item.type === "expense" ? "-" : "+"}₹{item.amount}
              {" — "}
              {item.category}
              {" — "}
              {item.date}
              {" "}
              <button onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
