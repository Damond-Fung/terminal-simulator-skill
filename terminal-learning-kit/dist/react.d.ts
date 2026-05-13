import React from 'react';

/**
 * TypeWriter React Component
 * 打字机动画组件
 */

interface TypeWriterProps {
    text: string;
    speed?: number;
    enabled?: boolean;
    cursor?: boolean;
    cursorStyle?: 'block' | 'line' | 'underline';
    className?: string;
    onComplete?: () => void;
    onChar?: (char: string, index: number) => void;
    skipOnClick?: boolean;
    pauseOnHover?: boolean;
    as?: keyof JSX.IntrinsicElements;
    children?: (displayedText: string, isTyping: boolean) => React.ReactNode;
}
declare const TypeWriter$1: React.FC<TypeWriterProps>;

/**
 * Terminal Simulator - 终端模拟器核心逻辑
 * 框架无关的状态机和命令处理器
 */
interface TerminalStep {
    id: string;
    command: string;
    output: string;
    description?: string;
    delayBefore?: number;
    delayAfter?: number;
    nextLabel?: string;
}
interface TerminalCommand {
    command: string;
    description?: string;
    handler: (args: string[]) => string | Promise<string> | {
        action: string;
    };
}
interface TerminalLine$1 {
    id: string;
    type: 'system' | 'command' | 'output' | 'error';
    text: string;
    timestamp: number;
}
type TerminalMode = 'guided' | 'free-type' | 'playground';
interface PendingTerminalLine {
    type: 'command' | 'output';
    text: string;
}
interface TerminalState {
    mode: TerminalMode;
    lines: TerminalLine$1[];
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
type TerminalEvent = {
    type: 'START';
} | {
    type: 'NEXT_STEP';
} | {
    type: 'PREV_STEP';
} | {
    type: 'SKIP';
} | {
    type: 'RESET';
} | {
    type: 'TYPE_COMMAND';
    text: string;
} | {
    type: 'TYPE_OUTPUT';
    text: string;
} | {
    type: 'EXECUTE_COMMAND';
    command: string;
} | {
    type: 'INPUT_CHANGE';
    value: string;
} | {
    type: 'HISTORY_UP';
} | {
    type: 'HISTORY_DOWN';
} | {
    type: 'TAB_COMPLETE';
} | {
    type: 'STEP_COMPLETE';
} | {
    type: 'ALL_COMPLETE';
};
/**
 * 创建预设命令集
 */
declare function createDefaultCommands(): TerminalCommand[];

/**
 * TerminalLine React Component
 * 终端单行显示组件
 */

interface TerminalLineProps {
    line: TerminalLine$1;
    showCopy?: boolean;
    isAnimating?: boolean;
    className?: string;
    onCopy?: (text: string) => void;
}
declare const TerminalLine: React.FC<TerminalLineProps>;

/**
 * TerminalSimulator React Component
 * 终端模拟器组件
 */

interface TerminalSimulatorProps {
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
declare const TerminalSimulator: React.FC<TerminalSimulatorProps>;

/**
 * TypeWriter - 打字机动画核心逻辑
 * 框架无关，可在任何 JavaScript 环境中使用
 */
interface TypeWriterOptions {
    text: string;
    speed?: number;
    enabled?: boolean;
    onComplete?: () => void;
    onChar?: (char: string, index: number) => void;
}
interface TypeWriterState {
    displayedText: string;
    isTyping: boolean;
    progress: number;
}
declare class TypeWriter {
    private text;
    private speed;
    private enabled;
    private onComplete?;
    private onChar?;
    private charIndex;
    private rafId;
    private lastTime;
    private isRunning;
    private state;
    private listeners;
    constructor(options: TypeWriterOptions);
    /**
     * 开始打字动画
     */
    start(): void;
    /**
     * 停止动画
     */
    stop(): void;
    /**
     * 跳过动画，直接显示完整文本
     */
    skipToEnd(): void;
    /**
     * 重置状态
     */
    reset(): void;
    /**
     * 更新配置
     */
    update(options: Partial<TypeWriterOptions>): void;
    /**
     * 获取当前状态
     */
    getState(): TypeWriterState;
    /**
     * 订阅状态变化
     */
    subscribe(listener: (state: TypeWriterState) => void): () => void;
    /**
     * 销毁实例
     */
    destroy(): void;
    private animate;
    private updateState;
}
/**
 * 检查用户是否偏好减少动画
 */
declare function prefersReducedMotion(): boolean;
/**
 * 创建智能 TypeWriter（自动检测减少动画偏好）
 */
declare function createSmartTypeWriter(options: TypeWriterOptions): TypeWriter;

/**
 * Terminal Learning Kit - Core
 * 框架无关的核心逻辑
 */

declare const VERSION = "1.0.0";

export { TerminalLine, TerminalSimulator, TypeWriter$1 as TypeWriter, VERSION, createDefaultCommands, createSmartTypeWriter, prefersReducedMotion };
export type { PendingTerminalLine, TerminalCommand, TerminalEvent, TerminalLineProps, TerminalMode, TerminalSimulatorProps, TerminalState, TerminalStep, TypeWriterOptions, TypeWriterProps, TypeWriterState };
