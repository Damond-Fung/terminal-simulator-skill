/**
 * TerminalLine React Component
 * 终端单行显示组件
 */

import React, { useState } from 'react';
import { TerminalLine as TerminalLineType } from '../core/terminal.js';

export interface TerminalLineProps {
  line: TerminalLineType;
  showCopy?: boolean;
  isAnimating?: boolean;
  className?: string;
  onCopy?: (text: string) => void;
}

export const TerminalLine: React.FC<TerminalLineProps> = ({
  line,
  showCopy = true,
  isAnimating = false,
  className = '',
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(line.text);
      setCopied(true);
      onCopy?.(line.text);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // 根据类型设置样式
  const getTypeStyles = () => {
    switch (line.type) {
      case 'command':
        return 'text-[var(--terminal-command, #e7e5e4)]';
      case 'output':
        return 'text-[var(--terminal-output, #d6d3d1)] border-l-2 border-[var(--terminal-border, #44403c)] pl-3';
      case 'error':
        return 'text-[var(--terminal-error, #ef4444)]';
      case 'system':
        return 'text-[var(--terminal-system, #a8a29e)] italic';
      default:
        return '';
    }
  };

  return (
    <div className={`group relative mb-2 ${className}`}>
      <div className="flex items-start gap-2">
        {/* 命令提示符 */}
        {line.type === 'command' && (
          <span 
            className="shrink-0 select-none text-[var(--terminal-prompt, #fbbf24)]"
            aria-hidden="true"
          >
            {'>'}
          </span>
        )}
        
        {/* 文本内容 */}
        <pre 
          className={`flex-1 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed ${getTypeStyles()}`}
        >
          {line.text}
          {isAnimating && (
            <span 
              className="inline-block h-4 w-1.5 animate-pulse motion-reduce:animate-none bg-[var(--terminal-cursor, #fbbf24)] align-middle ml-0.5"
              aria-hidden="true"
            />
          )}
        </pre>
      </div>

      {/* 复制按钮 */}
      {showCopy && !isAnimating && line.text.trim() && (
        <button
          onClick={handleCopy}
          className="absolute right-1 top-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-white/10"
          title={copied ? 'Copied!' : 'Copy'}
          aria-label={`Copy ${line.type}`}
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default TerminalLine;
