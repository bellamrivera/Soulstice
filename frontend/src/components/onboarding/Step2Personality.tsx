"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOnboardingStore } from "@/stores/onboarding";

const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

const ENNEAGRAM_TYPES = [
  { value: 1, label: "Type 1 - The Reformer" },
  { value: 2, label: "Type 2 - The Helper" },
  { value: 3, label: "Type 3 - The Achiever" },
  { value: 4, label: "Type 4 - The Individualist" },
  { value: 5, label: "Type 5 - The Investigator" },
  { value: 6, label: "Type 6 - The Loyalist" },
  { value: 7, label: "Type 7 - The Enthusiast" },
  { value: 8, label: "Type 8 - The Challenger" },
  { value: 9, label: "Type 9 - The Peacemaker" },
];

const INSTINCTUAL_VARIANTS = [
  { value: "sp", label: "Self-Preservation (SP)", description: "Focus on security, comfort, health" },
  { value: "sx", label: "Sexual/One-to-One (SX)", description: "Focus on intensity, connection, chemistry" },
  { value: "so", label: "Social (SO)", description: "Focus on groups, belonging, contribution" },
];

export function Step2Personality() {
  const {
    mbti,
    enneagram,
    setMbti,
    setEnneagramType,
    setEnneagramWing,
    setEnneagramInstinct,
  } = useOnboardingStore();

  const getWingOptions = () => {
    if (!enneagram.type) return [];
    const type = enneagram.type;
    const prev = type === 1 ? 9 : type - 1;
    const next = type === 9 ? 1 : type + 1;
    return [
      { value: "w", label: `Wing ${prev} (${type}w${prev})` },
      { value: "w-1", label: `Wing ${next} (${type}w${next})` },
    ];
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Tell us about your personality</h2>
        <p className="text-muted-foreground">
          These frameworks help us understand how you think and relate to the world.
        </p>
      </div>

      <div className="space-y-8 max-w-md mx-auto">
        {/* MBTI */}
        <div className="space-y-3">
          <Label>MBTI / 16 Personalities</Label>
          <Select value={mbti} onValueChange={setMbti}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your type (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">I don&apos;t know</SelectItem>
              {MBTI_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Not sure? Take the test at{" "}
            <a
              href="https://www.16personalities.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              16personalities.com
            </a>
          </p>
        </div>

        {/* Enneagram Type */}
        <div className="space-y-3">
          <Label>Enneagram Type</Label>
          <Select
            value={enneagram.type?.toString() || ""}
            onValueChange={(val) => {
              setEnneagramType(val ? parseInt(val) : null);
              setEnneagramWing(null);
            }}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your type (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">I don&apos;t know</SelectItem>
              {ENNEAGRAM_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value.toString()}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Enneagram Wing */}
        {enneagram.type && (
          <div className="space-y-3">
            <Label>Enneagram Wing</Label>
            <Select
              value={enneagram.wing || ""}
              onValueChange={(val) => setEnneagramWing(val as "w" | "w-1" | null)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your wing (optional)" />
              </SelectTrigger>
              <SelectContent>
                {getWingOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Instinctual Variant */}
        {enneagram.type && (
          <div className="space-y-3">
            <Label>Instinctual Variant</Label>
            <RadioGroup
              value={enneagram.instinct || ""}
              onValueChange={(val) => setEnneagramInstinct(val as "sp" | "sx" | "so")}
              className="space-y-2"
            >
              {INSTINCTUAL_VARIANTS.map((variant) => (
                <div key={variant.value} className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value={variant.value} id={variant.value} className="mt-0.5" />
                  <div className="flex flex-col">
                    <label htmlFor={variant.value} className="text-sm font-medium cursor-pointer">
                      {variant.label}
                    </label>
                    <span className="text-xs text-muted-foreground">{variant.description}</span>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </div>
    </div>
  );
}
