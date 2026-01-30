"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, Sun, Moon, Sunrise, Sparkles, LogOut, MessageCircle,
  ChevronRight, Pencil, Save, X, Calendar, Clock, MapPin
} from "lucide-react";
import {
  GiRat, GiBull, GiTigerHead, GiRabbit, GiSpikedDragonHead,
  GiSnake, GiHorseHead, GiGoat, GiMonkey, GiRooster, GiSittingDog, GiPig
} from "react-icons/gi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getChineseZodiac, type ChineseZodiac, CHINESE_ZODIAC_INFO } from "@/lib/chinese-zodiac";
import { IconType } from "react-icons";
import { LocationCombobox } from "@/components/onboarding/LocationCombobox";
import { Location } from "@/stores/onboarding";
import { fetchBirthChart } from "@/lib/api";

// Parse date string as local time to avoid timezone shifting
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Format time string (HH:MM) to 12-hour format with AM/PM
function formatTime12Hour(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

const CHINESE_ZODIAC_ICONS: Record<string, IconType> = {
  Rat: GiRat,
  Ox: GiBull,
  Tiger: GiTigerHead,
  Rabbit: GiRabbit,
  Dragon: GiSpikedDragonHead,
  Snake: GiSnake,
  Horse: GiHorseHead,
  Goat: GiGoat,
  Monkey: GiMonkey,
  Rooster: GiRooster,
  Dog: GiSittingDog,
  Pig: GiPig,
};

const ZODIAC_DESCRIPTIONS: Record<string, string> = {
  Aries: "Bold, ambitious, and competitive. You dive headfirst into challenging situations.",
  Taurus: "Reliable, patient, and devoted. You appreciate beauty and the finer things in life.",
  Gemini: "Curious, adaptable, and expressive. You love to learn and share ideas.",
  Cancer: "Intuitive, sentimental, and protective. You value home and emotional security.",
  Leo: "Dramatic, creative, and confident. You love to be in the spotlight.",
  Virgo: "Analytical, practical, and hardworking. You pay attention to every detail.",
  Libra: "Diplomatic, fair-minded, and social. You seek harmony and balance.",
  Scorpio: "Passionate, resourceful, and brave. You experience emotions deeply.",
  Sagittarius: "Optimistic, adventurous, and philosophical. You seek freedom and truth.",
  Capricorn: "Disciplined, responsible, and ambitious. You work hard to achieve your goals.",
  Aquarius: "Progressive, original, and independent. You think outside the box.",
  Pisces: "Intuitive, artistic, and compassionate. You feel deeply connected to others.",
};

const MBTI_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  INTJ: { title: "The Architect", description: "Imaginative and strategic thinkers with a plan for everything." },
  INTP: { title: "The Logician", description: "Innovative inventors with an unquenchable thirst for knowledge." },
  ENTJ: { title: "The Commander", description: "Bold, imaginative and strong-willed leaders." },
  ENTP: { title: "The Debater", description: "Smart and curious thinkers who love intellectual challenges." },
  INFJ: { title: "The Advocate", description: "Quiet and mystical, yet inspiring and tireless idealists." },
  INFP: { title: "The Mediator", description: "Poetic, kind and altruistic, always eager to help." },
  ENFJ: { title: "The Protagonist", description: "Charismatic and inspiring leaders who mesmerize their listeners." },
  ENFP: { title: "The Campaigner", description: "Enthusiastic, creative and sociable free spirits." },
  ISTJ: { title: "The Logistician", description: "Practical and fact-minded individuals whose reliability cannot be doubted." },
  ISFJ: { title: "The Defender", description: "Dedicated and warm protectors, always ready to defend loved ones." },
  ESTJ: { title: "The Executive", description: "Excellent administrators, unsurpassed at managing things or people." },
  ESFJ: { title: "The Consul", description: "Extraordinarily caring, social and popular people." },
  ISTP: { title: "The Virtuoso", description: "Bold and practical experimenters, masters of all kinds of tools." },
  ISFP: { title: "The Adventurer", description: "Flexible and charming artists, always ready to explore." },
  ESTP: { title: "The Entrepreneur", description: "Smart, energetic and very perceptive people." },
  ESFP: { title: "The Entertainer", description: "Spontaneous, energetic and enthusiastic entertainers." },
};

