'use client';

import { motion, type MotionProps } from 'framer-motion';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  animate?: boolean;
  motionProps?: MotionProps;
}

export function GradientText({
  children,
  className = '',
  gradient = 'from-primary via-primary/70 to-primary',
  animate = true,
  motionProps,
}: GradientTextProps) {
  return (
    <motion.span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${
        animate ? 'bg-[length:200%_auto] animate-gradient' : ''
      } ${className}`}
      {...motionProps}
    >
      {children}
    </motion.span>
  );
}
