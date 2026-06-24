import React, { useRef, useEffect, useState } from 'react';
import { Send, Terminal, Cpu, Clock, HelpCircle, CornerDownLeft, Paperclip, AlertCircle, RefreshCw } from 'lucide-react';
import { Message, Session, SystemConfig } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatWorkspaceProps {
  activeSession: Session | null;
  onSendMessage: (content: string) => void;
  isGenerating: boolean;
  systemConfig: SystemConfig;
  onExtractCode: (code: string, language: string, title: string) => void;
}

const PRESET_PROMPTS = [
  {
    title: "Explain Flutter",
    desc: "Provides architectural overview & code template.",
    prompt: "Explain Flutter and provide a basic code example for a starting application."
  },
  {
    title: "Binary Search",
    desc: "TypeScript implementation with O(log n) analysis.",
    prompt: "Write a complete binary search function in TypeScript, explaining the logic and time complexity."
  },
  {
    title: "React State Hook",
    desc: "A custom hook managing standard localStorage states.",
    prompt: "Create a custom React state hook called useLocalStorage with clean TypeScript declaration and usage details."
  }
];

export default function ChatWorkspace({
  activeSession,
  onSendMessage,
  isGenerating,
  systemConfig,
  onExtractCode
}: ChatWorkspaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when messages list changes or generation state shifts
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isGenerating]);

  // Handle auto-expanding text-area height dynamically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSend = () => {
    if (inputValue.trim() === '' || isGenerating) return;
    onSendMessage(inputValue);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col relative h-full bg-[#242933] overflow-hidden">
      {/* Workspace Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pt-10 pb-[180px]">
        <div className="max-w-[960px] mx-auto">
          {!activeSession || activeSession.messages.length === 0 ? (
            /* Welcome Empty Screen with Presets */
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-sm bg-[#88c0d0]/10 border border-[#88c0d0]/20 flex items-center justify-center mb-6">
                <Terminal className="w-6 h-6 text-[#88c0d0]" />
              </div>
              <h2 className="text-lg font-bold font-mono text-[#eceff4] uppercase tracking-wider mb-2">
                Cognitive Terminal Init
              </h2>
              <p className="text-xs text-[#d8dee9] max-w-md font-mono mb-10 leading-relaxed">
                Initialize an LLM session or query from the custom developer terminal below. Standard system rules and constraints are bound.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                {PRESET_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputValue(item.prompt);
                      if (textareaRef.current) {
                        textareaRef.current.focus();
                      }
                    }}
                    className="p-5 bg-[#2e3440] hover:bg-[#3b4252] border border-[#4c566a]/30 hover:border-[#88c0d0]/40 rounded-sm text-left transition-all duration-150 flex flex-col h-full cursor-pointer group"
                  >
                    <span className="text-xs font-bold font-mono text-[#88c0d0] uppercase tracking-wider block mb-1 group-hover:text-[#88c0d0]">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-[#4c566a] font-mono leading-relaxed mt-auto">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Lists */
            <div className="space-y-12">
              {activeSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`border-l-2 pl-8 pb-4 transition-all duration-150 ${
                    message.role === 'user'
                      ? 'border-[#3b4252]/50'
                      : 'border-[#88c0d0]/30'
                  }`}
                >
                  {/* Meta Header */}
                  <header className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 border uppercase tracking-wider ${
                          message.role === 'user'
                            ? 'text-[#88c0d0] bg-[#2e3440] border-[#88c0d0]/20'
                            : 'text-[#a3be8c] bg-[#2e3440] border-[#a3be8c]/20'
                        }`}
                      >
                        {message.role === 'user' ? 'YOU' : 'COGNITION_AI'}
                      </span>
                      <span className="text-[10px] text-[#4c566a] font-mono">
                        {message.timestamp}
                      </span>
                    </div>
                  </header>

                  {/* Body Text */}
                  <div className="text-sm font-mono text-[#d8dee9] leading-relaxed">
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-[#eceff4] text-[15px] font-medium font-mono">
                        {message.content}
                      </p>
                    ) : (
                      <MarkdownRenderer
                        content={message.content}
                        onCodeExtracted={onExtractCode}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inference/Executing Spinner State */}
          {isGenerating && (
            <div className="border-l-2 border-[#88c0d0]/40 pl-8 py-4 transition-all duration-150">
              <div className="flex items-center gap-3 font-mono">
                <span className="text-[10px] font-bold text-[#88c0d0] bg-[#2e3440] border border-[#88c0d0]/20 px-2 py-0.5 uppercase tracking-wider">
                  EXECUTING_INFERENCE
                </span>
                <span className="text-[#88c0d0] animate-pulse font-bold text-sm">_</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Bottom Console Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-[#242933] via-[#242933]/95 to-transparent">
        <div className="max-w-[960px] mx-auto">
          {/* Main Input Text Box */}
          <div className="bg-[#2e3440]/95 backdrop-blur-md border border-[#4c566a]/30 shadow-2xl rounded-sm p-2 flex items-end gap-3 focus-within:border-[#88c0d0]/50 transition-all">
            <span className="pl-3 pb-3 text-[#4c566a] font-mono text-sm uppercase select-none">
              $
            </span>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Enter command or query..."
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-[#eceff4] font-mono text-sm placeholder-[#4c566a] resize-none py-2.5 max-h-40 custom-scrollbar"
            />
            <div className="flex items-center gap-1.5 pb-1 pr-1">
              <button
                type="button"
                className="p-2.5 text-[#4c566a] hover:text-[#d8dee9] hover:bg-[#242933]/50 rounded-sm transition-colors cursor-pointer"
                title="Attach Log File"
              >
                <Paperclip className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={handleSend}
                disabled={inputValue.trim() === '' || isGenerating}
                className={`px-4 py-2.5 rounded-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  inputValue.trim() !== '' && !isGenerating
                    ? 'bg-[#88c0d0] text-[#242933] hover:bg-[#88c0d0]/90 cursor-pointer'
                    : 'bg-[#2e3440] text-[#4c566a] border border-[#4c566a]/20 cursor-not-allowed'
                }`}
              >
                <span>Execute</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Console Subtext Metadata */}
          <div className="mt-3 flex justify-center">
            <p className="text-[9px] text-[#4c566a] font-mono uppercase tracking-widest text-center">
              System State: {systemConfig.systemState} | Context Window: {systemConfig.contextWindow} | Temperature: {systemConfig.temperature.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
