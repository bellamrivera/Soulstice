"use client";

import { cn } from "@/lib/utils";
import { Check, Star } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ["Birth Details", "Personality", "Frameworks", "Your Chart"];

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {/* Line before */}
              {step > 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 transition-colors",
                    step <= currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}

              {/* Step circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                  step < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : step === currentStep
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-background text-muted-foreground"
                )}
              >
                {step < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : step === totalSteps ? (
                  <Star className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step}</span>
                )}
              </div>

              {/* Line after */}
              {step < totalSteps && (
                <div
                  className={cn(
                    "flex-1 h-0.5 transition-colors",
                    step < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                "mt-2 text-xs font-medium transition-colors",
                step === currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              {stepLabels[step - 1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
