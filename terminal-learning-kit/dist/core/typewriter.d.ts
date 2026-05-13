/**
 * TypeWriter - 打字机动画核心逻辑
 * 框架无关，可在任何 JavaScript 环境中使用
 */
export interface TypeWriterOptions {
    text: string;
    speed?: number;
    enabled?: boolean;
    onComplete?: () => void;
    onChar?: (char: string, index: number) => void;
}
export interface TypeWriterState {
    displayedText: string;
    isTyping: boolean;
    progress: number;
}
export declare class TypeWriter {
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
export declare function prefersReducedMotion(): boolean;
/**
 * 创建智能 TypeWriter（自动检测减少动画偏好）
 */
export declare function createSmartTypeWriter(options: TypeWriterOptions): TypeWriter;
export default TypeWriter;
//# sourceMappingURL=typewriter.d.ts.map