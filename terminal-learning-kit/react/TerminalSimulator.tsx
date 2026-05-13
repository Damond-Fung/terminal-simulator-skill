/**
 * TerminalSimulator React Component
 * 终端模拟器组件
 */

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  TerminalSimulator as TerminalSimulatorCore,
  TerminalStep,
  TerminalCommand,
  TerminalState,
  createDefaultCommands,
} from '../core/terminal.js';
import { TerminalLine } from './TerminalLine.js';

export interface TerminalSimulatorProps {
  mode?: 'guided' | 'free-type' | 'playground';
  steps?: TerminalStep[];
  commands?: TerminalCommand[];
  title?: string;
  variant?: 'macos' | 'windows' | 'ubuntu' | 'minimal';
  theme?: 'dark' | 'light' | 'high-contrast';
  autoPlay?: boolean;
  controls?: boolean;
  welcomeMessage?: string;
  prompt?: string;
  className?: string;
  onStepComplete?: (step: TerminalStep) => void;
  onAllComplete?: () => void;
  onCommand?: (command: string, output: string) => void;
}

const themeStyles = {
  dark: {
    '--terminal-bg': '#1c1917',
    '--terminal-fg': '#e7e5e4',
    '--terminal-border': '#44403c',
    '--terminal-header-bg': '#1c1917',
    '--terminal-header-text': '#e7e5e4',
    '--terminal-footer-bg': '#171412',
    '--terminal-text-muted': '#a8a29e',
    '--terminal-prompt': '#fbbf24',
    '--terminal-cursor': '#fbbf24',
    '--terminal-button-bg': '#f59e0b',
    '--terminal-command': '#e7e5e4',
    '--terminal-output': '#d6d3d1',
    '--terminal-system': '#a8a29e',
    '--terminal-error': '#ef4444',
  },
  light: {
    '--terminal-bg': '#fafaf9',
    '--terminal-fg': '#1c1917',
    '--terminal-border': '#d6d3d1',
    '--terminal-header-bg': '#f5f5f4',
    '--terminal-header-text': '#1c1917',
    '--terminal-footer-bg': '#f5f5f4',
    '--terminal-text-muted': '#57534e',
    '--terminal-prompt': '#b45309',
    '--terminal-cursor': '#b45309',
    '--terminal-button-bg': '#d97706',
    '--terminal-command': '#1c1917',
    '--terminal-output': '#44403c',
    '--terminal-system': '#57534e',
    '--terminal-error': '#dc2626',
  },
  'high-contrast': {
    '--terminal-bg': '#000000',
    '--terminal-fg': '#ffffff',
    '--terminal-border': '#ffffff',
    '--terminal-header-bg': '#000000',
    '--terminal-header-text': '#ffffff',
    '--terminal-footer-bg': '#000000',
    '--terminal-text-muted': '#d4d4d8',
    '--terminal-prompt': '#ffff00',
    '--terminal-cursor': '#ffff00',
    '--terminal-button-bg': '#2563eb',
    '--terminal-command': '#ffffff',
    '--terminal-output': '#ffffff',
    '--terminal-system': '#d4d4d8',
    '--terminal-error': '#ff6b6b',
  },
} as const;

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  mode = 'free-type',
  steps = [],
  commands = [],
  title = 'Terminal',
  variant = 'macos',
  theme = 'dark',
  autoPlay = false,
  controls = true,
  welcomeMessage = 'Welcome! Type /help to get started.',
  prompt = '>',
  className = '',
  onStepComplete,
  onAllComplete,
  onCommand,
}) => {
  const [state, setState] = useState<TerminalState | null>(null);
  const [input, setInput] = useState('');
  const terminalRef = useRef<TerminalSimulatorCore | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastCompletedStepRef = useRef(-1);
  const hasCompletedRef = useRef(false);

  const allCommands = useMemo(
    () => [...createDefaultCommands(), ...commands],
    [commands],
  );

  // 初始化终端模拟器
  useEffect(() => {
    terminalRef.current = new TerminalSimulatorCore(
      mode,
      steps,
      allCommands,
      {
        maxHistory: 50,
        maxLines: 200,
        enableSound: false,
        welcomeMessage,
      }
    );

    const unsubscribe = terminalRef.current.subscribe((newState) => {
      setState(newState);
      
      // 自动滚动到底部
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });

    // 初始状态
    setState(terminalRef.current.getState());

    // 自动播放
    if (mode === 'guided' && autoPlay && steps.length > 0) {
      terminalRef.current.start();
    }

    return () => {
      unsubscribe();
      terminalRef.current?.destroy();
    };
  }, [mode, steps, allCommands, autoPlay, welcomeMessage]);

  useEffect(() => {
    if (!state) return;
    setInput(state.input);
  }, [state]);

  useEffect(() => {
    if (!state) return;

    if (!state.isTyping && state.currentStep >= 0 && state.currentStep !== lastCompletedStepRef.current) {
      const completedStep = steps[state.currentStep];
      if (completedStep) {
        lastCompletedStepRef.current = state.currentStep;
        onStepComplete?.(completedStep);
      }
    }

    if (state.isComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onAllComplete?.();
    }

    if (!state.isComplete) {
      hasCompletedRef.current = false;
    }
  }, [state, steps, onStepComplete, onAllComplete]);

  // 处理开始/下一步
  const handleStart = useCallback(() => {
    lastCompletedStepRef.current = -1;
    hasCompletedRef.current = false;
    terminalRef.current?.start();
  }, []);

  const handleNext = useCallback(() => {
    terminalRef.current?.nextStep();
  }, []);

  const handleSkip = useCallback(() => {
    terminalRef.current?.skip();
  }, []);

  const handleReset = useCallback(() => {
    lastCompletedStepRef.current = -1;
    hasCompletedRef.current = false;
    terminalRef.current?.reset();
    setInput('');
  }, []);

  // 处理输入
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    terminalRef.current?.setInput(value);
  }, []);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!terminalRef.current) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        {
          const submittedInput = input.trim();
          const result = await terminalRef.current.submitInput();

          if (submittedInput) {
            const output =
              typeof result === 'string'
                ? result
                : result && typeof result === 'object' && 'action' in result
                  ? `[action:${result.action}]`
                  : '';
            onCommand?.(submittedInput, output);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        terminalRef.current.historyUp();
        break;
      case 'ArrowDown':
        e.preventDefault();
        terminalRef.current.historyDown();
        break;
      case 'Tab':
        e.preventDefault();
        terminalRef.current.tabComplete();
        break;
      default:
        break;
    }
  }, []);

  const currentThemeStyle = themeStyles[theme];

  // 窗口装饰
  const WindowChrome = () => {
    if (variant === 'minimal') return null;

    const dots = {
      macos: ['bg-[#ef4444]', 'bg-[#eab308]', 'bg-[#22c55e]'],
      windows: ['bg-red-500', 'bg-yellow-500', 'bg-green-500'],
      ubuntu: ['bg-[#e95420]', 'bg-white', 'bg-white'],
      minimal: [],
    }[variant];

    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--terminal-header-bg, #1c1917)]">
        {dots.map((color, i) => (
          <span key={i} className={`h-3 w-3 rounded-full ${color}`} />
        ))}
        <span className="ml-2 text-xs text-[var(--terminal-header-text, #e7e5e4)]/60 truncate">
          {title}
        </span>
      </div>
    );
  };

  // 控制按钮
  const Controls = () => {
    if (!controls) return null;

    if (mode === 'guided') {
      // 引导模式控制
      if (state?.isComplete) {
        return (
          <div className="flex items-center justify-between border-t border-[var(--terminal-border, #44403c)] bg-[var(--terminal-footer-bg, #171412)] px-4 py-3">
            <span className="text-xs text-green-400">All steps complete!</span>
            <button
              onClick={handleReset}
              className="min-h-[44px] rounded-lg bg-[var(--terminal-button-bg, #f59e0b)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Reset
            </button>
          </div>
        );
      }

      if (state?.isTyping) {
        return (
          <div className="flex items-center justify-between border-t border-[var(--terminal-border, #44403c)] bg-[var(--terminal-footer-bg, #171412)] px-4 py-3">
            <span className="text-xs text-[var(--terminal-text-muted, #e7e5e4)]/70">Running...</span>
            <button
              onClick={handleSkip}
              className="min-h-[44px] rounded-lg bg-[var(--terminal-button-bg, #f59e0b)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Skip
            </button>
          </div>
        );
      }

      const currentStep = steps[state?.currentStep ?? 0];
      const isFirstStep = (state?.currentStep ?? -1) < 0;

      return (
        <div className="flex items-center justify-between border-t border-[var(--terminal-border, #44403c)] bg-[var(--terminal-footer-bg, #171412)] px-4 py-3">
          <div className="flex-1">
            {currentStep && (
              <p className="text-xs text-[var(--terminal-text-muted, #e7e5e4)]/70">
                {currentStep.description || `Step ${(state?.currentStep ?? 0) + 1}: ${currentStep.command}`}
              </p>
            )}
          </div>
          <button
            onClick={isFirstStep ? handleStart : handleNext}
            className="min-h-[44px] rounded-lg bg-[var(--terminal-button-bg, #f59e0b)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {isFirstStep ? 'Run' : currentStep?.nextLabel || 'Next Step'}
          </button>
        </div>
      );
    }

    // 自由输入模式不需要额外控制
    return null;
  };

  if (!state) return null;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--terminal-border, #44403c)] shadow-2xl ${className}`}
      role="application"
      aria-label={title}
      data-terminal-theme={theme}
      style={currentThemeStyle as React.CSSProperties}
    >
      {/* 窗口装饰 */}
      <WindowChrome />

      {/* 终端内容区 */}
      <div
        ref={scrollRef}
        className="overflow-y-auto bg-[var(--terminal-bg, #1c1917)] p-4 font-mono text-sm min-h-[280px] max-h-[480px]"
        dir="ltr"
      >
        {/* 历史行 */}
        {state.lines.map((line) => (
          <TerminalLine key={line.id} line={line} showCopy />
        ))}

        {state.pendingLine && (
          <TerminalLine
            line={{
              id: 'pending-line',
              type: state.pendingLine.type,
              text: state.pendingLine.text,
              timestamp: Date.now(),
            }}
            showCopy={false}
            isAnimating
          />
        )}

        {/* 自由输入模式输入框 */}
        {mode === 'free-type' && (
          <div className="flex items-center gap-2 mt-2">
            <span className="shrink-0 select-none text-[var(--terminal-prompt, #fbbf24)]" aria-hidden="true">
              {prompt}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-[var(--terminal-fg, #e7e5e4)] outline-none placeholder:text-[var(--terminal-fg, #e7e5e4)]/30 caret-[var(--terminal-cursor, #fbbf24)]"
              placeholder="Type a command..."
              aria-label="Terminal command input"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        {/* 建议列表 */}
        {state.suggestions.length > 1 && (
          <div className="mt-1 flex flex-wrap gap-2 pl-5">
            {state.suggestions.map((suggestion, index) => (
              <span
                key={suggestion}
                className={`text-xs ${index === state.suggestionIndex ? 'text-[var(--terminal-prompt, #fbbf24)]' : 'text-[var(--terminal-fg, #e7e5e4)]/50'}`}
              >
                {suggestion}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 控制区 */}
      <Controls />

      {/* 无障碍提示 */}
      <div className="sr-only" aria-live="polite" aria-atomic="false">
        {state.lines.length > 0 && state.lines[state.lines.length - 1].type === 'output'
          ? state.lines[state.lines.length - 1].text
          : ''}
      </div>
    </div>
  );
};

export default TerminalSimulator;
