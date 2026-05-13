'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');

/**
 * TypeWriter - 打字机动画核心逻辑
 * 框架无关，可在任何 JavaScript 环境中使用
 */
let TypeWriter$1 = class TypeWriter {
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
};
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
    return new TypeWriter$1({
        ...options,
        enabled: shouldAnimate && !prefersReducedMotion()
    });
}

const TypeWriter = ({ text, speed = 30, enabled = true, cursor = true, cursorStyle = 'block', className = '', onComplete, onChar, skipOnClick = false, pauseOnHover = false, as: Component = 'span', children, }) => {
    const [displayedText, setDisplayedText] = React.useState('');
    const [isTyping, setIsTyping] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);
    const typeWriterRef = React.useRef(null);
    const containerRef = React.useRef(null);
    // 初始化 TypeWriter
    React.useEffect(() => {
        const shouldAnimate = enabled && !prefersReducedMotion();
        typeWriterRef.current = new TypeWriter$1({
            text,
            speed,
            enabled: shouldAnimate,
            onComplete,
            onChar,
        });
        const unsubscribe = typeWriterRef.current.subscribe((state) => {
            setDisplayedText(state.displayedText);
            setIsTyping(state.isTyping);
        });
        if (shouldAnimate) {
            typeWriterRef.current.start();
        }
        else {
            setDisplayedText(text);
        }
        return () => {
            unsubscribe();
            typeWriterRef.current?.destroy();
        };
    }, [text, speed, enabled]);
    // 处理点击跳过
    const handleClick = React.useCallback(() => {
        if (skipOnClick && isTyping) {
            typeWriterRef.current?.skipToEnd();
        }
    }, [skipOnClick, isTyping]);
    // 处理悬停暂停
    const handleMouseEnter = React.useCallback(() => {
        if (pauseOnHover && isTyping) {
            setIsPaused(true);
            // 注意：当前实现不支持暂停，可以通过扩展 TypeWriter 实现
        }
    }, [pauseOnHover, isTyping]);
    const handleMouseLeave = React.useCallback(() => {
        if (pauseOnHover && isPaused) {
            setIsPaused(false);
        }
    }, [pauseOnHover, isPaused]);
    // 光标样式
    const cursorClass = {
        block: 'animate-pulse bg-current',
        line: 'animate-pulse bg-current w-0.5',
        underline: 'border-b-2 border-current animate-pulse',
    }[cursorStyle];
    const renderContent = () => {
        if (children) {
            return children(displayedText, isTyping);
        }
        return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [displayedText, cursor && isTyping && (jsxRuntime.jsx("span", { className: `inline-block align-middle ${cursorClass}`, style: {
                        width: cursorStyle === 'block' ? '0.6em' : cursorStyle === 'line' ? undefined : '0.8em',
                        height: cursorStyle === 'underline' ? '1.2em' : '1em',
                        marginLeft: '0.1em'
                    }, "aria-hidden": "true" }))] }));
    };
    return React.createElement(Component, {
        ref: containerRef,
        className: `typewriter ${className}`,
        onClick: handleClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        style: { cursor: skipOnClick && isTyping ? 'pointer' : undefined },
    }, renderContent());
};

const TerminalLine = ({ line, showCopy = true, isAnimating = false, className = '', onCopy, }) => {
    const [copied, setCopied] = React.useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(line.text);
            setCopied(true);
            onCopy?.(line.text);
            setTimeout(() => setCopied(false), 2000);
        }
        catch (err) {
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
    return (jsxRuntime.jsxs("div", { className: `group relative mb-2 ${className}`, children: [jsxRuntime.jsxs("div", { className: "flex items-start gap-2", children: [line.type === 'command' && (jsxRuntime.jsx("span", { className: "shrink-0 select-none text-[var(--terminal-prompt, #fbbf24)]", "aria-hidden": "true", children: '>' })), jsxRuntime.jsxs("pre", { className: `flex-1 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed ${getTypeStyles()}`, children: [line.text, isAnimating && (jsxRuntime.jsx("span", { className: "inline-block h-4 w-1.5 animate-pulse motion-reduce:animate-none bg-[var(--terminal-cursor, #fbbf24)] align-middle ml-0.5", "aria-hidden": "true" }))] })] }), showCopy && !isAnimating && line.text.trim() && (jsxRuntime.jsx("button", { onClick: handleCopy, className: "absolute right-1 top-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-white/10", title: copied ? 'Copied!' : 'Copy', "aria-label": `Copy ${line.type}`, children: copied ? (jsxRuntime.jsx("svg", { className: "w-4 h-4 text-green-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsxRuntime.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })) : (jsxRuntime.jsx("svg", { className: "w-4 h-4 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: jsxRuntime.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) })) }))] }));
};

