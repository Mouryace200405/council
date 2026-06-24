import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWorkspace from './components/ChatWorkspace';
import HistoryView from './components/HistoryView';
import ArtifactsView from './components/ArtifactsView';
import ConfigView from './components/ConfigView';
import { Session, Message, SystemConfig, SidebarTab, Artifact } from './types';

const LOCAL_STORAGE_KEY = 'llm_council_sessions';
const ARTIFACTS_STORAGE_KEY = 'llm_council_artifacts';
const CONFIG_STORAGE_KEY = 'llm_council_config';

const DEFAULT_SYSTEM_INSTRUCTION =
  "You are a professional software engineer and cognitive AI partner in a high-performance terminal. Provide elegant, concise responses with clean Markdown formatting, structured lists, and proper code blocks.";

export default function App() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('session');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    temperature: 0.7,
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
    systemState: 'Nominal',
    contextWindow: '128k'
  });

  // Load state on mount
  useEffect(() => {
    // Sessions
    const savedSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed parsing stored sessions", e);
      }
    } else {
      // Create a default session to mimic the requested image
      const defaultMsgUser: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Explain Flutter and provide a basic code example for a starting application.',
        timestamp: '14:22:01 UTC'
      };

      const defaultMsgAi: Message = {
        id: 'msg-2',
        role: 'model',
        content: `### Flutter Architecture Overview

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

*(Note: Add your real **GEMINI_API_KEY** under the settings panel or configuration environments to connect live.)*`,
        timestamp: '14:22:04 UTC'
      };

      const initialSession: Session = {
        id: 'sess-default',
        title: 'Flutter Architecture Overview',
        createdAt: '14:22 UTC',
        messages: [defaultMsgUser, defaultMsgAi],
        temperature: 0.7,
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION
      };

      setSessions([initialSession]);
      setActiveSessionId(initialSession.id);

      // Extract artifacts from initial
      extractCodeBlock(defaultMsgAi.content, 'dart', 'dart_source_01.dart');
    }

    // Config
    const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfig) {
      try {
        setSystemConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed parsing stored config", e);
      }
    }

    // Artifacts
    const savedArtifacts = localStorage.getItem(ARTIFACTS_STORAGE_KEY);
    if (savedArtifacts) {
      try {
        setArtifacts(JSON.parse(savedArtifacts));
      } catch (e) {
        console.error("Failed parsing stored artifacts", e);
      }
    }
  }, []);

  // Save states on change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(systemConfig));
  }, [systemConfig]);

  useEffect(() => {
    localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(artifacts));
  }, [artifacts]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // New session creation handler
  const handleNewSession = () => {
    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' UTC';
    const newSession: Session = {
      id: `sess-${Date.now()}`,
      title: 'New Session Session',
      createdAt: timeString,
      messages: [],
      temperature: systemConfig.temperature,
      systemInstruction: systemConfig.systemInstruction
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveTab('session');
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setActiveTab('session');
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleUpdateConfig = (newConfig: Partial<SystemConfig>) => {
    setSystemConfig((prev) => ({
      ...prev,
      ...newConfig
    }));
  };

  // Safe artifact compiling and caching
  const extractCodeBlock = (code: string, language: string, title: string) => {
    setArtifacts((prev) => {
      // Avoid duplicate extraction title inside workspace
      if (prev.some((a) => a.title === title && a.code.trim() === code.trim())) {
        return prev;
      }
      const newArtifact: Artifact = {
        id: `art-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title,
        code,
        language,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' UTC'
      };
      return [newArtifact, ...prev];
    });
  };

  // Master send message handler connecting frontend to backend proxies securely
  const handleSendMessage = async (text: string) => {
    if (!activeSessionId) return;

    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC';
    const userMsg: Message = {
      id: `msg-usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: timeString
    };

    // Append to active session messages stream
    let updatedMessages = [...(activeSession?.messages || []), userMsg];

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          // If first message, rename session title dynamically based on prompt snippet
          const title = s.messages.length === 0
            ? text.length > 30 ? text.substring(0, 30) + '...' : text
            : s.title;

          return {
            ...s,
            title,
            messages: updatedMessages
          };
        }
        return s;
      })
    );

    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          systemInstruction: activeSession?.systemInstruction || systemConfig.systemInstruction,
          temperature: activeSession?.temperature || systemConfig.temperature
        }),
      });

      if (!response.ok) {
        throw new Error(`Workspace server error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC';

      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        content: data.text,
        timestamp: aiTime
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, aiMsg]
            };
          }
          return s;
        })
      );

      // Pre-extract any source/script codes immediately
      const codeBlockRegex = /```(\w+)\s+([\s\S]*?)```/g;
      let match;
      while ((match = codeBlockRegex.exec(data.text)) !== null) {
        const lang = match[1] || 'typescript';
        const code = match[2];
        let fileTitle = `compiled_source_${Date.now().toString().slice(-4)}.${lang === 'typescript' ? 'ts' : lang === 'javascript' ? 'js' : lang === 'dart' ? 'dart' : lang}`;
        
        // Peek at comment header
        const commentMatch = code.trim().match(/^(\/\/|#)\s*([\w-]+\.\w+)/);
        if (commentMatch) {
          fileTitle = commentMatch[2];
        }
        extractCodeBlock(code, lang, fileTitle);
      }

    } catch (err: any) {
      console.error(err);
      const errMsg: Message = {
        id: `msg-ai-err-${Date.now()}`,
        role: 'model',
        content: `### ❌ CONNECTION STREAM FAILED

Failed to generate workspace response or connect to secure API proxy. Please try again.

*   **Error Details:** ${err.message || String(err)}
*   **Action Suggestion:** Check if your server-side dev-host is fully started or check console logs.`,
        timestamp: timeString
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, errMsg]
            };
          }
          return s;
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#242933] font-sans antialiased text-[#d8dee9]">
      {/* Dynamic Glassmorphic ambient light glow */}
      <div className="fixed top-0 right-0 w-[50%] h-full pointer-events-none -z-10 bg-gradient-to-l from-[#88c0d0]/[0.025] to-transparent"></div>

      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        systemState={systemConfig.systemState}
      />

      {/* Main Container Views Switching */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {activeTab === 'session' && (
          <ChatWorkspace
            activeSession={activeSession}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            systemConfig={systemConfig}
            onExtractCode={extractCodeBlock}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'artifacts' && (
          <ArtifactsView artifacts={artifacts} />
        )}

        {activeTab === 'config' && (
          <ConfigView
            systemConfig={systemConfig}
            onUpdateConfig={handleUpdateConfig}
          />
        )}
      </main>
    </div>
  );
}
