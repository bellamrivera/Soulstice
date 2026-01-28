import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Location {
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Enneagram {
  type: number | null;
  wing: "w" | "w-1" | null;
  instinct: "sp" | "sx" | "so" | null;
}

export interface BirthChart {
  name: string;
  birth_data: {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  planets: Record<string, {
    sign: string;
    position: number;
    house: string;
    retrograde: boolean;
  }>;
  houses: Record<string, {
    sign: string;
    position: number;
  }>;
  rising_sign: string;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    is_applying: boolean;
  }>;
}

interface OnboardingState {
  // Step 1: Birth Details
  birthDate: Date | null;
  birthTime: string;
  birthTimeUnknown: boolean;
  location: Location | null;

  // Step 2: Personality Types
  mbti: string;
  enneagram: Enneagram;

  // Step 3: Additional Frameworks
  attachmentStyle: string;
  loveLanguages: string[];

  // Navigation
  currentStep: number;

  // Results
  birthChart: BirthChart | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 1 actions
  setBirthDate: (date: Date | null) => void;
  setBirthTime: (time: string) => void;
  setBirthTimeUnknown: (unknown: boolean) => void;
  setLocation: (location: Location | null) => void;

  // Step 2 actions
  setMbti: (mbti: string) => void;
  setEnneagramType: (type: number | null) => void;
  setEnneagramWing: (wing: "w" | "w-1" | null) => void;
  setEnneagramInstinct: (instinct: "sp" | "sx" | "so" | null) => void;

  // Step 3 actions
  setAttachmentStyle: (style: string) => void;
  setLoveLanguages: (languages: string[]) => void;
  toggleLoveLanguage: (language: string) => void;

  // Results actions
  setBirthChart: (chart: BirthChart | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  birthDate: null,
  birthTime: "",
  birthTimeUnknown: false,
  location: null,
  mbti: "",
  enneagram: { type: null, wing: null, instinct: null },
  attachmentStyle: "",
  loveLanguages: [],
  currentStep: 1,
  birthChart: null,
  isLoading: false,
  error: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      // Navigation
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      // Step 1 actions
      setBirthDate: (date) => set({ birthDate: date }),
      setBirthTime: (time) => set({ birthTime: time }),
      setBirthTimeUnknown: (unknown) =>
        set({ birthTimeUnknown: unknown, birthTime: unknown ? "12:00" : "" }),
      setLocation: (location) => set({ location }),

      // Step 2 actions
      setMbti: (mbti) => set({ mbti }),
      setEnneagramType: (type) =>
        set((state) => ({ enneagram: { ...state.enneagram, type } })),
      setEnneagramWing: (wing) =>
        set((state) => ({ enneagram: { ...state.enneagram, wing } })),
      setEnneagramInstinct: (instinct) =>
        set((state) => ({ enneagram: { ...state.enneagram, instinct } })),

      // Step 3 actions
      setAttachmentStyle: (style) => set({ attachmentStyle: style }),
      setLoveLanguages: (languages) => set({ loveLanguages: languages }),
      toggleLoveLanguage: (language) =>
        set((state) => ({
          loveLanguages: state.loveLanguages.includes(language)
            ? state.loveLanguages.filter((l) => l !== language)
            : [...state.loveLanguages, language],
        })),

      // Results actions
      setBirthChart: (chart) => set({ birthChart: chart }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: "soulstice-onboarding",
      partialize: (state) => ({
        birthDate: state.birthDate,
        birthTime: state.birthTime,
        birthTimeUnknown: state.birthTimeUnknown,
        location: state.location,
        mbti: state.mbti,
        enneagram: state.enneagram,
        attachmentStyle: state.attachmentStyle,
        loveLanguages: state.loveLanguages,
        currentStep: state.currentStep,
      }),
    }
  )
);
