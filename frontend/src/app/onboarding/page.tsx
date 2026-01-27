"use client";

import { useOnboardingStore } from "@/stores/onboarding";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { Step1BirthDetails } from "@/components/onboarding/Step1BirthDetails";
import { Step2Personality } from "@/components/onboarding/Step2Personality";
import { Step3Frameworks } from "@/components/onboarding/Step3Frameworks";
import { Step4Results } from "@/components/onboarding/Step4Results";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const { currentStep, nextStep, prevStep, birthDate, location } =
    useOnboardingStore();

  const canProceedStep1 = birthDate && location;
  const canProceed = currentStep === 1 ? canProceedStep1 : true;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BirthDetails />;
      case 2:
        return <Step2Personality />;
      case 3:
        return <Step3Frameworks />;
      case 4:
        return <Step4Results />;
      default:
        return <Step1BirthDetails />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold cosmic-text">Soulstice</span>
          </Link>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of 4
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Step Content */}
        <div className="mt-8 mb-8">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border/40">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={prevStep}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed}
              className="gap-2"
            >
              {currentStep === 3 ? "Generate Chart" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button asChild className="gap-2">
              <Link href="/profile">
                Save & View Profile
                <Sparkles className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Skip option for optional steps */}
        {(currentStep === 2 || currentStep === 3) && (
          <div className="text-center mt-4">
            <button
              onClick={nextStep}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip this step
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
