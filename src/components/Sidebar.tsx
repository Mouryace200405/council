import React from 'react';
import { Terminal, History, FolderOpen, Settings, PlusCircle, Activity } from 'lucide-react';
import { Session, SidebarTab } from '../types';

interface SidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  systemState: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  systemState
}: SidebarProps) {
  return (
    <aside className="w-[280px] bg-[#1a1e26] border-r border-[#2d3545] flex flex-col h-full flex-shrink-0 z-40 select-none">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-[#2d3545]/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-[#88c0d0]/10 border border-[#88c0d0]/30 flex items-center justify-center">
            <Terminal className="w-4.5 h-4.5 text-[#88c0d0]" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#eceff4] uppercase tracking-wider font-mono">
              LLM Council
            </h1>
            <p className="text-[10px] text-[#4c566a] font-mono font-medium tracking-widest uppercase mt-0.5">
              Tech Workspace v4.2
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="p-4 flex flex-col gap-1.5 border-b border-[#2d3545]/50">
        <button
          onClick={onNewSession}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#88c0d0] hover:bg-[#88c0d0]/90 text-[#242933] rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all duration-150"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Initialize Session</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 custom-scrollbar">
        <button
          onClick={() => setActiveTab('session')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider rounded-sm transition-all duration-150 ${
            activeTab === 'session'
              ? 'bg-[#2e3440] text-[#88c0d0] border-l-2 border-[#88c0d0]'
              : 'text-[#d8dee9] hover:bg-[#242933] hover:text-[#eceff4]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Active Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider rounded-sm transition-all duration-150 ${
            activeTab === 'history'
              ? 'bg-[#2e3440] text-[#88c0d0] border-l-2 border-[#88c0d0]'
              : 'text-[#d8dee9] hover:bg-[#242933] hover:text-[#eceff4]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </button>

        <button
          onClick={() => setActiveTab('artifacts')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider rounded-sm transition-all duration-150 ${
            activeTab === 'artifacts'
              ? 'bg-[#2e3440] text-[#88c0d0] border-l-2 border-[#88c0d0]'
              : 'text-[#d8dee9] hover:bg-[#242933] hover:text-[#eceff4]'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Artifacts</span>
        </button>

        <div className="pt-6 pb-2 px-3">
          <span className="text-[9px] text-[#4c566a] font-mono uppercase tracking-widest block">
            System
          </span>
        </div>

        <button
          onClick={() => setActiveTab('config')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider rounded-sm transition-all duration-150 ${
            activeTab === 'config'
              ? 'bg-[#2e3440] text-[#88c0d0] border-l-2 border-[#88c0d0]'
              : 'text-[#d8dee9] hover:bg-[#242933] hover:text-[#eceff4]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Config</span>
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 bg-[#141820] border-t border-[#2d3545]/50 flex items-center justify-between font-mono text-[10px] text-[#4c566a]">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#a3be8c] animate-pulse" />
          <span className="uppercase font-semibold text-[#81a1c1]">SYSTEM STATUS</span>
        </div>
        <span className="text-[#a3be8c] font-bold uppercase">{systemState}</span>
      </div>
    </aside>
  );
}
