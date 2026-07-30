'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function BlurText({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
  once = true,
}: BlurTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-50px' });
  const controls = useAnimation();

  const words = text.split(' ');

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      filter: 'blur(10px)',
      y: 20,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={`flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate={controls}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={child}
          className="mr-[0.3em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
