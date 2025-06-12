const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = 3000;

// URL JSON dari GitHub
const GITHUB_JSON_URL = "https://raw.githubusercontent.com/username/repo/main/data.json";

// Middleware serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// API endpoint untuk ambil data dari GitHub
app.get("/api/users", async (req, res) => {
  try {
    const response = await fetch(GITHUB_JSON_URL);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data dari GitHub" });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
