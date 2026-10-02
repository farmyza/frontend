"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, X } from "lucide-react";
import { DiagnosticResponse } from "@/lib/schemas";
import { ChatMessage, ChatMessageBubble } from "@/components/assistant/ChatMessageBubble";

interface AgronomistChatProps {
  diagnosticData: DiagnosticResponse | null;
  locale: "en" | "bn";
  onClose?: () => void;
}

export const AgronomistChat: React.FC<AgronomistChatProps> = ({
  diagnosticData,
  locale,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text:
        locale === "bn"
          ? "নমস্কার/সালাম! আমি আপনার ডিজিটাল কৃষি উপদেষ্টা। নির্বাচিত শস্য বিন্যাস, মাটির উর্বরতা, সার সাশ্রয় বা আবহাওয়া সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন।"
          : "Hello! I am your Agro-Decision Assistant. Ask me anything about this rotation sequence, soil nutrient balance, fertilizer cost savings, or weather risks.",
      timestamp: "Just now",
      suggestedFollowUps: [
        locale === "bn" ? "ডাল শস্য চাষে কত সার সাশ্রয় হবে?" : "How much fertilizer do I save with legumes?",
        locale === "bn" ? "মাটির লবণাক্ততা কমানোর উপায় কি?" : "How does this sequence lower soil salinity?",
        locale === "bn" ? "সরিষার বদলে আলু চাষ করা যাবে?" : "Can I plant commercial potato instead of mustard?",
        locale === "bn" ? "সেচের পানি কতটুকু সাশ্রয় হবে?" : "How much irrigation water is saved?",
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/v1/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          locale,
          context: diagnosticData
            ? {
                fieldOverview: diagnosticData.fieldOverview,
                diagnostics: diagnosticData.diagnostics,
                recommendations: diagnosticData.recommendations,
              }
            : undefined,
        }),
      });

      if (!res.ok) throw new Error("Assistant request failed");
      const json = await res.json();

      const assistantReply = locale === "bn" ? json.replyBn : json.replyEn;

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: "assistant",
        text: assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        referencedFactors: json.referencedFactors,
        suggestedFollowUps: json.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        sender: "assistant",
        text:
          locale === "bn"
            ? "দুঃখিত, সংযোগ বিঘ্নিত হয়েছে। তবে প্রস্তাবিত শস্য বিন্যাসটি মাটির স্বাস্থ্য ও আয়ের জন্য পুরোপুরি কার্যকর।"
            : "The rotation sequence is engineered to maximize gross margin while revitalizing soil nitrogen balance.",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{locale === "bn" ? "এআই কৃষি পরামর্শক (LLM Explainer)" : "AI Agronomic Advisor (LLM Explainer)"}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h3>
            <p className="text-[11px] text-slate-500">
              {locale === "bn"
                ? "মেশিন লার্নিং সিদ্ধান্ত নেয়, এলএলএম সহজ ভাষায় ব্যাখ্যা করে"
                : "ML decides the rotation matrix; AI explains the scientific rationale"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            Domain Guardrails Active
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/30">
        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            msg={msg}
            locale={locale}
            onSelectFollowUp={(prompt) => handleSendMessage(prompt)}
          />
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>{locale === "bn" ? "কৃষিতাত্ত্বিক পরামর্শ তৈরি হচ্ছে..." : "Synthesizing agronomic rationale..."}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputQuery);
        }}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            locale === "bn"
              ? "শস্যের জাত, সার সাশ্রয় বা সেচ সংক্রান্ত প্রশ্ন লিখুন..."
              : "Ask about crop variety, fertilizer savings, or irrigation..."
          }
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white transition-all active:scale-95 cursor-pointer shadow-xs"
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
