"use client";

import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/motion";

const frameworks = [
  { name: "Western Astrology", emoji: "♈", description: "Sun, Moon, Rising & full birth chart" },
  { name: "Chinese Zodiac", emoji: "🐉", description: "Year, month, day & hour animals" },
  { name: "MBTI", emoji: "🧠", description: "16 personality types" },
  { name: "Enneagram", emoji: "🔢", description: "Type, wing & instinctual variants" },
  { name: "Attachment Style", emoji: "💕", description: "How you connect in relationships" },
  { name: "Love Languages", emoji: "💝", description: "How you give & receive love" },
  { name: "Human Design", emoji: "🌀", description: "Your energetic blueprint" },
  { name: "DISC", emoji: "📊", description: "Behavioral profile" },
];

export function Frameworks() {
  return (
    <section id="frameworks" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <FadeIn className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            8+ Systems Combined
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            You&apos;re the intersection of{" "}
            <span className="text-gradient">all of it</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We don&apos;t just store your types — we synthesize them into a complete
            picture of who you are.
          </p>
        </FadeIn>

        {/* Frameworks grid */}
        <StaggerContainer
          staggerDelay={0.05}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {frameworks.map((framework) => (
            <StaggerItem key={framework.name}>
              <div className="group p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all cursor-default">
                <div className="text-4xl mb-3">{framework.emoji}</div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {framework.name}
                </h3>
                <p className="text-sm text-muted-foreground">{framework.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Extensibility note */}
        <FadeIn delay={0.3} className="text-center mt-12">
          <p className="text-muted-foreground">
            <span className="text-foreground">Plus whatever else you want to add.</span>{" "}
            Your profile grows with you.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
