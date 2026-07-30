'use client';

import { motion } from 'framer-motion';

interface AuroraBackgroundProps {
  className?: string;
}

export function AuroraBackground({ className = '' }: AuroraBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        }}
        animate={{
          background: [
            'radial-gradient(ellipse at 20% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(ellipse at 40% 30%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 60% 70%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 30% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(ellipse at 60% 60%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 30% 40%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(ellipse at 20% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
