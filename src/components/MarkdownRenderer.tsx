import React, { useState } from 'react';
import { Copy, Check, FileCode, Play, Sparkles } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onCodeExtracted?: (code: string, language: string, title: string) => void;
}

export default function MarkdownRenderer({ content, onCodeExtracted }: MarkdownRendererProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(blockId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe and precise custom parser to convert technical markdown into high-fidelity elements
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentBlock: { type: 'code' | 'list' | 'text'; items?: string[]; code?: string; lang?: string; title?: string } | null = null;
    let blockCounter = 0;

    const flushCurrentBlock = () => {
      if (!currentBlock) return;
      blockCounter++;
      const id = `block-${blockCounter}`;

      if (currentBlock.type === 'code') {
        const codeText = currentBlock.code || '';
        const lang = currentBlock.lang || 'typescript';
        const title = currentBlock.title || `source_file.${lang === 'typescript' ? 'ts' : lang === 'javascript' ? 'js' : lang}`;

        // Try to trigger extraction of artifacts
        if (onCodeExtracted) {
          onCodeExtracted(codeText, lang, title);
        }

        elements.push(
          <div key={id} className="my-6 border border-[#4c566a]/30 rounded-sm overflow-hidden bg-[#2e3440] shadow-2xl">
            <div className="flex justify-between items-center px-4 py-2.5 bg-[#1f232d] border-b border-[#4c566a]/30">
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-[#88c0d0]" />
                <span className="text-[10px] font-mono text-[#81a1c1] uppercase tracking-wider">
                  {title}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#a3be8c] animate-pulse"></span>
              </div>
              <button
                onClick={() => handleCopy(codeText, id)}
                className="text-[10px] font-mono text-[#d8dee9] hover:text-[#88c0d0] flex items-center gap-1.5 transition-colors uppercase cursor-pointer"
              >
                {copiedId === id ? (
                  <>
                    <Check className="w-3 h-3 text-[#a3be8c]" />
                    <span className="text-[#a3be8c]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-5 overflow-x-auto font-mono text-xs leading-relaxed text-[#eceff4] bg-[#1a1e26]/60">
              <pre className="whitespace-pre">
                <code>{renderSyntaxHighlighting(codeText, lang)}</code>
              </pre>
            </div>
          </div>
        );
      } else if (currentBlock.type === 'list') {
        elements.push(
          <ul key={id} className="pl-6 mb-5 space-y-2">
            {currentBlock.items?.map((item, index) => (
              <li key={index} className="relative text-sm text-[#d8dee9] leading-relaxed">
                {/* Rotated technical custom bullets */}
                <span className="absolute -left-5 top-[7px] w-1.5 h-1.5 bg-[#88c0d0] rotate-45 block" />
                {renderInlineStyles(item)}
              </li>
            ))}
          </ul>
        );
      }
      currentBlock = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block detection
      if (line.trim().startsWith('```')) {
        if (currentBlock && currentBlock.type === 'code') {
          flushCurrentBlock();
        } else {
          flushCurrentBlock();
          const lang = line.replace('```', '').trim() || 'typescript';
          let title = '';
          // Peek ahead if there is a filename comment
          if (i + 1 < lines.length && (lines[i+1].trim().startsWith('//') || lines[i+1].trim().startsWith('#'))) {
            const comment = lines[i+1].trim();
            const match = comment.match(/(?:[\w-]+\.)+\w+/);
            if (match) {
              title = match[0];
            }
          }
          currentBlock = { type: 'code', code: '', lang, title };
        }
        continue;
      }

      // Inside a code block
      if (currentBlock && currentBlock.type === 'code') {
        currentBlock.code = (currentBlock.code ? currentBlock.code + '\n' : '') + line;
        continue;
      }

      // List item detection
      const listMatch = line.trim().match(/^[*+-]\s+(.*)$/);
      if (listMatch) {
        if (!currentBlock || currentBlock.type !== 'list') {
          flushCurrentBlock();
          currentBlock = { type: 'list', items: [] };
        }
        currentBlock.items?.push(listMatch[1]);
        continue;
      }

      // Header detection
      const headerMatch = line.trim().match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        flushCurrentBlock();
        const level = headerMatch[1].length;
        const textContent = headerMatch[2];
        const key = `header-${i}`;

        if (level === 1) {
          elements.push(
            <h1 key={key} className="text-xl font-bold font-mono text-[#eceff4] border-b border-[#2d3545] pb-2 mb-4 mt-6 uppercase tracking-wider">
              {textContent}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2 key={key} className="text-base font-semibold font-mono text-[#8fbcbb] mb-3 mt-5 uppercase tracking-wider">
              {textContent}
            </h2>
          );
        } else {
          elements.push(
            <h3 key={key} className="text-sm font-medium font-mono text-[#81a1c1] mb-2 mt-4 uppercase">
              {textContent}
            </h3>
          );
        }
        continue;
      }

      // Normal text lines
      if (line.trim() === '') {
        flushCurrentBlock();
        continue;
      }

      if (!currentBlock || currentBlock.type !== 'text') {
        flushCurrentBlock();
        currentBlock = { type: 'text', items: [] };
      }
      currentBlock.items?.push(line);
    }

    flushCurrentBlock();

    // Render plain text elements if any remaining
    elements.forEach((el, index) => {
      if (React.isValidElement(el)) return;
    });

    return elements.length > 0 ? elements : <p className="text-sm text-[#d8dee9]">{text}</p>;
  };

  // Render inline styles like bold, code-tags
  const renderInlineStyles = (text: string) => {
    // Basic bold matcher (**bold**)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-[#88c0d0] font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="px-1.5 py-0.5 rounded-sm bg-[#2e3440] border border-[#4c566a]/30 font-mono text-xs text-[#8fbcbb]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Elegant syntax highlight rendering to match the classic Nord aesthetic of the screenshot
  const renderSyntaxHighlighting = (code: string, lang: string) => {
    const lines = code.split('\n');
    return lines.map((line, lineIdx) => {
      // Very simple syntax colorizer for keywords, classes, comments
      const tokens = tokenizeLine(line, lang);
      return (
        <div key={lineIdx} className="table-row">
          <span className="table-cell text-right pr-4 text-[#4c566a] select-none text-[10px] w-6">
            {lineIdx + 1}
          </span>
          <span className="table-cell">
            {tokens.map((token, tIdx) => (
              <span key={tIdx} className={token.className}>
                {token.text}
              </span>
            ))}
          </span>
        </div>
      );
    });
  };

  const tokenizeLine = (line: string, lang: string) => {
    // Comments
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return [{ text: line, className: 'text-[#616e88] italic' }];
    }

    const keywords = [
      'import', 'from', 'export', 'const', 'let', 'var', 'class', 'extends', 'void', 'return',
      'void', 'extends', 'override', 'super', 'interface', 'new', 'function', 'const', 'true', 'false',
      'as', 'if', 'else', 'for', 'while', 'async', 'await'
    ];

    // Splitting words and symbols
    const regex = /(\s+)|([a-zA-Z_]\w*)|([{}()\[\];.,+\-*\/=<>!&|?:"'])/g;
    const tokens: { text: string; className: string }[] = [];
    let match;
    let lastIndex = 0;

    // Direct match loops
    while ((match = regex.exec(line)) !== null) {
      const matchText = match[0];
      let className = 'text-[#d8dee9]';

      if (keywords.includes(matchText)) {
        className = 'text-[#81a1c1]'; // Keyword color (blue)
      } else if (matchText.match(/^[A-Z][a-zA-Z0-9]*$/)) {
        className = 'text-[#8fbcbb]'; // Class/Type color (teal)
      } else if (matchText.match(/^['"].*['"]$/) || matchText.match(/^["']/)) {
        className = 'text-[#a3be8c]'; // String color (green)
      } else if (matchText.match(/^[{}()\[\]]/)) {
        className = 'text-[#d8dee9]'; // Brackets
      } else if (matchText.match(/^[+\-*\/=<>!&|?:]/)) {
        className = 'text-[#81a1c1]'; // Operators
      } else if (line.includes('(' + matchText) || line.includes('.' + matchText)) {
        className = 'text-[#88c0d0]'; // Function calls
      }

      tokens.push({ text: matchText, className });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push({ text: line.substring(lastIndex), className: 'text-[#d8dee9]' });
    }

    return tokens.length > 0 ? tokens : [{ text: line, className: 'text-[#d8dee9]' }];
  };

  return <div className="markdown-content select-text">{parseContent(content)}</div>;
}
