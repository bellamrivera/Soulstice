"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Sparkles, ArrowLeft, User, Plus, MessageSquare, PanelLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createWelcomeMessage = useCallback((chart: { sun_sign: string; moon_sign: string; rising_sign: string }, mbti: string | null): Message => {
    return {
      role: "assistant",
      content: `Welcome! I'm Soulstice, your personal guide to self-discovery. I know you're a ${chart.sun_sign} Sun, ${chart.moon_sign} Moon, and ${chart.rising_sign} Rising${mbti ? `, with an ${mbti} personality` : ""}. I'm here to help you explore your inner world, process emotions, and grow. What's on your mind today?`,
    };
  }, []);

  const loadConversations = useCallback(async (currentUserId: string) => {
    const { data } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", currentUserId)
      .order("updated_at", { ascending: false });

    if (data) {
      setConversations(data);
    }
  }, []);

  useEffect(() => {
    async function loadProfileAndChat() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

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

      // Try to load the most recent conversation
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (conversations && conversations.length > 0) {
        const convId = conversations[0].id;
        setConversationId(convId);

        // Load messages for this conversation
        const { data: chatMessages } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });

        if (chatMessages && chatMessages.length > 0) {
          setMessages(chatMessages as Message[]);
        } else {
          // Empty conversation, add welcome message
          const welcomeMsg = createWelcomeMessage(chart, data.mbti);
          setMessages([welcomeMsg]);
          await saveMessage(convId, welcomeMsg);
        }
      } else {
        // No conversations yet, create one with welcome message
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, title: "New Chat" })
          .select("id")
          .single();

        if (newConv) {
          setConversationId(newConv.id);
          const welcomeMsg = createWelcomeMessage(chart, data.mbti);
          setMessages([welcomeMsg]);
          await saveMessage(newConv.id, welcomeMsg);
        }
      }

      // Load all conversations for the sidebar
      await loadConversations(user.id);

      setIsLoadingProfile(false);
    }

    loadProfileAndChat();
  }, [router, createWelcomeMessage, loadConversations]);

  const saveMessage = async (convId: string, message: Message) => {
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: message.role,
      content: message.content,
    });

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);
  };

  const switchConversation = async (convId: string) => {
    if (convId === conversationId) {
      setSidebarOpen(false);
      return;
    }

    const { data: chatMessages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    setConversationId(convId);
    setMessages(chatMessages as Message[] || []);
    setSidebarOpen(false);
  };

  const deleteConversation = async (convId: string) => {
    if (!userId) return;

    // Delete messages first (foreign key constraint)
    await supabase
      .from("chat_messages")
      .delete()
      .eq("conversation_id", convId);

    // Delete the conversation
    await supabase
      .from("conversations")
      .delete()
      .eq("id", convId);

    // Update local state
    const remainingConversations = conversations.filter(c => c.id !== convId);
    setConversations(remainingConversations);
    setDeleteConfirmId(null);

    // If we deleted the current conversation, switch to another or create new
    if (convId === conversationId) {
      if (remainingConversations.length > 0) {
        await switchConversation(remainingConversations[0].id);
      } else {
        await startNewConversation();
      }
    }
  };

  const startNewConversation = async () => {
    if (!userId || !profile) return;

    const { data: newConv } = await supabase
      .from("conversations")
      .insert({ user_id: userId, title: "New Chat" })
      .select("id")
      .single();

    if (newConv) {
      setConversationId(newConv.id);
      const welcomeMsg: Message = {
        role: "assistant",
        content: `Welcome back! I'm still here to help you explore your ${profile.sun_sign} Sun energy and continue your self-discovery journey. What would you like to talk about?`,
      };
      setMessages([welcomeMsg]);
      await saveMessage(newConv.id, welcomeMsg);
      // Refresh the conversation list
      await loadConversations(userId);
    }
    setSidebarOpen(false);
  };

  const generateTitle = async (message: string): Promise<string> => {
    try {
      const response = await fetch("http://localhost:8000/api/chat/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.title;
      }
    } catch (error) {
      console.error("Failed to generate title:", error);
    }
    // Fallback to simple truncation
    return message.length > 40 ? message.substring(0, 40) + "..." : message;
  };

  const sendMessage = async () => {
    if (!input.trim() || !profile || isLoading || !conversationId) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Check if this is the first user message (auto-name the chat)
    const isFirstUserMessage = !messages.some(m => m.role === "user");

    // Save user message to database
    await saveMessage(conversationId, userMessage);

    // Generate title in background (don't block the chat)
    if (isFirstUserMessage && userId) {
      generateTitle(userMessage.content).then(async (title) => {
        await supabase
          .from("conversations")
          .update({ title })
          .eq("id", conversationId);
        setConversations(prev =>
          prev.map(c => c.id === conversationId ? { ...c, title } : c)
        );
      });
    }

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
      const assistantMessage: Message = { role: "assistant", content: data.message };
      setMessages([...newMessages, assistantMessage]);

      // Save assistant message to database
      await saveMessage(conversationId, assistantMessage);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again.",
      };
      setMessages([...newMessages, errorMessage]);
      await saveMessage(conversationId, errorMessage);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen cosmic-gradient flex overflow-hidden">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - full height */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30
        bg-card/95 border-r border-border/50
        transition-all duration-200 ease-in-out
        flex flex-col
        ${sidebarOpen ? "w-72" : "-translate-x-full md:translate-x-0 md:w-14"}
      `}>
        {/* Collapsed state - just icons */}
        {!sidebarOpen && (
          <div
            className="hidden md:flex flex-col items-center py-2 gap-2 h-full cursor-pointer"
            onClick={() => setSidebarOpen(true)}
            title="Open sidebar"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 pointer-events-none"
            >
              <PanelLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                startNewConversation();
              }}
              title="New chat"
              className="h-10 w-10 pointer-events-auto"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Expanded state */}
        {sidebarOpen && (
          <div className="flex flex-col h-full w-72">
            <div className="p-2 border-b border-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  title="Close sidebar"
                  className="h-8 w-8"
                >
                  <PanelLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm font-medium">Chats</span>
                <div className="w-8" />
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={startNewConversation}
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.map((conv) => (
                <div key={conv.id} className="relative group">
                  {deleteConfirmId === conv.id ? (
                    <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-xs text-muted-foreground mb-2">Delete this chat?</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs flex-1"
                          onClick={() => deleteConversation(conv.id)}
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs flex-1"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => switchConversation(conv.id)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg transition-colors
                        flex items-start gap-2
                        ${conv.id === conversationId
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-muted/50 text-foreground"
                        }
                      `}
                    >
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(conv.updated_at)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main content area - fills remaining space */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border/50 glass">
          <div className="px-4 py-3 flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={startNewConversation}
                title="New conversation"
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {profile?.sun_sign} Sun
              </span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
          <div className="border-t border-border/50 glass">
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
      </div>
    </div>
  );
}
