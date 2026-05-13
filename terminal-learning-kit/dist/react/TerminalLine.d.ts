/**
 * TerminalLine React Component
 * 终端单行显示组件
 */
import React from 'react';
import { TerminalLine as TerminalLineType } from '../core/terminal.js';
export interface TerminalLineProps {
    line: TerminalLineType;
    showCopy?: boolean;
    isAnimating?: boolean;
    className?: string;
    onCopy?: (text: string) => void;
}
export declare const TerminalLine: React.FC<TerminalLineProps>;
export default TerminalLine;
//# sourceMappingURL=TerminalLine.d.ts.map