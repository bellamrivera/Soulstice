"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Sparkles, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Profile {
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  birth_year: number | null;
  mbti: string | null;
  enneagram_type: number | null;
  enneagram_wing: string | null;
  enneagram_instinct: string | null;
  attachment_style: string | null;
  love_languages: string[];
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      if (error || !data) {
        router.push("/onboarding");
        return;
      }

      const chart = data.birth_charts?.[0];
      if (!chart) {
        router.push("/onboarding");
        return;
      }

      const birthYear = data.birth_date ? new Date(data.birth_date).getFullYear() : null;

      setProfile({
        sun_sign: chart.sun_sign,
        moon_sign: chart.moon_sign,
        rising_sign: chart.rising_sign,
        birth_year: birthYear,
        mbti: data.mbti,
        enneagram_type: data.enneagram_type,
        enneagram_wing: data.enneagram_wing,
        enneagram_instinct: data.enneagram_instinct,
        attachment_style: data.attachment_style,
        love_languages: data.love_languages || [],
      });

      // Add welcome message
      setMessages([
        {
          role: "assistant",
          content: `Welcome! I'm Soulstice, your personal guide to self-discovery. I know you're a ${chart.sun_sign} Sun, ${chart.moon_sign} Moon, and ${chart.rising_sign} Rising${data.mbti ? `, with an ${data.mbti} personality` : ""}. I'm here to help you explore your inner world, process emotions, and grow. What's on your mind today?`,
        },
      ]);

      setIsLoadingProfile(false);
    }

    loadProfile();
  }, [router]);

  const sendMessage = async () => {
    if (!input.trim() || !profile || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          profile,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen cosmic-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-gradient flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link href="/profile">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">Soulstice</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {profile?.sun_sign} Sun
          </span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/50 border border-border/50"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card/50 border border-border/50 rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/50 glass sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              className="bg-card/50 border-border/50"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="cosmic-glow"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