const ENNEAGRAM_DESCRIPTIONS: Record<number, { title: string; description: string }> = {
  1: { title: "The Reformer", description: "Principled, purposeful, self-controlled, and perfectionistic." },
  2: { title: "The Helper", description: "Generous, demonstrative, people-pleasing, and possessive." },
  3: { title: "The Achiever", description: "Adaptable, excelling, driven, and image-conscious." },
  4: { title: "The Individualist", description: "Expressive, dramatic, self-absorbed, and temperamental." },
  5: { title: "The Investigator", description: "Perceptive, innovative, secretive, and isolated." },
  6: { title: "The Loyalist", description: "Engaging, responsible, anxious, and suspicious." },
  7: { title: "The Enthusiast", description: "Spontaneous, versatile, acquisitive, and scattered." },
  8: { title: "The Challenger", description: "Self-confident, decisive, willful, and confrontational." },
  9: { title: "The Peacemaker", description: "Receptive, reassuring, complacent, and resigned." },
};

const ATTACHMENT_DESCRIPTIONS: Record<string, string> = {
  secure: "You feel comfortable with intimacy and independence. You communicate needs openly and trust others.",
  anxious: "You crave closeness but may worry about your partner's commitment. You're highly attuned to relationship dynamics.",
  avoidant: "You value independence highly and may feel uncomfortable with too much closeness. You're self-reliant.",
  "fearful-avoidant": "You desire close relationships but may struggle with trust. You experience mixed feelings about intimacy.",
};

const LOVE_LANGUAGE_DESCRIPTIONS: Record<string, string> = {
  "Words of Affirmation": "You feel most loved when receiving verbal compliments, encouragement, and appreciation.",
  "Quality Time": "You feel most loved when someone gives you their undivided attention and presence.",
  "Receiving Gifts": "You feel most loved through thoughtful gifts that show someone was thinking of you.",
  "Acts of Service": "You feel most loved when someone helps you with tasks or does things for you.",
  "Physical Touch": "You feel most loved through physical affection like hugs, holding hands, or a pat on the back.",
};

interface Profile {
  id: string;
  birth_date: string;
  birth_time: string;
  birth_time_unknown: boolean;
  location_city: string;
  location_latitude: number;
  location_longitude: number;
  location_timezone: string;
  mbti: string | null;
  enneagram_type: number | null;
  enneagram_wing: string | null;
  enneagram_instinct: string | null;
  attachment_style: string | null;
  love_languages: string[];
  birth_charts: Array<{
    id: string;
    sun_sign: string;
    moon_sign: string;
    rising_sign: string;
  }>;
}

