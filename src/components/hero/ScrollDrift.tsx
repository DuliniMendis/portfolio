"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/** Moves children at their own rate while the hero scrolls away. Negative = faster than page. */
export function ScrollDrift({
  children,
  rate,
  fade = false,
  className,
}: {
  children: ReactNode;
  rate: number;
  fade?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 700 * rate]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.15]);
  return (
    <motion.div className={className} style={{ y: reduce ? 0 : y, opacity: fade && !reduce ? opacity : 1 }}>
      {children}
    </motion.div>
  );
}
