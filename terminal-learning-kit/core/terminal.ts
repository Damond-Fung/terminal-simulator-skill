/**
 * Terminal Simulator - 终端模拟器核心逻辑
 * 框架无关的状态机和命令处理器
 */

import { TypeWriter, TypeWriterOptions } from './typewriter.js';

// ==================== 类型定义 ====================

export interface TerminalStep {
  id: string;
  command: string;
  output: string;
  description?: string;
  delayBefore?: number;    // 步骤前延迟（ms）
  delayAfter?: number;     // 步骤后延迟（ms）
  nextLabel?: string;      // 下一步按钮文本
}

export interface TerminalCommand {
  command: string;
  description?: string;
  handler: (args: string[]) => string | Promise<string> | { action: string };
}

export interface TerminalLine {
  id: string;
  type: 'system' | 'command' | 'output' | 'error';
  text: string;
  timestamp: number;
}

export type TerminalMode = 'guided' | 'free-type' | 'playground';

export interface PendingTerminalLine {
  type: 'command' | 'output';
  text: string;
}

export interface TerminalState {
  mode: TerminalMode;
  lines: TerminalLine[];
  pendingLine: PendingTerminalLine | null;
  currentStep: number;
  isTyping: boolean;
  isComplete: boolean;
  input: string;
  history: string[];
  historyIndex: number;
  suggestions: string[];
  suggestionIndex: number;
}

// ==================== 状态机事件 ====================

