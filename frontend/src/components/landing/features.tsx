"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StaggerContainer, StaggerItem, ScaleOnHover } from "@/components/animations/motion";
import {
  User,
  MessageCircle,
  BookOpen,
  Sparkles,
  BarChart3,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: User,
    title: "Soul Profile",
    description:
      "Your complete multi-system identity — all personality types in one beautiful, shareable view.",
    color: "text-purple-400",
  },
  {
    icon: MessageCircle,
    title: "Chat with Soulstice",
    description:
      "AI that actually knows you — advice tailored to your complete profile across all frameworks.",
    color: "text-blue-400",
  },
  {
    icon: BookOpen,
    title: "Journal",
    description:
      "Free write or guided prompts personalized to your types and current transits. AI finds patterns.",
    color: "text-pink-400",
  },
  {
    icon: Sparkles,
    title: "Daily Draws",
    description:
      "Tarot or oracle cards interpreted through YOUR lens, with pattern tracking over time.",
    color: "text-amber-400",
  },
  {
    icon: BarChart3,
    title: "Insights Dashboard",
    description:
      "Mood trends correlated with transits, growth tracking, monthly and yearly auto-generated reviews.",
    color: "text-emerald-400",
  },
  {
    icon: Calendar,
    title: "Cosmic Calendar",
    description:
      "Upcoming transits that matter FOR YOU, Mercury retrograde warnings, personalized moon phases.",
    color: "text-cyan-400",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need for{" "}
            <span className="text-gradient">self-discovery</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tools designed to help you understand yourself deeper, combining ancient wisdom
            with modern AI.
          </p>
        </div>

        {/* Features grid */}
        <StaggerContainer
          staggerDelay={0.1}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <ScaleOnHover>
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors h-full">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4`}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScaleOnHover>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
