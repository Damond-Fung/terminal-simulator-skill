/**
 * TypeWriter - 打字机动画核心逻辑
 * 框架无关，可在任何 JavaScript 环境中使用
 */
class TypeWriter {
    constructor(options) {
        this.charIndex = 0;
        this.rafId = null;
        this.lastTime = 0;
        this.isRunning = false;
        this.state = {
            displayedText: '',
            isTyping: false,
            progress: 0
        };
        this.listeners = new Set();
        this.text = options.text;
        this.speed = options.speed ?? 30;
        this.enabled = options.enabled ?? true;
        this.onComplete = options.onComplete;
        this.onChar = options.onChar;
        if (!this.enabled) {
            this.state.displayedText = this.text;
            this.state.progress = 1;
        }
    }
    /**
     * 开始打字动画
     */
    start() {
        if (this.isRunning || !this.enabled)
            return;
        this.isRunning = true;
        this.charIndex = 0;
        this.lastTime = 0;
        this.updateState({
            displayedText: '',
            isTyping: true,
            progress: 0
        });
        this.rafId = requestAnimationFrame((timestamp) => this.animate(timestamp));
    }
    /**
     * 停止动画
     */
    stop() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.isRunning = false;
        this.updateState({ ...this.state, isTyping: false });
    }
    /**
     * 跳过动画，直接显示完整文本
     */
    skipToEnd() {
        this.stop();
        this.charIndex = this.text.length;
        this.updateState({
            displayedText: this.text,
            isTyping: false,
            progress: 1
        });
        this.onComplete?.();
    }
    /**
     * 重置状态
     */
    reset() {
        this.stop();
        this.charIndex = 0;
        this.updateState({
            displayedText: this.enabled ? '' : this.text,
            isTyping: false,
            progress: this.enabled ? 0 : 1
        });
    }
    /**
     * 更新配置
     */
    update(options) {
        if (options.text !== undefined)
            this.text = options.text;
        if (options.speed !== undefined)
            this.speed = options.speed;
        if (options.enabled !== undefined) {
            this.enabled = options.enabled;
            if (!this.enabled) {
                this.skipToEnd();
            }
        }
        this.onComplete = options.onComplete ?? this.onComplete;
        this.onChar = options.onChar ?? this.onChar;
    }
    /**
     * 获取当前状态
     */
    getState() {
        return { ...this.state };
    }
    /**
     * 订阅状态变化
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /**
     * 销毁实例
     */
    destroy() {
        this.stop();
        this.listeners.clear();
    }
    animate(timestamp) {
        if (!this.lastTime)
            this.lastTime = timestamp;
        const elapsed = timestamp - this.lastTime;
        if (elapsed >= this.speed) {
            this.lastTime = timestamp;
            this.charIndex++;
            const displayedText = this.text.slice(0, this.charIndex);
            const progress = this.charIndex / this.text.length;
            this.updateState({
                displayedText,
                isTyping: true,
                progress
            });
            // 触发字符回调
            if (this.onChar && this.charIndex <= this.text.length) {
                this.onChar(this.text[this.charIndex - 1], this.charIndex - 1);
            }
            // 检查是否完成
            if (this.charIndex >= this.text.length) {
                this.isRunning = false;
                this.updateState({
                    displayedText: this.text,
                    isTyping: false,
                    progress: 1
                });
                this.onComplete?.();
                return;
            }
        }
        this.rafId = requestAnimationFrame((t) => this.animate(t));
    }
    updateState(newState) {
        this.state = newState;
        this.listeners.forEach(listener => listener(newState));
    }
}
/**
 * 检查用户是否偏好减少动画
 */
