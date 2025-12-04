const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const JWT_SECRET = "my-super-secret-jwt-key-2025";

const users = [{ email: "admin@example.com", password: "123456" }];

app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/register", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ error: "User already exists" });
    }

    users.push({ email, password });

    const token = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, message: "Registration successful" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.get("/profile", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ email: decoded.email, name: "Admin User" });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/", (req, res) => res.json({ message: "User Service OK" }));

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "user-service", users: users.length });
});

app.listen(3002, () => console.log("User Service running on 3002"));
