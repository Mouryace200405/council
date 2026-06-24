import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      console.warn("GEMINI_API_KEY is not set or using placeholder. Running in simulated fallback mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for chat generation
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemInstruction, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Graceful offline simulated fallback when GEMINI_API_KEY is not set.
      // This allows the app to be fully interactive even before the user provides keys.
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      let responseText = "";

      if (lastUserMsg.toLowerCase().includes("flutter")) {
        responseText = `### Flutter Architecture Overview

Flutter is Google's high-performance UI toolkit for building beautiful, natively compiled applications for mobile, web, and desktop from a single codebase. It leverages the **Dart** programming language and a highly optimized rendering engine.

## Core Principles

*   **Widget-based Architecture:** In Flutter, the UI is built as a tree of immutable widgets. Every visual element, from padding to layouts, is a widget.
*   **Native Performance:** Unlike hybrid frameworks, Flutter compiles to native ARM and x86 machine code, bypassing Javascript bridges for smooth 60/120fps performance.
*   **Skia / Impeller Engine:** Flutter paints its own UI, ensuring pixel-perfect consistency across platforms.

\`\`\`dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData.dark(),
      home: const Scaffold(
        body: Center(
          child: Text('Hello Technical Workspace'),
        ),
      ),
    );
  }
}
\`\`\`

*(Note: This is a simulated response because **GEMINI_API_KEY** is not configured. Add your API key in **Settings > Secrets** to enable live real-time LLM interaction.)*`;
      } else {
        responseText = `### Technical Response (Simulated Workspace)

I received your prompt: "${lastUserMsg}"

Here is a template structure outlining how we can process this in a professional-grade technical workspace:

1.  **Requirement Synthesis:** Extracting critical inputs and system states.
2.  **Implementation Architecture:** Breaking down modular elements.
3.  **Code Construct:** Providing clean, production-ready outputs.

\`\`\`typescript
// Technical workspace simulation
interface WorkspaceConfig {
  activeSession: boolean;
  status: string;
}

const config: WorkspaceConfig = {
  activeSession: true,
  status: "NOMINAL"
};

console.log(\`Workspace Status: \${config.status}\`);
\`\`\`

*(Note: To connect to the real live **Gemini-3.5-Flash** model, please add your **GEMINI_API_KEY** under the **Settings > Secrets** panel in AI Studio. Once added, the workspace will utilize real live inferences.)*`;
      }

      // Simulate a small delay for realistic typing feel
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return res.json({ text: responseText, simulated: true });
    }

    // Map frontend Message interface to Gemini API content format
    const contents = messages.map((m: any) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Ensure we don't end with a model turn
    if (contents.length > 0 && contents[contents.length - 1].role === "model") {
      contents.pop();
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction || "You are a professional software engineer and cognitive AI partner in a high-performance terminal. Provide elegant, concise responses with clean Markdown formatting, structured lists, and proper code blocks.",
        temperature: typeof temperature === "number" ? temperature : 0.7,
      },
    });

    const replyText = response.text || "No response received from the model.";
    return res.json({ text: replyText, simulated: false });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: "Failed to generate content from AI model.",
      details: error.message || String(error),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