function prefersReducedMotion() {
    if (typeof window === 'undefined')
        return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
/**
 * 创建智能 TypeWriter（自动检测减少动画偏好）
 */
function createSmartTypeWriter(options) {
    const shouldAnimate = options.enabled ?? true;
    return new TypeWriter({
        ...options,
        enabled: shouldAnimate && !prefersReducedMotion()
    });
}

/**
 * Terminal Simulator - 终端模拟器核心逻辑
 * 框架无关的状态机和命令处理器
 */
// ==================== TerminalSimulator 类 ====================
class TerminalSimulator {
    constructor(mode = 'free-type', steps = [], commands = [], options = {}) {
        this.typeWriter = null;
        this.lineIdCounter = 0;
        this.listeners = new Set();
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
    start() {
        if (this.state.mode !== 'guided' || this.steps.length === 0)
            return;
        this.dispatch({ type: 'START' });
        this.processNextStep();
    }
    /**
     * 执行下一步
     */
    nextStep() {
        if (this.state.mode !== 'guided')
            return;
        this.dispatch({ type: 'NEXT_STEP' });
        this.processNextStep();
    }
    /**
     * 跳过当前动画
     */
    skip() {
        this.typeWriter?.skipToEnd();
    }
    /**
     * 重置终端
     */
    reset() {
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
    async executeCommand(input) {
        if (!input.trim())
            return null;
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
                }
                else if (result && typeof result === 'object' && 'action' in result) {
                    this.handleAction(result.action);
                    return result;
                }
            }
            catch (error) {
                const message = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
                this.addLine('error', message);
                return message;
            }
        }
        else {
            const message = `Command not found: ${trimmed}. Type /help for available commands.`;
            await this.typeOutput(message);
            return message;
        }
        return null;
    }
    /**
     * 处理输入变化
     */
    setInput(value) {
        this.dispatch({ type: 'INPUT_CHANGE', value });
    }
    /**
     * 提交当前输入
     */
    async submitInput() {
        const currentInput = this.state.input;
        this.dispatch({ type: 'INPUT_CHANGE', value: '' });
        return this.executeCommand(currentInput);
    }
    /**
     * 浏览历史记录
     */
    historyUp() {
        this.navigateHistory(-1);
    }
    historyDown() {
        this.navigateHistory(1);
    }
    /**
     * 命令补全
     */
    tabComplete() {
        this.handleTabCompletion();
    }
    /**
     * 处理键盘事件
     */
    handleKeyDown(event) {
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
    getState() {
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
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /**
     * 销毁实例
     */
    destroy() {
        this.typeWriter?.destroy();
        this.listeners.clear();
    }
    // ==================== 私有方法 ====================
    dispatch(event) {
        const newState = this.reducer(this.state, event);
        if (newState !== this.state) {
            this.state = newState;
            this.notifyListeners();
        }
    }
    reducer(state, event) {
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
    async processNextStep() {
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
    typeCommand(text) {
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
    typeOutput(text) {
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
    addLine(type, text) {
        const line = {
            id: `line-${++this.lineIdCounter}`,
            type,
            text,
            timestamp: Date.now(),
        };
        const newLines = [...this.state.lines, line].slice(-this.options.maxLines);
        this.state = { ...this.state, lines: newLines };
        this.notifyListeners();
    }
    clearLines() {
        this.state = { ...this.state, lines: [], pendingLine: null };
        this.notifyListeners();
    }
    addToHistory(command) {
        const newHistory = [...this.state.history.filter(h => h !== command), command].slice(-this.options.maxHistory);
        this.state = { ...this.state, history: newHistory, historyIndex: -1 };
    }
    setPendingLine(pendingLine) {
        this.state = { ...this.state, pendingLine };
        this.notifyListeners();
    }
    navigateHistory(direction) {
        const { history, historyIndex } = this.state;
        if (history.length === 0)
            return;
        let newIndex = historyIndex + direction;
        newIndex = Math.max(-1, Math.min(newIndex, history.length - 1));
        const input = newIndex === -1 ? '' : history[history.length - 1 - newIndex];
        this.state = { ...this.state, historyIndex: newIndex, input };
        this.notifyListeners();
    }
    handleTabCompletion() {
        const { input, suggestions, suggestionIndex } = this.state;
        if (suggestions.length > 0) {
            // 循环选择建议
            const newIndex = (suggestionIndex + 1) % suggestions.length;
            this.state = { ...this.state, suggestionIndex: newIndex, input: suggestions[newIndex] };
        }
        else if (input.trim()) {
            // 生成建议
            const availableCommands = Array.from(this.commands.keys());
            const matches = availableCommands.filter(cmd => cmd.startsWith(input.trim()));
            if (matches.length === 1) {
                this.state = { ...this.state, input: matches[0] };
            }
            else if (matches.length > 1) {
                this.state = { ...this.state, suggestions: matches, suggestionIndex: 0, input: matches[0] };
            }
        }
        this.notifyListeners();
    }
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clearLines();
                break;
            // 可以扩展更多动作
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.getState()));
    }
}
// ==================== 工具函数 ====================
/**
 * 创建预设命令集
 */
function createDefaultCommands() {
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

/**
 * Terminal Learning Kit - Core
 * 框架无关的核心逻辑
 */
// 版本信息
const VERSION = '1.0.0';

export { TerminalSimulator, TypeWriter, VERSION, createDefaultCommands, createSmartTypeWriter, prefersReducedMotion };
//# sourceMappingURL=index.esm.js.map
