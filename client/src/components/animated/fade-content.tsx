'use client';

import { motion, type MotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface FadeContentProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const FadeContent = forwardRef<HTMLDivElement, FadeContentProps>(
  ({ children, className = '', delay = 0, duration = 0.5, direction = 'up' }, ref) => {
    const directionMap = {
      up: { y: 20, x: 0 },
      down: { y: -20, x: 0 },
      left: { x: 20, y: 0 },
      right: { x: -20, y: 0 },
      none: { x: 0, y: 0 },
    };

    const offset = directionMap[direction];

    return (
      <motion.div
        ref={ref}
        className={className}
        initial={{ opacity: 0, ...offset }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{
          duration,
          delay,
          ease: 'easeOut',
        }}
      >
        {children}
      </motion.div>
    );
  }
);

FadeContent.displayName = 'FadeContent';
