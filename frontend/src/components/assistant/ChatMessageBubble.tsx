"use client";

import React from "react";
import { Sparkles, User, HelpCircle, ChevronRight } from "lucide-react";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  referencedFactors?: string[];
  suggestedFollowUps?: string[];
}

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  locale: "en" | "bn";
  onSelectFollowUp: (prompt: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  msg,
  locale,
  onSelectFollowUp,
}) => {
  const isUser = msg.sender === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
          isUser
            ? "bg-emerald-700 text-white shadow-xs rounded-tr-none font-medium"
            : "bg-white text-slate-800 border border-slate-200/90 shadow-xs rounded-tl-none"
        }`}
      >
        <p className="whitespace-pre-line">{msg.text}</p>

        {msg.referencedFactors && msg.referencedFactors.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Grounding:</span>
            {msg.referencedFactors.map((f, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-emerald-600" />
              {locale === "bn" ? "প্রস্তাবিত পরবর্তী প্রশ্ন:" : "Suggested Follow-ups:"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {msg.suggestedFollowUps.map((chip, cIdx) => (
                <button
                  key={cIdx}
                  onClick={() => onSelectFollowUp(chip)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 border border-slate-200 text-[11px] font-medium text-left transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{chip}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <span
          className={`text-[9px] block mt-1.5 font-mono ${
            isUser ? "text-emerald-200 text-right" : "text-slate-400"
          }`}
        >
          {msg.timestamp}
        </span>
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
