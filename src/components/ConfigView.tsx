import React, { useState } from 'react';
import { Settings, Cpu, Shield, AlertTriangle, KeyRound, Sparkles, Check } from 'lucide-react';
import { SystemConfig } from '../types';

interface ConfigViewProps {
  systemConfig: SystemConfig;
  onUpdateConfig: (newConfig: Partial<SystemConfig>) => void;
}

export default function ConfigView({ systemConfig, onUpdateConfig }: ConfigViewProps) {
  const [temp, setTemp] = useState(systemConfig.temperature);
  const [instruction, setInstruction] = useState(systemConfig.systemInstruction);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateConfig({
      temperature: temp,
      systemInstruction: instruction
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#242933] overflow-hidden select-none">
      {/* View Header */}
      <div className="p-8 border-b border-[#2d3545]/50 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold font-mono text-[#eceff4] uppercase tracking-wider">
            Workspace Configuration
          </h2>
          <p className="text-[11px] text-[#4c566a] font-mono tracking-widest uppercase mt-1">
            Fine-tune agent parameters, state parameters, and instruction overrides
          </p>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[700px] mx-auto space-y-8">
          {/* Section 1: LLM Parameters */}
          <div className="bg-[#1a1e26]/50 border border-[#2d3545]/50 p-6 rounded-sm space-y-6">
            <h3 className="text-xs font-bold font-mono text-[#88c0d0] uppercase tracking-wider flex items-center gap-2 border-b border-[#2d3545]/30 pb-3">
              <Cpu className="w-4 h-4" />
              <span>Inference Engine Tuning</span>
            </h3>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-[#d8dee9] font-semibold">Temperature: {temp.toFixed(2)}</span>
                <span className="text-[#4c566a] uppercase">Precise vs Creative</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#2e3440] rounded-lg appearance-none cursor-pointer accent-[#88c0d0]"
              />
              <div className="flex justify-between font-mono text-[9px] text-[#4c566a] uppercase">
                <span>0.0 (Deterministic)</span>
                <span>1.0 (Balanced)</span>
                <span>1.5 (Dynamic)</span>
              </div>
            </div>

            {/* System Prompt Instruction */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-[#d8dee9] font-semibold">System Instructions Override</span>
                <span className="text-[#4c566a] uppercase">Persona Scope</span>
              </div>
              <textarea
                rows={5}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full bg-[#242933] border border-[#4c566a]/30 focus:border-[#88c0d0]/50 rounded-sm p-3.5 font-mono text-xs text-[#eceff4] outline-none focus:ring-0 resize-none custom-scrollbar"
                placeholder="Type custom rules or personality instructions for Gemini to follow..."
              />
            </div>
          </div>

          {/* Section 2: Platform Secrets Notification */}
          <div className="bg-[#1a1e26]/30 border border-[#2d3545]/30 p-6 rounded-sm space-y-4">
            <h3 className="text-xs font-bold font-mono text-[#81a1c1] uppercase tracking-wider flex items-center gap-2 border-b border-[#2d3545]/20 pb-3">
              <Shield className="w-4 h-4" />
              <span>Secure Environments & Credentials</span>
            </h3>

            <p className="text-xs font-mono text-[#d8dee9] leading-relaxed">
              For real-time generation, your <strong className="text-[#88c0d0]">GEMINI_API_KEY</strong> environment variable is automatically read.
            </p>

            <div className="p-4 bg-[#2e3440]/60 rounded-sm border border-[#4c566a]/20 flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-[#ebcb8b] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold font-mono text-[#ebcb8b] uppercase">No Custom API Forms</h4>
                <p className="text-[11px] text-[#eceff4]/70 font-mono leading-relaxed mt-1">
                  In accordance with high platform standards, this application respects standard credential variables and avoids unsafe forms or modal dialog fields asking for secrets. Define keys under the <strong className="text-[#88c0d0]">Settings &gt; Secrets</strong> sidebar panel.
                </p>
              </div>
            </div>
          </div>

          {/* Save Action Bar */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-[#88c0d0] hover:bg-[#88c0d0]/90 text-[#242933] rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-lg"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-[#242933]" />
                  <span>Config Saved</span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  <span>Apply Configurations</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
