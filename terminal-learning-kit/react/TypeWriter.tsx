/**
 * TypeWriter React Component
 * 打字机动画组件
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TypeWriter as TypeWriterCore, TypeWriterOptions, prefersReducedMotion } from '../core/typewriter.js';

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

export const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  speed = 30,
  enabled = true,
  cursor = true,
  cursorStyle = 'block',
  className = '',
  onComplete,
  onChar,
  skipOnClick = false,
  pauseOnHover = false,
  as: Component = 'span',
  children,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const typeWriterRef = useRef<TypeWriterCore | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  // 初始化 TypeWriter
  useEffect(() => {
    const shouldAnimate = enabled && !prefersReducedMotion();
    
    typeWriterRef.current = new TypeWriterCore({
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
    } else {
      setDisplayedText(text);
    }

    return () => {
      unsubscribe();
      typeWriterRef.current?.destroy();
    };
  }, [text, speed, enabled]);

  // 处理点击跳过
  const handleClick = useCallback(() => {
    if (skipOnClick && isTyping) {
      typeWriterRef.current?.skipToEnd();
    }
  }, [skipOnClick, isTyping]);

  // 处理悬停暂停
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover && isTyping) {
      setIsPaused(true);
      // 注意：当前实现不支持暂停，可以通过扩展 TypeWriter 实现
    }
  }, [pauseOnHover, isTyping]);

  const handleMouseLeave = useCallback(() => {
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

    return (
      <>
        {displayedText}
        {cursor && isTyping && (
          <span 
            className={`inline-block align-middle ${cursorClass}`}
            style={{ 
              width: cursorStyle === 'block' ? '0.6em' : cursorStyle === 'line' ? undefined : '0.8em',
              height: cursorStyle === 'underline' ? '1.2em' : '1em',
              marginLeft: '0.1em'
            }}
            aria-hidden="true"
          />
        )}
      </>
    );
  };

  return React.createElement(
    Component as string,
    {
      ref: containerRef,
      className: `typewriter ${className}`,
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      style: { cursor: skipOnClick && isTyping ? 'pointer' : undefined },
    },
    renderContent()
  );
};

export default TypeWriter;
