import { motion, type HTMLMotionProps, type Variants, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════
   Tallio Motion System
   Consistent, performant, reusable animations
   ═══════════════════════════════════════════ */

// ── Easing tokens ──
const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

// ── Duration tokens ──
const dur = { fast: 0.2, base: 0.35, slow: 0.5, page: 0.4 };

// ── Variant presets ──
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: dur.base, ease: ease.out } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: dur.fast, ease: ease.out } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: dur.base, ease: ease.out } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

// ── Page transition wrapper ──
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur.page, ease: ease.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger group ──
export function StaggerGroup({
  children,
  className,
  fast,
}: {
  children: ReactNode;
  className?: string;
  fast?: boolean;
}) {
  return (
    <motion.div
      variants={fast ? staggerFast : staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger item ──
export function StaggerItem({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div variants={fadeUp} className={className} {...props}>
      {children}
    </motion.div>
  );
}

// ── Scroll reveal (intersection observer) ──
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: dur.slow, ease: ease.out, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Card hover wrapper ──
export function HoverCard({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: dur.fast } }}
      whileTap={{ scale: 0.99 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ── Metric counter (simple count-up) ──
export function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    if (value === 0) { setDisplayed(0); return; }
    const duration = 600;
    const start = ref.current;
    const diff = value - start;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplayed(current);
      if (progress < 1) requestAnimationFrame(tick);
      else ref.current = value;
    }
    requestAnimationFrame(tick);
  }, [value]);

  return <>{prefix}{displayed.toLocaleString()}</>;
}

// ── Progress bar animation ──
export function AnimatedProgress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ width: "0%" }}
      animate={{ width: `${Math.min(value, 100)}%` }}
      transition={{ duration: 0.8, ease: ease.out, delay: 0.2 }}
      className={className}
    />
  );
}

// Re-export for convenience
export { motion, AnimatePresence, type Variants };
