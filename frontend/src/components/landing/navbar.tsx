"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export function Navbar() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navContent = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-xl font-semibold text-gradient">Soulstice</span>
        </a>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </a>
          <a
            href="#frameworks"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Frameworks
          </a>
        </div>

        {/* CTA Button */}
        <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10">
          <Link href="/onboarding">Get Started</Link>
        </Button>
      </div>
    </div>
  );

  // Server-side render without animation
  if (!isClient) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        {navContent}
      </nav>
    );
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      {navContent}
    </motion.nav>
  );
}
