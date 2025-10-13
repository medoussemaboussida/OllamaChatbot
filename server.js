import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Ollama } from "ollama"; // ✅ Correct import for modern Ollama JS SDK

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Initialize Ollama client
const ollama = new Ollama({ host: "http://localhost:11434" }); // Default Ollama port

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // ✅ Use the new Ollama chat API
    const response = await ollama.chat({
      model: "llama3.2:3b", // You can replace with any model you’ve pulled (e.g. mistral, phi3)
      messages: [
        {
          role: "system",
          content:
            "You are a supportive, empathetic mental health chatbot. Offer gentle, human-like guidance. Never give medical advice.",
        },
        { role: "user", content: message },
      ],
    });

    const reply =
      response.message?.content ||
      "I'm here for you. Can you tell me a bit more about how you're feeling?";

    res.json({ reply });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to connect to Ollama" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
