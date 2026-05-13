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
interface TerminalLine {
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
declare class TerminalSimulator {
    private state;
    private steps;
    private commands;
    private typeWriter;
    private lineIdCounter;
    private listeners;
    private options;
    constructor(mode?: TerminalMode, steps?: TerminalStep[], commands?: TerminalCommand[], options?: Partial<TerminalSimulator['options']>);
    /**
     * 开始引导模式
     */
    start(): void;
    /**
     * 执行下一步
     */
    nextStep(): void;
    /**
     * 跳过当前动画
     */
    skip(): void;
    /**
     * 重置终端
     */
    reset(): void;
    /**
     * 执行命令（自由输入模式）
     */
    executeCommand(input: string): Promise<string | {
        action: string;
    } | null>;
    /**
     * 处理输入变化
     */
    setInput(value: string): void;
    /**
     * 提交当前输入
     */
    submitInput(): Promise<string | {
        action: string;
    } | null>;
    /**
     * 浏览历史记录
     */
    historyUp(): void;
    historyDown(): void;
    /**
     * 命令补全
     */
    tabComplete(): void;
    /**
     * 处理键盘事件
     */
    handleKeyDown(event: KeyboardEvent): void;
    /**
     * 获取当前状态
     */
    getState(): TerminalState;
    /**
     * 订阅状态变化
     */
    subscribe(listener: (state: TerminalState) => void): () => void;
    /**
     * 销毁实例
     */
    destroy(): void;
    private dispatch;
    private reducer;
    private processNextStep;
    private typeCommand;
    private typeOutput;
    private addLine;
    private clearLines;
    private addToHistory;
    private setPendingLine;
    private navigateHistory;
    private handleTabCompletion;
    private handleAction;
    private delay;
    private notifyListeners;
}
/**
 * 创建预设命令集
 */
declare function createDefaultCommands(): TerminalCommand[];

/**
 * Terminal Learning Kit - Core
 * 框架无关的核心逻辑
 */

declare const VERSION = "1.0.0";

export { TerminalSimulator, TypeWriter, VERSION, createDefaultCommands, createSmartTypeWriter, prefersReducedMotion };
export type { PendingTerminalLine, TerminalCommand, TerminalEvent, TerminalLine, TerminalMode, TerminalState, TerminalStep, TypeWriterOptions, TypeWriterState };
