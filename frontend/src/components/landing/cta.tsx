"use client";

import { Button } from "@/components/ui/button";
import { FadeIn, Floating } from "@/components/animations/motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background elements */}
      <Floating duration={8} className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
      <Floating duration={10} distance={20} className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Start your journey today</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to discover your{" "}
            <span className="text-gradient">complete self</span>?
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop getting generic advice. Get insights that speak to the unique
            intersection of everything that makes you <em>you</em>.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg cosmic-glow"
            >
              Create Your Soul Profile
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p className="mt-6 text-sm text-muted-foreground">
            Free to start • No credit card required
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
