"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn, Floating } from "@/components/animations/motion";
import { ArrowRight, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

// Use seeded random for consistent SSR/client rendering
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function StarField() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate stars with deterministic positions
  const stars = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 1) * 100,
      y: seededRandom(i * 2 + 100) * 100,
      size: seededRandom(i * 3 + 200) * 2 + 1,
      delay: seededRandom(i * 4 + 300) * 3,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        isClient ? (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ) : (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: 0.5,
            }}
          />
        )
      ))}
    </div>
  );
}

function ScrollIndicator() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center cosmic-gradient overflow-hidden">
      <StarField />

      {/* Floating orbs */}
      <Floating duration={8} distance={20} className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <Floating duration={10} distance={25} className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <FadeIn delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">
              Your complete self-discovery companion
            </span>
          </div>
        </FadeIn>

        {/* Main headline */}
        <FadeIn delay={0.2}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            You are{" "}
            <span className="text-gradient">not just</span>
            <br />
            your sun sign
          </h1>
        </FadeIn>

        {/* Subheadline */}
        <FadeIn delay={0.3}>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            AI-powered journaling and self-discovery combining astrology,
            personality frameworks, and personal growth into advice tailored to{" "}
            <span className="text-foreground">your unique combination</span>.
          </p>
        </FadeIn>

        {/* CTA Buttons */}
        <FadeIn delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg cosmic-glow"
            >
              <Link href="/onboarding">
                Discover Your Soul Profile
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-muted-foreground/30 hover:bg-muted/50 px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </FadeIn>

        {/* Social proof */}
        <FadeIn delay={0.5}>
          <div className="mt-16 flex items-center justify-center gap-8 text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">8+</div>
              <div className="text-sm">Personality Systems</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">AI</div>
              <div className="text-sm">Powered Insights</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">You</div>
              <div className="text-sm">Deeply Understood</div>
            </div>
          </div>
        </FadeIn>
      </div>

      <ScrollIndicator />
    </section>
  );
}
