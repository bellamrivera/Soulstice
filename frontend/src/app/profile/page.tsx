"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, Sun, Moon, Sunrise, Sparkles, LogOut, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

interface Profile {
  id: string;
  birth_date: string;
  birth_time: string;
  location_city: string;
  mbti: string | null;
  enneagram_type: number | null;
  enneagram_wing: string | null;
  enneagram_instinct: string | null;
  attachment_style: string | null;
  love_languages: string[];
  birth_charts: Array<{
    sun_sign: string;
    moon_sign: string;
    rising_sign: string;
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          birth_charts (sun_sign, moon_sign, rising_sign)
        `)
        .eq("user_id", user.id)
        .single();

      if (error) {
        setError("No profile found. Complete onboarding first.");
      } else {
        setProfile(data);
      }
      setIsLoading(false);
    }

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cosmic-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen cosmic-gradient flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || "No profile found"}</p>
          <Button asChild>
            <Link href="/onboarding">Complete Onboarding</Link>
          </Button>
        </div>
      </div>
    );
  }

  const chart = profile.birth_charts?.[0];

  return (
    <div className="min-h-screen cosmic-gradient">
      {/* Header */}
      <header className="border-b border-border/50 glass">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-semibold text-gradient">Soulstice</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Soul Profile</h1>
          <Button asChild className="cosmic-glow">
            <Link href="/chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with Soulstice
            </Link>
          </Button>
        </div>

        {/* Big Three */}
        {chart && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Your Big Three</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center">
                <Sun className="w-8 h-8 text-primary mx-auto mb-2" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Sun Sign</span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-3xl">{ZODIAC_SYMBOLS[chart.sun_sign] || ""}</span>
                  <span className="text-xl font-semibold">{chart.sun_sign}</span>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center">
                <Moon className="w-8 h-8 text-primary mx-auto mb-2" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Moon Sign</span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-3xl">{ZODIAC_SYMBOLS[chart.moon_sign] || ""}</span>
                  <span className="text-xl font-semibold">{chart.moon_sign}</span>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center">
                <Sunrise className="w-8 h-8 text-primary mx-auto mb-2" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Rising Sign</span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-3xl">{ZODIAC_SYMBOLS[chart.rising_sign] || ""}</span>
                  <span className="text-xl font-semibold">{chart.rising_sign}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Birth Details */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Birth Details</h2>
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Date</span>
                <p className="font-medium">{new Date(profile.birth_date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Time</span>
                <p className="font-medium">{profile.birth_time}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Location</span>
                <p className="font-medium">{profile.location_city}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Personality Types */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Personality Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.mbti && (
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">MBTI</span>
                <p className="text-2xl font-bold text-primary mt-1">{profile.mbti}</p>
              </div>
            )}
            {profile.enneagram_type && (
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Enneagram</span>
                <p className="text-2xl font-bold text-primary mt-1">
                  Type {profile.enneagram_type}
                  {profile.enneagram_wing && ` w${profile.enneagram_wing === "left" ? profile.enneagram_type - 1 : profile.enneagram_type + 1}`}
                  {profile.enneagram_instinct && ` ${profile.enneagram_instinct}`}
                </p>
              </div>
            )}
            {profile.attachment_style && (
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Attachment Style</span>
                <p className="text-xl font-semibold mt-1 capitalize">{profile.attachment_style}</p>
              </div>
            )}
            {profile.love_languages && profile.love_languages.length > 0 && (
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Love Languages</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.love_languages.map((lang) => (
                    <span key={lang} className="px-3 py-1 rounded-full bg-primary/20 text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
