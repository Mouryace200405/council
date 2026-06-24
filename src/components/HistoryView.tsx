import React from 'react';
import { Terminal, Clock, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import { Session } from '../types';

interface HistoryViewProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export default function HistoryView({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession
}: HistoryViewProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#242933] overflow-hidden select-none">
      {/* View Header */}
      <div className="p-8 border-b border-[#2d3545]/50 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold font-mono text-[#eceff4] uppercase tracking-wider">
            Inference History Log
          </h2>
          <p className="text-[11px] text-[#4c566a] font-mono tracking-widest uppercase mt-1">
            Archived workspaces and token streams
          </p>
        </div>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[800px] mx-auto">
          {sessions.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-[#4c566a]/30 rounded-sm">
              <Clock className="w-8 h-8 text-[#4c566a] mx-auto mb-4" />
              <p className="text-xs font-mono text-[#4c566a] uppercase tracking-wider">
                No archived sessions found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const lastMsg = session.messages[session.messages.length - 1];
                const previewText = lastMsg
                  ? lastMsg.content.length > 120
                    ? lastMsg.content.substring(0, 120) + '...'
                    : lastMsg.content
                  : 'Empty Session initialized';

                const isActive = session.id === activeSessionId;

                return (
                  <div
                    key={session.id}
                    className={`p-5 rounded-sm border transition-all duration-150 flex items-start justify-between gap-6 group ${
                      isActive
                        ? 'bg-[#2e3440] border-[#88c0d0]/40'
                        : 'bg-[#1a1e26]/60 border-[#4c566a]/20 hover:border-[#4c566a]/40'
                    }`}
                  >
                    <div
                      onClick={() => onSelectSession(session.id)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-[10px] font-mono font-bold text-[#88c0d0] uppercase tracking-widest">
                          {session.title}
                        </span>
                        <span className="text-[10px] text-[#4c566a] font-mono">
                          {session.createdAt}
                        </span>
                        <span className="text-[9px] font-mono text-[#81a1c1] bg-[#2e3440] px-1.5 py-0.2 border border-[#4c566a]/20 rounded-sm uppercase">
                          {session.messages.length} turns
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#d8dee9] leading-relaxed line-clamp-2">
                        {previewText}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectSession(session.id)}
                        className="p-2 text-[#4c566a] hover:text-[#88c0d0] hover:bg-[#2e3440] rounded-sm transition-colors cursor-pointer"
                        title="Resume Session"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-2 text-[#4c566a] hover:text-[#bf616a] hover:bg-[#2e3440] rounded-sm transition-colors cursor-pointer"
                        title="Delete Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
