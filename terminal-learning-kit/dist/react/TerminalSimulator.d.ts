/**
 * TerminalSimulator React Component
 * 终端模拟器组件
 */
import React from 'react';
import { TerminalStep, TerminalCommand } from '../core/terminal.js';
export interface TerminalSimulatorProps {
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
export declare const TerminalSimulator: React.FC<TerminalSimulatorProps>;
export default TerminalSimulator;
//# sourceMappingURL=TerminalSimulator.d.ts.map