'use client';

import { motion } from 'framer-motion';

interface FloatingLinesProps {
  className?: string;
  count?: number;
  color?: string;
}

export function FloatingLines({
  className = '',
  count = 5,
  color = 'currentColor',
}: FloatingLinesProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px opacity-20"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            width: `${30 + Math.random() * 40}%`,
            left: `${Math.random() * 100}%`,
            top: `${(i / count) * 100}%`,
          }}
          animate={{
            x: ['-100%', '200%'],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