/**
 * Terminal Simulator - 终端模拟器核心逻辑
 * 框架无关的状态机和命令处理器
 */
// ==================== TerminalSimulator 类 ====================
let TerminalSimulator$1 = class TerminalSimulator {
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
            this.typeWriter = new TypeWriter$1({
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
            this.typeWriter = new TypeWriter$1({
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
};
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
};
const TerminalSimulator = ({ mode = 'free-type', steps = [], commands = [], title = 'Terminal', variant = 'macos', theme = 'dark', autoPlay = false, controls = true, welcomeMessage = 'Welcome! Type /help to get started.', prompt = '>', className = '', onStepComplete, onAllComplete, onCommand, }) => {
    const [state, setState] = React.useState(null);
    const [input, setInput] = React.useState('');
    const terminalRef = React.useRef(null);
    const scrollRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const lastCompletedStepRef = React.useRef(-1);
    const hasCompletedRef = React.useRef(false);
    const allCommands = React.useMemo(() => [...createDefaultCommands(), ...commands], [commands]);
    // 初始化终端模拟器
    React.useEffect(() => {
        terminalRef.current = new TerminalSimulator$1(mode, steps, allCommands, {
            maxHistory: 50,
            maxLines: 200,
            enableSound: false,
            welcomeMessage,
        });
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
    React.useEffect(() => {
        if (!state)
            return;
        setInput(state.input);
    }, [state]);
    React.useEffect(() => {
        if (!state)
            return;
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
    const handleStart = React.useCallback(() => {
        lastCompletedStepRef.current = -1;
        hasCompletedRef.current = false;
        terminalRef.current?.start();
    }, []);
    const handleNext = React.useCallback(() => {
        terminalRef.current?.nextStep();
    }, []);
    const handleSkip = React.useCallback(() => {
        terminalRef.current?.skip();
    }, []);
    const handleReset = React.useCallback(() => {
        lastCompletedStepRef.current = -1;
        hasCompletedRef.current = false;
        terminalRef.current?.reset();
        setInput('');
    }, []);
    // 处理输入
    const handleInputChange = React.useCallback((e) => {
        const value = e.target.value;
        setInput(value);
        terminalRef.current?.setInput(value);
    }, []);
    const handleKeyDown = React.useCallback(async (e) => {
        if (!terminalRef.current)
            return;
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                {
                    const submittedInput = input.trim();
                    const result = await terminalRef.current.submitInput();
                    if (submittedInput) {
                        const output = typeof result === 'string'
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
        }
    }, []);
    const currentThemeStyle = themeStyles[theme];
    // 窗口装饰
    const WindowChrome = () => {
        if (variant === 'minimal')
            return null;
        const dots = {
            macos: ['bg-[#ef4444]', 'bg-[#eab308]', 'bg-[#22c55e]'],
            windows: ['bg-red-500', 'bg-yellow-500', 'bg-green-500'],
            ubuntu: ['bg-[#e95420]', 'bg-white', 'bg-white'],
            minimal: [],
        }[variant];
        return (jsxRuntime.jsxs("div", { className: "flex items-center gap-2 px-4 py-2.5 bg-[var(--terminal-header-bg, #1c1917)]", children: [dots.map((color, i) => (jsxRuntime.jsx("span", { className: `h-3 w-3 rounded-full ${color}` }, i))), jsxRuntime.jsx("span", { className: "ml-2 text-xs text-[var(--terminal-header-text, #e7e5e4)]/60 truncate", children: title })] }));
    };
    // 控制按钮
    const Controls = () => {
        if (!controls)
            return null;
        if (mode === 'guided') {
            // 引导模式控制
            if (state?.isComplete) {
                return (jsxRuntime.jsxs("div", { className: "flex items-center justify-between border-t border-[var(--terminal-border, #44403c)] bg-[var(--terminal-footer-bg, #171412)] px-4 py-3", children: [jsxRuntime.jsx("span", { className: "text-xs text-green-400", children: "All steps complete!" }), jsxRuntime.jsx("button", { onClick: handleReset, className: "min-h-[44px] rounded-lg bg-[var(--terminal-button-bg, #f59e0b)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90", children: "Reset" })] }));
            }
            if (state?.isTyping) {
                return (jsxRuntime.jsxs("div", { className: "flex items-center justify-between border-t border-[var(--terminal-border, #44403c)] bg-[var(--terminal-footer-bg, #171412)] px-4 py-3", children: [jsxRuntime.jsx("span", { className: "text-xs text-[var(--terminal-text-muted, #e7e5e4)]/70", children: "Running..." }), jsxRuntime.jsx("button", { onClick: handleSkip, className: "min-h-[44px] rounded-lg bg-[var(--terminal-button-bg, #f59e0b)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90", children: "Skip" })] }));
            }
            const currentStep = steps[state?.currentStep ?? 0];
            const isFirstStep = (state?.currentStep ?? -1) < 0;
            return (jsxRuntime.jsxs("div", { className: "flex items-center justify-between border-t border-[var(--terminal-border, #44403c)] bg-[var(--terminal-footer-bg, #171412)] px-4 py-3", children: [jsxRuntime.jsx("div", { className: "flex-1", children: currentStep && (jsxRuntime.jsx("p", { className: "text-xs text-[var(--terminal-text-muted, #e7e5e4)]/70", children: currentStep.description || `Step ${(state?.currentStep ?? 0) + 1}: ${currentStep.command}` })) }), jsxRuntime.jsx("button", { onClick: isFirstStep ? handleStart : handleNext, className: "min-h-[44px] rounded-lg bg-[var(--terminal-button-bg, #f59e0b)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90", children: isFirstStep ? 'Run' : currentStep?.nextLabel || 'Next Step' })] }));
        }
        // 自由输入模式不需要额外控制
        return null;
    };
    if (!state)
        return null;
    return (jsxRuntime.jsxs("div", { className: `overflow-hidden rounded-xl border border-[var(--terminal-border, #44403c)] shadow-2xl ${className}`, role: "application", "aria-label": title, "data-terminal-theme": theme, style: currentThemeStyle, children: [jsxRuntime.jsx(WindowChrome, {}), jsxRuntime.jsxs("div", { ref: scrollRef, className: "overflow-y-auto bg-[var(--terminal-bg, #1c1917)] p-4 font-mono text-sm min-h-[280px] max-h-[480px]", dir: "ltr", children: [state.lines.map((line) => (jsxRuntime.jsx(TerminalLine, { line: line, showCopy: true }, line.id))), state.pendingLine && (jsxRuntime.jsx(TerminalLine, { line: {
                            id: 'pending-line',
                            type: state.pendingLine.type,
                            text: state.pendingLine.text,
                            timestamp: Date.now(),
                        }, showCopy: false, isAnimating: true })), mode === 'free-type' && (jsxRuntime.jsxs("div", { className: "flex items-center gap-2 mt-2", children: [jsxRuntime.jsx("span", { className: "shrink-0 select-none text-[var(--terminal-prompt, #fbbf24)]", "aria-hidden": "true", children: prompt }), jsxRuntime.jsx("input", { ref: inputRef, type: "text", value: input, onChange: handleInputChange, onKeyDown: handleKeyDown, className: "flex-1 bg-transparent text-[var(--terminal-fg, #e7e5e4)] outline-none placeholder:text-[var(--terminal-fg, #e7e5e4)]/30 caret-[var(--terminal-cursor, #fbbf24)]", placeholder: "Type a command...", "aria-label": "Terminal command input", autoComplete: "off", spellCheck: false })] })), state.suggestions.length > 1 && (jsxRuntime.jsx("div", { className: "mt-1 flex flex-wrap gap-2 pl-5", children: state.suggestions.map((suggestion, index) => (jsxRuntime.jsx("span", { className: `text-xs ${index === state.suggestionIndex ? 'text-[var(--terminal-prompt, #fbbf24)]' : 'text-[var(--terminal-fg, #e7e5e4)]/50'}`, children: suggestion }, suggestion))) }))] }), jsxRuntime.jsx(Controls, {}), jsxRuntime.jsx("div", { className: "sr-only", "aria-live": "polite", "aria-atomic": "false", children: state.lines.length > 0 && state.lines[state.lines.length - 1].type === 'output'
                    ? state.lines[state.lines.length - 1].text
                    : '' })] }));
};

/**
 * Terminal Learning Kit - Core
 * 框架无关的核心逻辑
 */
// 版本信息
const VERSION = '1.0.0';

exports.TerminalLine = TerminalLine;
exports.TerminalSimulator = TerminalSimulator;
exports.TypeWriter = TypeWriter;
exports.VERSION = VERSION;
exports.createDefaultCommands = createDefaultCommands;
exports.createSmartTypeWriter = createSmartTypeWriter;
exports.prefersReducedMotion = prefersReducedMotion;
//# sourceMappingURL=react.cjs.js.map