interface ProfileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function ProfileCard({ children, onClick, className = "" }: ProfileCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 transition-all ${
        onClick ? "cursor-pointer hover:border-primary/50 hover:bg-card/80 group" : ""
      } ${className}`}
    >
      {children}
      {onClick && (
        <div className="flex items-center justify-end mt-3 text-xs text-muted-foreground group-hover:text-primary transition-colors">
          <span>View details</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chineseZodiac, setChineseZodiac] = useState<ChineseZodiac | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [bigThreeOpen, setBigThreeOpen] = useState(false);
  const [chineseZodiacOpen, setChineseZodiacOpen] = useState(false);
  const [birthDetailsOpen, setBirthDetailsOpen] = useState(false);
  const [mbtiOpen, setMbtiOpen] = useState(false);
  const [enneagramOpen, setEnneagramOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [loveLanguagesOpen, setLoveLanguagesOpen] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editMbti, setEditMbti] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Birth details edit states
  const [isEditingBirth, setIsEditingBirth] = useState(false);
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editBirthTime, setEditBirthTime] = useState("");
  const [editBirthTimeUnknown, setEditBirthTimeUnknown] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [isSavingBirth, setIsSavingBirth] = useState(false);
  const [isRecalculatingChart, setIsRecalculatingChart] = useState(false);

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
        setEditMbti(data.mbti || "");
        // Initialize birth edit states
        setEditBirthDate(data.birth_date || "");
        setEditBirthTime(data.birth_time || "");
        setEditBirthTimeUnknown(data.birth_time_unknown || false);
        if (data.location_city) {
          setEditLocation({
            city: data.location_city,
            latitude: data.location_latitude,
            longitude: data.location_longitude,
            timezone: data.location_timezone,
          });
        }
        if (data.birth_date) {
          const birthYear = parseLocalDate(data.birth_date).getFullYear();
          setChineseZodiac(getChineseZodiac(birthYear));
        }
      }
      setIsLoading(false);
    }

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSaveMbti = async () => {
    if (!profile) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ mbti: editMbti.toUpperCase() || null })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, mbti: editMbti.toUpperCase() || null });
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleSaveBirthDetails = async () => {
    if (!profile || !editLocation) return;
    setIsSavingBirth(true);

    try {
      // Update profile with new birth details
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          birth_date: editBirthDate,
          birth_time: editBirthTime || "12:00",
          birth_time_unknown: editBirthTimeUnknown,
          location_city: editLocation.city,
          location_latitude: editLocation.latitude,
          location_longitude: editLocation.longitude,
          location_timezone: editLocation.timezone,
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      // Recalculate birth chart with new details
      setIsRecalculatingChart(true);
      const newChart = await fetchBirthChart({
        name: "User",
        birth_date: editBirthDate,
        birth_time: editBirthTime || "12:00",
        latitude: editLocation.latitude,
        longitude: editLocation.longitude,
        timezone: editLocation.timezone,
      });

      // Update birth chart in database
      const sunSign = newChart.planets?.Sun?.sign || "Unknown";
      const moonSign = newChart.planets?.Moon?.sign || "Unknown";
      const risingSign = newChart.rising_sign || "Unknown";

      if (profile.birth_charts?.[0]?.id) {
        await supabase
          .from("birth_charts")
          .update({
            sun_sign: sunSign,
            moon_sign: moonSign,
            rising_sign: risingSign,
            chart_data: newChart,
          })
          .eq("id", profile.birth_charts[0].id);
      }

      // Update local state
      const updatedProfile = {
        ...profile,
        birth_date: editBirthDate,
        birth_time: editBirthTime || "12:00",
        birth_time_unknown: editBirthTimeUnknown,
        location_city: editLocation.city,
        location_latitude: editLocation.latitude,
        location_longitude: editLocation.longitude,
        location_timezone: editLocation.timezone,
        birth_charts: [{
          ...profile.birth_charts?.[0],
          sun_sign: sunSign,
          moon_sign: moonSign,
          rising_sign: risingSign,
        }],
      };
      setProfile(updatedProfile);

      // Update Chinese zodiac if birth year changed
      const newBirthYear = parseLocalDate(editBirthDate).getFullYear();
      setChineseZodiac(getChineseZodiac(newBirthYear));

      setIsEditingBirth(false);
    } catch (err) {
      console.error("Error saving birth details:", err);
    } finally {
      setIsSavingBirth(false);
      setIsRecalculatingChart(false);
    }
  };

  const resetBirthEditState = () => {
    if (profile) {
      setEditBirthDate(profile.birth_date || "");
      setEditBirthTime(profile.birth_time || "");
      setEditBirthTimeUnknown(profile.birth_time_unknown || false);
      if (profile.location_city) {
        setEditLocation({
          city: profile.location_city,
          latitude: profile.location_latitude,
          longitude: profile.location_longitude,
          timezone: profile.location_timezone,
        });
      }
    }
    setIsEditingBirth(false);
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
            <div
              onClick={() => setBigThreeOpen(true)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 cursor-pointer group"
            >
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center group-hover:border-primary/50 transition-colors">
                <Sun className="w-8 h-8 text-primary mx-auto mb-3" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Sun Sign</span>
                <p className="text-xl font-semibold mt-1">{chart.sun_sign}</p>
              </div>
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center group-hover:border-primary/50 transition-colors">
                <Moon className="w-8 h-8 text-primary mx-auto mb-3" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Moon Sign</span>
                <p className="text-xl font-semibold mt-1">{chart.moon_sign}</p>
              </div>
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center group-hover:border-primary/50 transition-colors">
                <Sunrise className="w-8 h-8 text-primary mx-auto mb-3" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Rising Sign</span>
                <p className="text-xl font-semibold mt-1">{chart.rising_sign}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center group-hover:text-primary">Click to view details</p>
          </section>
        )}

        {/* Chinese Zodiac */}
        {chineseZodiac && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Chinese Zodiac</h2>
            <ProfileCard onClick={() => setChineseZodiacOpen(true)}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  {(() => {
                    const ZodiacIcon = CHINESE_ZODIAC_ICONS[chineseZodiac.animal];
                    return ZodiacIcon ? (
                      <ZodiacIcon className="w-12 h-12 text-primary" />
                    ) : (
                      <Sparkles className="w-12 h-12 text-primary" />
                    );
                  })()}
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{chineseZodiac.fullSign}</p>
                  <p className="text-sm text-muted-foreground mt-1">{chineseZodiac.traits}</p>
                </div>
              </div>
            </ProfileCard>
          </section>
        )}

        {/* Birth Details */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Birth Details</h2>
          <ProfileCard onClick={() => setBirthDetailsOpen(true)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Date</span>
                <p className="font-medium">{parseLocalDate(profile.birth_date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Time</span>
                <p className="font-medium">{formatTime12Hour(profile.birth_time)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Location</span>
                <p className="font-medium">{profile.location_city}</p>
              </div>
            </div>
          </ProfileCard>
        </section>

        {/* Personality Types */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Personality Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.mbti && (
              <ProfileCard onClick={() => setMbtiOpen(true)}>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">MBTI</span>
                <p className="text-2xl font-bold text-primary mt-1">{profile.mbti}</p>
                {MBTI_DESCRIPTIONS[profile.mbti] && (
                  <p className="text-sm text-muted-foreground mt-1">{MBTI_DESCRIPTIONS[profile.mbti].title}</p>
                )}
              </ProfileCard>
            )}
            {profile.enneagram_type && (
              <ProfileCard onClick={() => setEnneagramOpen(true)}>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Enneagram</span>
                <p className="text-2xl font-bold text-primary mt-1">
                  Type {profile.enneagram_type}
                  {profile.enneagram_wing && ` w${profile.enneagram_wing === "left" ? profile.enneagram_type - 1 : profile.enneagram_type + 1}`}
                </p>
                {ENNEAGRAM_DESCRIPTIONS[profile.enneagram_type] && (
                  <p className="text-sm text-muted-foreground mt-1">{ENNEAGRAM_DESCRIPTIONS[profile.enneagram_type].title}</p>
                )}
              </ProfileCard>
            )}
            {profile.attachment_style && (
              <ProfileCard onClick={() => setAttachmentOpen(true)}>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Attachment Style</span>
                <p className="text-xl font-semibold mt-1 capitalize">{profile.attachment_style}</p>
              </ProfileCard>
            )}
            {profile.love_languages && profile.love_languages.length > 0 && (
              <ProfileCard onClick={() => setLoveLanguagesOpen(true)}>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Love Languages</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.love_languages.slice(0, 2).map((lang) => (
                    <span key={lang} className="px-3 py-1 rounded-full bg-primary/20 text-sm">
                      {lang}
                    </span>
                  ))}
                  {profile.love_languages.length > 2 && (
                    <span className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
                      +{profile.love_languages.length - 2} more
                    </span>
                  )}
                </div>
              </ProfileCard>
            )}
          </div>
        </section>
      </main>

      {/* Big Three Dialog */}
      <Dialog open={bigThreeOpen} onOpenChange={setBigThreeOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Big Three</DialogTitle>
            <DialogDescription>
              The three most important placements in your birth chart
            </DialogDescription>
          </DialogHeader>
          {chart && (
            <div className="space-y-6 mt-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Sun className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">Sun in {chart.sun_sign}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Your core identity, ego, and conscious self</p>
                <p className="text-sm">{ZODIAC_DESCRIPTIONS[chart.sun_sign] || ""}</p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Moon className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">Moon in {chart.moon_sign}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Your emotional nature and inner self</p>
                <p className="text-sm">{ZODIAC_DESCRIPTIONS[chart.moon_sign] || ""}</p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Sunrise className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">{chart.rising_sign} Rising</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">How others perceive you and your outward style</p>
                <p className="text-sm">{ZODIAC_DESCRIPTIONS[chart.rising_sign] || ""}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chinese Zodiac Dialog */}
      <Dialog open={chineseZodiacOpen} onOpenChange={setChineseZodiacOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chinese Zodiac</DialogTitle>
            <DialogDescription>
              Based on your birth year
            </DialogDescription>
          </DialogHeader>
          {chineseZodiac && (
            <div className="mt-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-primary/10">
                  {(() => {
                    const ZodiacIcon = CHINESE_ZODIAC_ICONS[chineseZodiac.animal];
                    return ZodiacIcon ? (
                      <ZodiacIcon className="w-16 h-16 text-primary" />
                    ) : (
                      <Sparkles className="w-16 h-16 text-primary" />
                    );
                  })()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">{chineseZodiac.fullSign}</h3>
                  <p className="text-muted-foreground">{chineseZodiac.animal} year with {chineseZodiac.element} element</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Traits</h4>
                  <p className="text-sm text-muted-foreground">{chineseZodiac.traits}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Element: {chineseZodiac.element}</h4>
                  <p className="text-sm text-muted-foreground">
                    {chineseZodiac.element === "Wood" && "Growth, creativity, and flexibility. Wood people are generous and cooperative."}
                    {chineseZodiac.element === "Fire" && "Passion, dynamism, and leadership. Fire people are adventurous and energetic."}
                    {chineseZodiac.element === "Earth" && "Stability, practicality, and reliability. Earth people are grounded and nurturing."}
                    {chineseZodiac.element === "Metal" && "Strength, determination, and self-reliance. Metal people are disciplined and focused."}
                    {chineseZodiac.element === "Water" && "Wisdom, intuition, and adaptability. Water people are diplomatic and perceptive."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Birth Details Dialog */}
      <Dialog open={birthDetailsOpen} onOpenChange={(open) => { setBirthDetailsOpen(open); if (!open) resetBirthEditState(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Birth Details</span>
              {!isEditingBirth && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingBirth(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              The foundation of your astrological profile
            </DialogDescription>
          </DialogHeader>
          {!isEditingBirth ? (
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Date of Birth</span>
                </div>
                <p className="text-lg font-medium mt-1">
                  {parseLocalDate(profile.birth_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Time of Birth</span>
                </div>
                <p className="text-lg font-medium mt-1">
                  {profile.birth_time_unknown ? "Unknown" : formatTime12Hour(profile.birth_time)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Birth time affects your Rising sign and house placements</p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Birth Location</span>
                </div>
                <p className="text-lg font-medium mt-1">{profile.location_city}</p>
                <p className="text-xs text-muted-foreground mt-1">Location determines the exact positions of celestial bodies</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="birthDate">Date of Birth</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="birthTime">Time of Birth</Label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editBirthTimeUnknown}
                      onChange={(e) => setEditBirthTimeUnknown(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-muted-foreground">Unknown</span>
                  </label>
                </div>
                <Input
                  id="birthTime"
                  type="time"
                  value={editBirthTime}
                  onChange={(e) => setEditBirthTime(e.target.value)}
                  disabled={editBirthTimeUnknown}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Birth Location</Label>
                <div className="mt-2">
                  <LocationCombobox
                    value={editLocation}
                    onChange={setEditLocation}
                  />
                </div>
              </div>
              {isRecalculatingChart && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recalculating your birth chart...
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveBirthDetails} disabled={isSavingBirth || !editLocation}>
                  {isSavingBirth ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isRecalculatingChart ? "Saving..." : "Save & Recalculate Chart"}
                </Button>
                <Button variant="outline" onClick={resetBirthEditState}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Changing birth details will recalculate your entire birth chart, including your Big Three.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MBTI Dialog */}
      <Dialog open={mbtiOpen} onOpenChange={(open) => { setMbtiOpen(open); setIsEditing(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>MBTI Personality Type</span>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              Myers-Briggs Type Indicator
            </DialogDescription>
          </DialogHeader>
          {profile.mbti && !isEditing ? (
            <div className="mt-4">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-primary">{profile.mbti}</p>
                {MBTI_DESCRIPTIONS[profile.mbti] && (
                  <p className="text-lg text-muted-foreground mt-2">{MBTI_DESCRIPTIONS[profile.mbti].title}</p>
                )}
              </div>
              {MBTI_DESCRIPTIONS[profile.mbti] && (
                <p className="text-sm text-center">{MBTI_DESCRIPTIONS[profile.mbti].description}</p>
              )}
              <div className="grid grid-cols-4 gap-2 mt-6">
                {profile.mbti.split("").map((letter, i) => (
                  <div key={i} className="p-3 rounded-lg bg-card border border-border text-center">
                    <p className="text-xl font-bold text-primary">{letter}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {i === 0 && (letter === "I" ? "Introvert" : "Extravert")}
                      {i === 1 && (letter === "N" ? "Intuitive" : "Sensing")}
                      {i === 2 && (letter === "T" ? "Thinking" : "Feeling")}
                      {i === 3 && (letter === "J" ? "Judging" : "Perceiving")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="mbti">MBTI Type</Label>
                <Input
                  id="mbti"
                  value={editMbti}
                  onChange={(e) => setEditMbti(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="e.g., INFP"
                  className="mt-2"
                  maxLength={4}
                />
                <p className="text-xs text-muted-foreground mt-1">Enter your 4-letter type (e.g., INFP, ENTJ)</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveMbti} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
                <Button variant="outline" onClick={() => { setIsEditing(false); setEditMbti(profile.mbti || ""); }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enneagram Dialog */}
      <Dialog open={enneagramOpen} onOpenChange={setEnneagramOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enneagram</DialogTitle>
            <DialogDescription>
              Your core personality type and motivations
            </DialogDescription>
          </DialogHeader>
          {profile.enneagram_type && (
            <div className="mt-4">
              <div className="text-center mb-6">
                <p className="text-5xl font-bold text-primary">{profile.enneagram_type}</p>
                {ENNEAGRAM_DESCRIPTIONS[profile.enneagram_type] && (
                  <p className="text-lg text-muted-foreground mt-2">{ENNEAGRAM_DESCRIPTIONS[profile.enneagram_type].title}</p>
                )}
                {profile.enneagram_wing && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Wing {profile.enneagram_wing === "left" ? profile.enneagram_type - 1 : profile.enneagram_type + 1}
                  </p>
                )}
              </div>
              {ENNEAGRAM_DESCRIPTIONS[profile.enneagram_type] && (
                <p className="text-sm text-center mb-4">{ENNEAGRAM_DESCRIPTIONS[profile.enneagram_type].description}</p>
              )}
              {profile.enneagram_instinct && (
                <div className="p-4 rounded-lg bg-card border border-border">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Instinctual Variant</span>
                  <p className="font-medium mt-1 capitalize">{profile.enneagram_instinct}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Attachment Style Dialog */}
      <Dialog open={attachmentOpen} onOpenChange={setAttachmentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Attachment Style</DialogTitle>
            <DialogDescription>
              How you connect in relationships
            </DialogDescription>
          </DialogHeader>
          {profile.attachment_style && (
            <div className="mt-4">
              <div className="text-center mb-6">
                <p className="text-2xl font-bold text-primary capitalize">{profile.attachment_style}</p>
              </div>
              <p className="text-sm text-center">
                {ATTACHMENT_DESCRIPTIONS[profile.attachment_style] || ""}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Love Languages Dialog */}
      <Dialog open={loveLanguagesOpen} onOpenChange={setLoveLanguagesOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Love Languages</DialogTitle>
            <DialogDescription>
              How you give and receive love
            </DialogDescription>
          </DialogHeader>
          {profile.love_languages && profile.love_languages.length > 0 && (
            <div className="mt-4 space-y-4">
              {profile.love_languages.map((lang, i) => (
                <div key={lang} className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                      {i + 1}
                    </span>
                    <h4 className="font-semibold">{lang}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {LOVE_LANGUAGE_DESCRIPTIONS[lang] || ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
