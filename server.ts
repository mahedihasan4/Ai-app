import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for generating recruitment content
  app.post("/api/generate", async (req, res) => {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ error: "Notes are required" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert HR Specialist and Recruitment Consultant. 
        Based on the following raw notes about a desired role, generate two distinct outputs:
        1. A polished, correctly formatted Job Description tailored for LinkedIn. Use professional, engaging language. Include sections like "About the Role", "Key Responsibilities", and "Qualifications".
        2. An Interview Guide containing 10 behavioral questions specifically targeting the soft and hard skills mentioned in the new JD. For each question, briefly explain what skill it targets.

        Raw Notes:
        ${notes}
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              jobDescription: {
                type: Type.STRING,
                description: "The formatted LinkedIn Job Description in Markdown.",
              },
              interviewGuide: {
                type: Type.STRING,
                description: "The Interview Guide with 10 behavioral questions in Markdown.",
              },
            },
            required: ["jobDescription", "interviewGuide"],
          },
        },
      });

      const result = JSON.parse(response.text);
      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate content. Please check your API key." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
