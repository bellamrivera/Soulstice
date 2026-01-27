"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboardingStore } from "@/stores/onboarding";

const ATTACHMENT_STYLES = [
  {
    value: "secure",
    label: "Secure",
    description: "Comfortable with intimacy and independence",
  },
  {
    value: "anxious",
    label: "Anxious",
    description: "Craves closeness, fears abandonment",
  },
  {
    value: "avoidant",
    label: "Avoidant",
    description: "Values independence, uncomfortable with closeness",
  },
  {
    value: "fearful-avoidant",
    label: "Fearful-Avoidant",
    description: "Desires closeness but fears getting hurt",
  },
];

const LOVE_LANGUAGES = [
  {
    value: "words",
    label: "Words of Affirmation",
    description: "Verbal compliments, encouragement, appreciation",
  },
  {
    value: "acts",
    label: "Acts of Service",
    description: "Actions speak louder than words",
  },
  {
    value: "gifts",
    label: "Receiving Gifts",
    description: "Thoughtful presents and symbols of love",
  },
  {
    value: "time",
    label: "Quality Time",
    description: "Undivided attention and presence",
  },
  {
    value: "touch",
    label: "Physical Touch",
    description: "Physical expressions of love and affection",
  },
];

export function Step3Frameworks() {
  const {
    attachmentStyle,
    loveLanguages,
    setAttachmentStyle,
    toggleLoveLanguage,
  } = useOnboardingStore();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Relationship frameworks</h2>
        <p className="text-muted-foreground">
          Understanding how you connect with others helps us personalize your journey.
        </p>
      </div>

      <div className="space-y-8 max-w-md mx-auto">
        {/* Attachment Style */}
        <div className="space-y-3">
          <Label>Attachment Style</Label>
          <RadioGroup
            value={attachmentStyle}
            onValueChange={setAttachmentStyle}
            className="space-y-2"
          >
            {ATTACHMENT_STYLES.map((style) => (
              <div
                key={style.value}
                className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <RadioGroupItem
                  value={style.value}
                  id={style.value}
                  className="mt-0.5"
                />
                <div className="flex flex-col">
                  <label
                    htmlFor={style.value}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {style.label}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {style.description}
                  </span>
                </div>
              </div>
            ))}
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Not sure?{" "}
            <a
              href="https://www.attachmentproject.com/attachment-style-quiz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Take a quiz
            </a>
          </p>
        </div>

        {/* Love Languages */}
        <div className="space-y-3">
          <Label>Love Languages (select your top ones)</Label>
          <div className="space-y-2">
            {LOVE_LANGUAGES.map((language) => (
              <div
                key={language.value}
                className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <Checkbox
                  id={language.value}
                  checked={loveLanguages.includes(language.value)}
                  onCheckedChange={() => toggleLoveLanguage(language.value)}
                  className="mt-0.5"
                />
                <div className="flex flex-col">
                  <label
                    htmlFor={language.value}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {language.label}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {language.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Learn more at{" "}
            <a
              href="https://5lovelanguages.com/quizzes/love-language"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              5lovelanguages.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