export type TerminalEvent =
  | { type: 'START' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SKIP' }
  | { type: 'RESET' }
  | { type: 'TYPE_COMMAND'; text: string }
  | { type: 'TYPE_OUTPUT'; text: string }
  | { type: 'EXECUTE_COMMAND'; command: string }
  | { type: 'INPUT_CHANGE'; value: string }
  | { type: 'HISTORY_UP' }
  | { type: 'HISTORY_DOWN' }
  | { type: 'TAB_COMPLETE' }
  | { type: 'STEP_COMPLETE' }
  | { type: 'ALL_COMPLETE' };

// ==================== TerminalSimulator 类 ====================

export class TerminalSimulator {
  private state: TerminalState;
  private steps: TerminalStep[];
  private commands: Map<string, TerminalCommand>;
  private typeWriter: TypeWriter | null = null;
  private lineIdCounter = 0;
  private listeners: Set<(state: TerminalState) => void> = new Set();
  private options: {
    maxHistory: number;
    maxLines: number;
    enableSound: boolean;
    welcomeMessage: string;
  };

  constructor(
    mode: TerminalMode = 'free-type',
    steps: TerminalStep[] = [],
    commands: TerminalCommand[] = [],
    options: Partial<TerminalSimulator['options']> = {}
  ) {
    this.state = {
      mode,
      lines: [],
      pendingLine: null,
      currentStep: -1,
      isTyping: false,
      isComplete: false,
      input: '',
      history: [],
      historyIndex: -1,
      suggestions: [],
      suggestionIndex: -1,
    };

    this.steps = steps;
    this.commands = new Map(commands.map(cmd => [cmd.command, cmd]));
    this.options = {
      maxHistory: 50,
      maxLines: 200,
      enableSound: false,
      welcomeMessage: 'Welcome! Type /help to get started.',
      ...options,
    };

    // 初始化欢迎消息
    if (mode === 'free-type') {
      this.addLine('system', this.options.welcomeMessage);
    }
  }

  // ==================== 公共 API ====================

  /**
   * 开始引导模式
   */
  start(): void {
    if (this.state.mode !== 'guided' || this.steps.length === 0) return;
    this.dispatch({ type: 'START' });
    this.processNextStep();
  }

  /**
   * 执行下一步
   */
  nextStep(): void {
    if (this.state.mode !== 'guided') return;
    this.dispatch({ type: 'NEXT_STEP' });
    this.processNextStep();
  }

  /**
   * 跳过当前动画
   */
  skip(): void {
    this.typeWriter?.skipToEnd();
  }

  /**
   * 重置终端
   */
  reset(): void {
    this.typeWriter?.destroy();
    this.typeWriter = null;
    this.lineIdCounter = 0;
    this.dispatch({ type: 'RESET' });

    if (this.state.mode === 'free-type') {
      this.addLine('system', this.options.welcomeMessage);
    }
  }

  /**
   * 执行命令（自由输入模式）
   */
  async executeCommand(input: string): Promise<string | { action: string } | null> {
    if (!input.trim()) return null;

    const trimmed = input.trim();
    this.addToHistory(trimmed);
    this.addLine('command', trimmed);
    this.dispatch({ type: 'EXECUTE_COMMAND', command: trimmed });

    // 处理特殊命令
    if (trimmed === '/clear') {
      this.clearLines();
      return { action: 'clear' };
    }

    // 查找匹配的命令
    const args = trimmed.split(/\s+/);
    const cmdName = args[0].startsWith('/') ? args[0] : `/${args[0]}`;
    const command = this.commands.get(cmdName) || this.commands.get(args[0]);

    if (command) {
      try {
        const result = await command.handler(args.slice(1));
        if (typeof result === 'string') {
          await this.typeOutput(result);
          return result;
        } else if (result && typeof result === 'object' && 'action' in result) {
          this.handleAction(result.action);
          return result;
        }
      } catch (error) {
        const message = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        this.addLine('error', message);
        return message;
      }
    } else {
      const message = `Command not found: ${trimmed}. Type /help for available commands.`;
      await this.typeOutput(message);
      return message;
    }

    return null;
  }

  /**
   * 处理输入变化
   */
  setInput(value: string): void {
    this.dispatch({ type: 'INPUT_CHANGE', value });
  }

  /**
   * 提交当前输入
   */
  async submitInput(): Promise<string | { action: string } | null> {
    const currentInput = this.state.input;
    this.dispatch({ type: 'INPUT_CHANGE', value: '' });
    return this.executeCommand(currentInput);
  }

  /**
   * 浏览历史记录
   */
  historyUp(): void {
    this.navigateHistory(-1);
  }

  historyDown(): void {
    this.navigateHistory(1);
  }

  /**
   * 命令补全
   */
  tabComplete(): void {
    this.handleTabCompletion();
  }

  /**
   * 处理键盘事件
   */
  handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        void this.submitInput();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.historyUp();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.historyDown();
        break;
      case 'Tab':
        event.preventDefault();
        this.tabComplete();
        break;
    }
  }

  /**
   * 获取当前状态
   */
  getState(): TerminalState {
    return {
      ...this.state,
      lines: [...this.state.lines],
      history: [...this.state.history],
      suggestions: [...this.state.suggestions],
      pendingLine: this.state.pendingLine ? { ...this.state.pendingLine } : null,
    };
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: TerminalState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.typeWriter?.destroy();
    this.listeners.clear();
  }

  // ==================== 私有方法 ====================

  private dispatch(event: TerminalEvent): void {
    const newState = this.reducer(this.state, event);
    if (newState !== this.state) {
      this.state = newState;
      this.notifyListeners();
    }
  }

  private reducer(state: TerminalState, event: TerminalEvent): TerminalState {
    switch (event.type) {
      case 'START':
        return { ...state, currentStep: 0, isComplete: false };
      
      case 'NEXT_STEP':
        return { ...state, currentStep: state.currentStep + 1 };
      
      case 'RESET':
        return {
          ...state,
          lines: [],
          pendingLine: null,
          currentStep: -1,
          isTyping: false,
          isComplete: false,
          input: '',
          suggestions: [],
          suggestionIndex: -1,
        };
      
      case 'TYPE_COMMAND':
        return {
          ...state,
          isTyping: true,
          pendingLine: { type: 'command', text: '' },
        };
      
      case 'TYPE_OUTPUT':
        return {
          ...state,
          isTyping: true,
          pendingLine: { type: 'output', text: '' },
        };
      
      case 'STEP_COMPLETE':
        return { ...state, isTyping: false, pendingLine: null };
      
      case 'ALL_COMPLETE':
        return { ...state, isTyping: false, isComplete: true, pendingLine: null };
      
      case 'INPUT_CHANGE':
        return { ...state, input: event.value, suggestions: [], suggestionIndex: -1 };
      
      case 'EXECUTE_COMMAND':
        return { ...state, input: '', suggestions: [], suggestionIndex: -1 };
      
      default:
        return state;
    }
  }

  private async processNextStep(): Promise<void> {
    const step = this.steps[this.state.currentStep];
    if (!step) {
      this.dispatch({ type: 'ALL_COMPLETE' });
      return;
    }

    // 延迟前等待
    if (step.delayBefore) {
      await this.delay(step.delayBefore);
    }

    // 打字输入命令
    await this.typeCommand(step.command);
    this.addLine('command', step.command);

    // 打字输出
    await this.typeOutput(step.output);
    this.addLine('output', step.output);

    // 延迟后等待
    if (step.delayAfter) {
      await this.delay(step.delayAfter);
    }

    this.dispatch({ type: 'STEP_COMPLETE' });

    // 检查是否完成所有步骤
    if (this.state.currentStep >= this.steps.length - 1) {
      this.dispatch({ type: 'ALL_COMPLETE' });
    }
  }

  private typeCommand(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.dispatch({ type: 'TYPE_COMMAND', text });
      
      this.typeWriter = new TypeWriter({
        text,
        speed: 25,
        onComplete: () => {
          this.setPendingLine(null);
          resolve();
        },
      });

      this.typeWriter.subscribe((state) => {
        this.setPendingLine({ type: 'command', text: state.displayedText });
      });

      this.typeWriter.start();
    });
  }

  private typeOutput(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.dispatch({ type: 'TYPE_OUTPUT', text });

      this.typeWriter = new TypeWriter({
        text,
        speed: 15,
        onComplete: () => {
          this.setPendingLine(null);
          resolve();
        },
      });

      this.typeWriter.subscribe((state) => {
        this.setPendingLine({ type: 'output', text: state.displayedText });
      });

      this.typeWriter.start();
    });
  }

  private addLine(type: TerminalLine['type'], text: string): void {
    const line: TerminalLine = {
      id: `line-${++this.lineIdCounter}`,
      type,
      text,
      timestamp: Date.now(),
    };

    const newLines = [...this.state.lines, line].slice(-this.options.maxLines);
    this.state = { ...this.state, lines: newLines };
    this.notifyListeners();
  }

  private clearLines(): void {
    this.state = { ...this.state, lines: [], pendingLine: null };
    this.notifyListeners();
  }

  private addToHistory(command: string): void {
    const newHistory = [...this.state.history.filter(h => h !== command), command].slice(-this.options.maxHistory);
    this.state = { ...this.state, history: newHistory, historyIndex: -1 };
  }

  private setPendingLine(pendingLine: PendingTerminalLine | null): void {
    this.state = { ...this.state, pendingLine };
    this.notifyListeners();
  }

  private navigateHistory(direction: number): void {
    const { history, historyIndex } = this.state;
    if (history.length === 0) return;

    let newIndex = historyIndex + direction;
    newIndex = Math.max(-1, Math.min(newIndex, history.length - 1));

    const input = newIndex === -1 ? '' : history[history.length - 1 - newIndex];
    this.state = { ...this.state, historyIndex: newIndex, input };
    this.notifyListeners();
  }

  private handleTabCompletion(): void {
    const { input, suggestions, suggestionIndex } = this.state;
    
    if (suggestions.length > 0) {
      // 循环选择建议
      const newIndex = (suggestionIndex + 1) % suggestions.length;
      this.state = { ...this.state, suggestionIndex: newIndex, input: suggestions[newIndex] };
    } else if (input.trim()) {
      // 生成建议
      const availableCommands = Array.from(this.commands.keys());
      const matches = availableCommands.filter(cmd => cmd.startsWith(input.trim()));
      
      if (matches.length === 1) {
        this.state = { ...this.state, input: matches[0] };
      } else if (matches.length > 1) {
        this.state = { ...this.state, suggestions: matches, suggestionIndex: 0, input: matches[0] };
      }
    }
    
    this.notifyListeners();
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'clear':
        this.clearLines();
        break;
      // 可以扩展更多动作
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}

// ==================== 工具函数 ====================

/**
 * 创建预设命令集
 */
export function createDefaultCommands(): TerminalCommand[] {
  return [
    {
      command: '/help',
      description: 'Show available commands',
      handler: () => `Available commands:
  /help     - Show this help message
  /clear    - Clear the terminal
  /version  - Show version info`,
    },
    {
      command: '/clear',
      description: 'Clear the terminal',
      handler: () => ({ action: 'clear' }),
    },
    {
      command: '/version',
      description: 'Show version info',
      handler: () => 'Terminal Learning Kit v1.0.0',
    },
  ];
}

export default TerminalSimulator;
