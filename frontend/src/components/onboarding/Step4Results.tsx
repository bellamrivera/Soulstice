"use client";

import { useEffect, useCallback, useState } from "react";
import { useOnboardingStore, BirthChart } from "@/stores/onboarding";
import { fetchBirthChart } from "@/lib/api";
import { saveProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, Sun, Moon, Sunrise, Star, RefreshCw, Save, Check, LogIn, Circle } from "lucide-react";
import Link from "next/link";

function BigThreeCard({
  title,
  sign,
  icon: Icon,
  description,
}: {
  title: string;
  sign: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
      <Icon className="w-8 h-8 text-primary mb-3" />
      <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {title}
      </span>
      <span className="text-xl font-semibold">{sign}</span>
      <span className="text-xs text-muted-foreground mt-2 text-center">
        {description}
      </span>
    </div>
  );
}

function PlanetRow({
  planet,
  data,
}: {
  planet: string;
  data: { sign: string; position: number; house: string; retrograde: boolean };
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2">
        <Circle className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{planet}</span>
        {data.retrograde && (
          <span className="text-xs text-amber-500 font-medium">R</span>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{data.sign}</span>
        <span className="text-xs">{data.position.toFixed(1)}°</span>
        <span className="text-xs">House {data.house}</span>
      </div>
    </div>
  );
}

export function Step4Results() {
  const {
    birthDate,
    birthTime,
    birthTimeUnknown,
    location,
    mbti,
    enneagram,
    attachmentStyle,
    loveLanguages,
    birthChart,
    isLoading,
    error,
    setBirthChart,
    setIsLoading,
    setError,
    reset,
  } = useOnboardingStore();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const handleSave = async () => {
    if (!birthDate || !location || !birthChart) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // birthDate may be a string from localStorage, convert to Date if needed
      const dateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
      await saveProfile({
        birthDate: dateObj,
        birthTime: birthTime || "12:00",
        birthTimeUnknown,
        location,
        mbti,
        enneagram,
        attachmentStyle,
        loveLanguages,
        birthChart,
      });
      setIsSaved(true);
      reset();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const loadBirthChart = useCallback(async () => {
    if (!birthDate || !location) {
      setError("Missing birth details");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // birthDate may be a string from localStorage, convert to Date if needed
      const dateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
      const chart = await fetchBirthChart({
        name: "User",
        birth_date: dateObj.toISOString().split("T")[0],
        birth_time: birthTime || "12:00",
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
      });
      setBirthChart(chart as BirthChart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate chart");
    } finally {
      setIsLoading(false);
    }
  }, [birthDate, birthTime, location, setBirthChart, setError, setIsLoading]);

  useEffect(() => {
    if (!birthChart && !isLoading && !error) {
      loadBirthChart();
    }
  }, [birthChart, isLoading, error, loadBirthChart]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <Star className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <p className="text-muted-foreground">Calculating your cosmic blueprint...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={loadBirthChart} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!birthChart) {
    return null;
  }

  const sunSign = birthChart.planets.Sun?.sign || "Unknown";
  const moonSign = birthChart.planets.Moon?.sign || "Unknown";
  const risingSign = birthChart.rising_sign || "Unknown";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Cosmic Blueprint</h2>
        <p className="text-muted-foreground">
          Here is your unique astrological profile based on the stars at your birth.
        </p>
      </div>

      {/* Big Three */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BigThreeCard
          title="Sun Sign"
          sign={sunSign}
          icon={Sun}
          description="Your core identity & ego"
        />
        <BigThreeCard
          title="Moon Sign"
          sign={moonSign}
          icon={Moon}
          description="Your emotions & inner self"
        />
        <BigThreeCard
          title="Rising Sign"
          sign={risingSign}
          icon={Sunrise}
          description="How others perceive you"
        />
      </div>

      {/* Planets */}
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Planetary Positions</h3>
        <div className="space-y-1">
          {Object.entries(birthChart.planets).map(([planet, data]) => (
            <PlanetRow key={planet} planet={planet} data={data} />
          ))}
        </div>
      </div>

      {/* Houses */}
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold mb-4">House Cusps</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(birthChart.houses).map(([house, data]) => (
            <div
              key={house}
              className="flex items-center justify-between p-2 rounded-lg bg-background/50"
            >
              <span className="text-sm font-medium">{house}</span>
              <span className="text-sm text-muted-foreground">{data.sign}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Major Aspects */}
      {birthChart.aspects.length > 0 && (
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Major Aspects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {birthChart.aspects.slice(0, 12).map((aspect, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm p-2 rounded-lg bg-background/50"
              >
                <span className="font-medium">{aspect.planet1}</span>
                <span className="text-muted-foreground">{aspect.aspect}</span>
                <span className="font-medium">{aspect.planet2}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {aspect.orb.toFixed(1)}°
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Profile Section */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-6">
        {isSaved ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-green-500">
              <Check className="w-6 h-6" />
              <span className="text-lg font-medium">Profile Saved!</span>
            </div>
            <p className="text-muted-foreground text-center">
              Your soul profile has been saved. You can view it anytime in your dashboard.
            </p>
            <Button asChild className="cosmic-glow">
              <Link href="/profile">View Your Profile</Link>
            </Button>
          </div>
        ) : isLoggedIn === false ? (
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-lg font-semibold">Save Your Soul Profile</h3>
            <p className="text-muted-foreground text-center">
              Create an account or sign in to save your profile and access it anytime.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button asChild className="cosmic-glow">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        ) : isLoggedIn === true ? (
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-lg font-semibold">Save Your Soul Profile</h3>
            <p className="text-muted-foreground text-center">
              Save your cosmic blueprint and personality insights to your account.
            </p>
            {saveError && (
              <p className="text-destructive text-sm">{saveError}</p>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="cosmic-glow"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
