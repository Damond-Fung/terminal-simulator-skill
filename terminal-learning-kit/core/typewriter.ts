/**
 * TypeWriter - 打字机动画核心逻辑
 * 框架无关，可在任何 JavaScript 环境中使用
 */

export interface TypeWriterOptions {
  text: string;
  speed?: number;           // 打字速度（ms/字符）
  enabled?: boolean;        // 是否启用动画
  onComplete?: () => void;  // 完成回调
  onChar?: (char: string, index: number) => void;  // 每字符回调
}

export interface TypeWriterState {
  displayedText: string;    // 当前显示的文本
  isTyping: boolean;        // 是否正在打字
  progress: number;         // 进度 0-1
}

export class TypeWriter {
  private text: string;
  private speed: number;
  private enabled: boolean;
  private onComplete?: () => void;
  private onChar?: (char: string, index: number) => void;
  
  private charIndex = 0;
  private rafId: number | null = null;
  private lastTime = 0;
  private isRunning = false;
  
  private state: TypeWriterState = {
    displayedText: '',
    isTyping: false,
    progress: 0
  };
  
  private listeners: Set<(state: TypeWriterState) => void> = new Set();

  constructor(options: TypeWriterOptions) {
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
  start(): void {
    if (this.isRunning || !this.enabled) return;
    
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
  stop(): void {
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
  skipToEnd(): void {
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
  reset(): void {
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
  update(options: Partial<TypeWriterOptions>): void {
    if (options.text !== undefined) this.text = options.text;
    if (options.speed !== undefined) this.speed = options.speed;
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
  getState(): TypeWriterState {
    return { ...this.state };
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: TypeWriterState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.stop();
    this.listeners.clear();
  }

  private animate(timestamp: number): void {
    if (!this.lastTime) this.lastTime = timestamp;
    
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

  private updateState(newState: TypeWriterState): void {
    this.state = newState;
    this.listeners.forEach(listener => listener(newState));
  }
}

/**
 * 检查用户是否偏好减少动画
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 创建智能 TypeWriter（自动检测减少动画偏好）
 */
export function createSmartTypeWriter(options: TypeWriterOptions): TypeWriter {
  const shouldAnimate = options.enabled ?? true;

  return new TypeWriter({
    ...options,
    enabled: shouldAnimate && !prefersReducedMotion()
  });
}

export default TypeWriter;
