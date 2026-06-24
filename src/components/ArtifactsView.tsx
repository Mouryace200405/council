import React, { useState } from 'react';
import { FolderOpen, Code, Copy, Check, Terminal, ExternalLink, RefreshCw } from 'lucide-react';
import { Artifact } from '../types';

interface ArtifactsViewProps {
  artifacts: Artifact[];
  onSelectArtifact?: (artifact: Artifact) => void;
}

export default function ArtifactsView({ artifacts }: ArtifactsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    artifacts.length > 0 ? artifacts[0].id : null
  );
  const [copied, setCopied] = useState(false);

  // Auto-select first artifact if none selected
  const activeArtifact = artifacts.find((a) => a.id === (selectedId || (artifacts[0]?.id)));

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-full bg-[#242933] overflow-hidden select-none">
      {/* Left List Pane */}
      <div className="w-[300px] border-r border-[#2d3545]/50 flex flex-col h-full bg-[#1e232d]/30">
        <div className="p-6 border-b border-[#2d3545]/50">
          <h2 className="text-xs font-bold font-mono text-[#eceff4] uppercase tracking-wider">
            Workspace Source Files
          </h2>
          <p className="text-[9px] text-[#4c566a] font-mono tracking-widest uppercase mt-0.5">
            Auto-extracted static blocks
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          {artifacts.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen className="w-6 h-6 text-[#4c566a] mx-auto mb-2.5" />
              <p className="text-[10px] font-mono text-[#4c566a] uppercase">
                No source blocks compiled
              </p>
            </div>
          ) : (
            artifacts.map((art) => {
              const isSelected = art.id === activeArtifact?.id;
              return (
                <button
                  key={art.id}
                  onClick={() => setSelectedId(art.id)}
                  className={`w-full text-left p-3.5 rounded-sm border transition-all duration-150 flex flex-col gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#2e3440] border-[#88c0d0]/30 text-[#88c0d0]'
                      : 'bg-[#1a1e26]/30 border-transparent text-[#d8dee9] hover:bg-[#242933]'
                  }`}
                >
                  <span className="text-xs font-bold font-mono truncate uppercase tracking-wide block">
                    {art.title}
                  </span>
                  <div className="flex items-center gap-2 text-[9px] text-[#4c566a] font-mono uppercase">
                    <span className="text-[#81a1c1]">{art.language}</span>
                    <span>•</span>
                    <span>{art.timestamp}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Code Display Pane */}
      <div className="flex-1 flex flex-col h-full bg-[#242933]">
        {activeArtifact ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-[#2d3545]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-sm bg-[#88c0d0]/10 border border-[#88c0d0]/20 flex items-center justify-center">
                  <Code className="w-4 h-4 text-[#88c0d0]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#eceff4] uppercase">
                    {activeArtifact.title}
                  </h3>
                  <p className="text-[9px] text-[#4c566a] font-mono uppercase mt-0.5">
                    Syntax target: {activeArtifact.language}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeArtifact.code)}
                  className="px-3.5 py-1.5 rounded-sm bg-[#2e3440] hover:bg-[#3b4252] border border-[#4c566a]/30 hover:border-[#88c0d0]/30 font-mono text-[10px] text-[#d8dee9] hover:text-[#eceff4] flex items-center gap-1.5 transition-colors uppercase cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#a3be8c]" />
                      <span className="text-[#a3be8c]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Output */}
            <div className="flex-1 overflow-auto p-8 font-mono text-xs leading-relaxed text-[#eceff4] bg-[#1a1e26]/30">
              <pre className="whitespace-pre">
                <code>
                  {activeArtifact.code.split('\n').map((line, idx) => (
                    <div key={idx} className="table-row">
                      <span className="table-cell text-right pr-6 text-[#4c566a] select-none text-[10px] w-8">
                        {idx + 1}
                      </span>
                      <span className="table-cell whitespace-pre">{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <FolderOpen className="w-10 h-10 text-[#4c566a] mb-4" />
            <p className="text-xs font-mono text-[#4c566a] uppercase tracking-wider">
              No files are compiled or extracted yet
            </p>
            <p className="text-[10px] text-[#4c566a] font-mono max-w-sm mt-1 leading-relaxed">
              When the AI generates code in a standard markdown block, it automatically becomes interactive and extractable here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
