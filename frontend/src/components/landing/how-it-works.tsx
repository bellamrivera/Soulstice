"use client";

import { FadeIn } from "@/components/animations/motion";
import { UserPlus, Cpu, Compass } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Tell us who you are",
    description:
      "Enter your birth details to generate your charts. Take quick assessments or input existing results for MBTI, Enneagram, and more.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "We synthesize everything",
    description:
      "Our AI combines your birth chart, Chinese zodiac, personality types, attachment style, and love languages into a unified understanding.",
  },
  {
    number: "03",
    icon: Compass,
    title: "Get personalized guidance",
    description:
      'Receive advice that speaks to YOUR specific combination. "As a Scorpio sun with Cancer moon, INFJ, Enneagram 4w5 — here\'s what actually helps."',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How <span className="text-gradient">Soulstice</span> works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to unlock a deeper understanding of yourself.
          </p>
        </FadeIn>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <FadeIn key={step.number} delay={index * 0.15}>
              <div className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}

                <div className="text-center">
                  {/* Step number + icon */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center cosmic-glow-sm">
                      <step.icon className="w-10 h-10 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
