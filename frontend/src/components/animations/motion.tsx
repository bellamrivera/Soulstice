"use client";

import { motion, HTMLMotionProps, useReducedMotion } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";

// Hook to detect if we're on the client and hydrated
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  ...props
}: FadeInProps) {
  const isClient = useIsClient();
  const prefersReducedMotion = useReducedMotion();

  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  // On server, render visible content (no opacity:0)
  if (!isClient) {
    return <div {...props}>{children}</div>;
  }

  // If user prefers reduced motion, no animation
  if (prefersReducedMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  delay?: number;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  delay = 0,
  staggerDelay = 0.1,
  className,
}: StaggerContainerProps) {
  const isClient = useIsClient();
  const prefersReducedMotion = useReducedMotion();

  if (!isClient || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export function StaggerItem({ children, ...props }: StaggerItemProps) {
  const isClient = useIsClient();
  const prefersReducedMotion = useReducedMotion();

  if (!isClient || prefersReducedMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ScaleOnHoverProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function ScaleOnHover({
  children,
  scale = 1.05,
  className,
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FloatingProps {
  children?: ReactNode;
  duration?: number;
  distance?: number;
  className?: string;
}

export function Floating({
  children,
  duration = 6,
  distance = 15,
  className,
}: FloatingProps) {
  const isClient = useIsClient();
  const prefersReducedMotion = useReducedMotion();

  if (!isClient || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{ y: [-distance / 2, distance / 2, -distance / 2] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
