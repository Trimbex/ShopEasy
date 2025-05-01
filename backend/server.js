import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import supabase from "./supabase.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/users", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) throw error;

    console.log("Fetched users:", data);

    res.status(200).json({
      success: true,
      users: data,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the users endpoint at: http://localhost:${PORT}/api/users`);
});
