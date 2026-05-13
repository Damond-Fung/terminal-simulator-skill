/**
 * TypeWriter React Component
 * 打字机动画组件
 */
import React from 'react';
export interface TypeWriterProps {
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
export declare const TypeWriter: React.FC<TypeWriterProps>;
export default TypeWriter;
//# sourceMappingURL=TypeWriter.d.ts.map