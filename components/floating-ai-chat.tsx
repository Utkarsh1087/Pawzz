"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "🚨 Emergency first-aid for bleeding",
  "🐱 Stray kitten has eye discharge",
  "💉 Puppy vaccination schedule",
  "🥩 Foods toxic to dogs & cats",
];

export function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! 🐾 I'm **Pawzz AI**, your 24/7 animal care assistant. Ask me about pet symptoms, emergency first-aid, vaccination schedules, or finding nearby care.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      const replyText = data.reply || "Sorry, I had trouble processing that. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          content: "⚠️ Unable to connect right now. If this is an animal emergency, please visit our [Providers Directory](/providers) or contact the nearest veterinary clinic.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: "Chat cleared! How can I help your pet or rescue animal today? 🐾",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
      {/* ----------------- CHAT WINDOW ----------------- */}
      {isOpen && (
        <div
          className="mb-3 w-[370px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-120px)] bg-[#fffdfa] border border-[#e5d4c2] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          style={{ boxShadow: "0 18px 45px -8px rgba(110, 53, 25, 0.22)" }}
        >
          {/* Header */}
          <div className="bg-[#f5e9d9] border-b border-[#e5d4c2] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-amber-100 border border-amber-300 p-0.5 flex items-center justify-center shadow-xs overflow-hidden">
                <WavingCatWithPaw className="w-full h-full" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[#2d221b] leading-tight">Pawzz AI Assistant</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-[#7a685b] leading-none mt-0.5">24/7 Triage & Animal Guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 text-[#8c786a] hover:text-[#a95f32] hover:bg-[#ebd9c5] rounded-full transition-colors"
                aria-label="Clear chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-1.5 text-[#8c786a] hover:text-[#2d221b] hover:bg-[#ebd9c5] rounded-full transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#fffcf8] to-[#fff8ef]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#a95f32] text-white rounded-br-xs shadow-sm"
                      : "bg-white border border-[#ebdccc] text-[#2d221b] rounded-bl-xs shadow-sm"
                  }`}
                >
                  {/* Basic markdown rendering for bold, bullet points and links */}
                  <div className="whitespace-pre-wrap space-y-1">
                    {msg.content.split("\n").map((line, idx) => {
                      if (line.startsWith("• ") || line.startsWith("- ")) {
                        return (
                          <div key={idx} className="flex items-start gap-1 pl-1">
                            <span className="text-[#a95f32] font-bold">•</span>
                            <span>{renderFormattedText(line.substring(2))}</span>
                          </div>
                        );
                      }
                      return <p key={idx}>{renderFormattedText(line)}</p>;
                    })}
                  </div>
                </div>
                <span className="text-[10px] text-[#a49182] mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 p-3 bg-white border border-[#ebdccc] rounded-2xl rounded-bl-xs w-20 shadow-sm">
                <span className="w-2 h-2 bg-[#a95f32] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#a95f32] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-[#a95f32] rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips (shown when few messages) */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-[#faf3ea] border-t border-[#ebdccc] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 text-[11px] bg-white hover:bg-[#f3e7d8] text-[#714324] border border-[#e2cfbe] px-2.5 py-1 rounded-full transition-colors shadow-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[#e5d4c2] flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about symptoms, first-aid..."
              disabled={isLoading}
              className="flex-1 bg-[#fdf9f4] border border-[#d9c7b5] focus:border-[#a95f32] focus:bg-white focus:outline-none rounded-full px-3.5 py-2 text-xs sm:text-sm text-[#2d221b] placeholder-[#a49182] transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 rounded-full bg-[#a95f32] hover:bg-[#8d4921] disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
              aria-label="Send message"
            >
              <svg className="w-4 h-4 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Clinical Safety Disclaimer Footer */}
          <div className="bg-[#f5e9d9] px-3 py-1.5 text-center border-t border-[#ebdccc]">
            <p className="text-[10px] text-[#7a685b] leading-tight">
              AI guidance for informational triage only. Not a veterinary prescription.{" "}
              <Link href="/ai" className="text-[#a95f32] font-semibold underline hover:text-[#78350f]">
                Full Triage &rarr;
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ----------------- FLOATING LAUNCHER (COMPACT WAVING CAT + "ASK ME!" SPEECH) ----------------- */}
      <div className="relative flex flex-col items-center">
        {/* Floating "Ask me!" speech bubble above the cat (visible when chat is closed) */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="mb-0.5 px-2 py-0.5 bg-[#fffaf3] border-1.5 border-[#a95f32] text-[#7c2d12] font-extrabold text-[10px] rounded-full shadow-md cursor-pointer animate-bounce hover:bg-amber-100 transition-colors flex items-center gap-0.5 select-none z-10"
          >
            <span>Ask me!</span>
            <span className="text-[10px]">🐾</span>
            {/* Pointer triangle */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#a95f32]"></div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative cursor-pointer select-none transition-all duration-200 transform hover:scale-110 active:scale-95 focus:outline-none p-0 bg-transparent border-none flex items-center justify-center"
          aria-label="Toggle AI Animal Care Assistant"
          title="Chat with Pawzz AI"
        >
          {/* Unread dot */}
          {hasUnread && (
            <span className="absolute top-0 right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full animate-bounce z-20"></span>
          )}

          {/* Waving Cat vs Close Icon */}
          {isOpen ? (
            <div className="w-10 h-10 rounded-full bg-[#a95f32] text-white flex items-center justify-center shadow-2xl border-2 border-amber-100/40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="w-14 h-14 flex items-center justify-center filter drop-shadow-md">
              <WavingCatWithPaw className="w-full h-full" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Animated Waving Cat with distinct raised waving paw (steady bright eyes)
 */
function WavingCatWithPaw({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} select-none pointer-events-none overflow-visible`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wCatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fbf0e4" />
        </linearGradient>
        <linearGradient id="wCatOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#df7a38" />
          <stop offset="100%" stopColor="#b35720" />
        </linearGradient>
        <linearGradient id="wCatPink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>

      {/* Head & Body Group */}
      <g className="waving-cat-head">
        {/* Left Perked Ear */}
        <g className="kitty-ear-left">
          <polygon
            points="24,38 16,14 42,26"
            fill="url(#wCatOrange)"
            stroke="#2d221b"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <polygon points="25,34 20,18 38,27" fill="url(#wCatPink)" />
        </g>

        {/* Right Perked Ear */}
        <g className="kitty-ear-right">
          <polygon
            points="76,38 84,14 58,26"
            fill="#3b2d24"
            stroke="#2d221b"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <polygon points="75,34 80,18 62,27" fill="url(#wCatPink)" />
        </g>

        {/* Body Base */}
        <ellipse cx="50" cy="74" rx="34" ry="22" fill="url(#wCatGrad)" stroke="#2d221b" strokeWidth="3.4" />
        <path d="M 66 62 C 76 66 82 74 80 84 C 70 90 62 82 60 72 Z" fill="url(#wCatOrange)" />

        {/* Head Base */}
        <circle cx="50" cy="50" r="28" fill="url(#wCatGrad)" stroke="#2d221b" strokeWidth="3.4" />

        {/* Calico Eye Patch on Head */}
        <path d="M 58 24 C 68 26 76 36 74 50 C 66 56 58 52 54 40 Z" fill="url(#wCatOrange)" opacity="0.92" />

        {/* Big Bright Steady Eyes (No Blinking) */}
        <g className="cat-eyes-steady">
          <ellipse cx="38" cy="48" rx="5.5" ry="6.8" fill="#2d221b" />
          <circle cx="36" cy="45.5" r="2.2" fill="#ffffff" />
          <circle cx="39.5" cy="49.5" r="1.1" fill="#ffffff" />

          <ellipse cx="62" cy="48" rx="5.5" ry="6.8" fill="#2d221b" />
          <circle cx="60" cy="45.5" r="2.2" fill="#ffffff" />
          <circle cx="63.5" cy="49.5" r="1.1" fill="#ffffff" />
        </g>

        {/* Pink Button Nose */}
        <polygon points="50,55 46.5,51 53.5,51" fill="#f472b6" stroke="#2d221b" strokeWidth="1.4" strokeLinejoin="round" />

        {/* Sweet Smile Mouth (ω) */}
        <path d="M 44 57 Q 47 61 50 57 Q 53 61 56 57" fill="none" stroke="#2d221b" strokeWidth="2.4" strokeLinecap="round" />

        {/* Rosy Cheeks */}
        <circle cx="28" cy="55" r="5" fill="#fb7185" opacity="0.5" />
        <circle cx="72" cy="55" r="5" fill="#fb7185" opacity="0.5" />

        {/* Whiskers */}
        <g stroke="#3d2c20" strokeWidth="1.8" strokeLinecap="round">
          <line x1="26" y1="52" x2="10" y2="49" />
          <line x1="26" y1="56" x2="8" y2="57" />
          <line x1="74" y1="52" x2="90" y2="49" />
          <line x1="74" y1="56" x2="92" y2="57" />
        </g>

        {/* Left Resting Paw */}
        <ellipse cx="34" cy="76" rx="7" ry="5" fill="#ffffff" stroke="#2d221b" strokeWidth="2.5" />
      </g>

      {/* ----------------- SEPARATED WAVING HAND & ARM ----------------- */}
      <g className="waving-cat-paw">
        {/* Raised Forearm Sleeve */}
        <path
          d="M 66 68 C 70 54 76 42 82 34 C 86 32 94 36 94 44 C 90 54 82 64 76 72 Z"
          fill="url(#wCatGrad)"
          stroke="#2d221b"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* Round Hand / Palm */}
        <circle cx="86" cy="30" r="10" fill="#ffffff" stroke="#2d221b" strokeWidth="3" />

        {/* 4 Little Finger Toes */}
        <ellipse cx="78" cy="24" rx="3.2" ry="4" fill="#ffffff" stroke="#2d221b" strokeWidth="2.2" />
        <ellipse cx="84" cy="20" rx="3.2" ry="4.5" fill="#ffffff" stroke="#2d221b" strokeWidth="2.2" />
        <ellipse cx="90" cy="21" rx="3.2" ry="4.5" fill="#ffffff" stroke="#2d221b" strokeWidth="2.2" />
        <ellipse cx="95" cy="26" rx="3" ry="3.8" fill="#ffffff" stroke="#2d221b" strokeWidth="2.2" />

        {/* Pink Palm Pad */}
        <ellipse cx="86" cy="31" rx="4.5" ry="3.8" fill="#f472b6" />

        {/* Pink Toe Beans */}
        <circle cx="78" cy="24" r="1.5" fill="#f472b6" />
        <circle cx="84" cy="20" r="1.5" fill="#f472b6" />
        <circle cx="90" cy="21" r="1.5" fill="#f472b6" />
        <circle cx="95" cy="26" r="1.4" fill="#f472b6" />

        {/* Friendly Waving Motion Arcs (👋) */}
        <path d="M 101 16 Q 105 22 103 28" fill="none" stroke="#e07d3a" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M 106 12 Q 111 20 108 30" fill="none" stroke="#e07d3a" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      </g>
    </svg>
  );
}

// Simple bold / link formatter for inline assistant responses
function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-[#1f1611]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
