/**
 * Terminal Simulator - 终端模拟器核心逻辑
 * 框架无关的状态机和命令处理器
 */
export interface TerminalStep {
    id: string;
    command: string;
    output: string;
    description?: string;
    delayBefore?: number;
    delayAfter?: number;
    nextLabel?: string;
}
export interface TerminalCommand {
    command: string;
    description?: string;
    handler: (args: string[]) => string | Promise<string> | {
        action: string;
    };
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
export type TerminalEvent = {
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
export declare class TerminalSimulator {
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
export declare function createDefaultCommands(): TerminalCommand[];
export default TerminalSimulator;
//# sourceMappingURL=terminal.d.ts.map