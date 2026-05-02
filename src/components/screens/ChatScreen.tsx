import React, { useState, useRef, useEffect } from "react";
import { UserProfile, Language } from "../../types";
import { useTranslation } from "../../lib/i18n";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const SYSTEM_PROMPT = "You are Healthu, a sympathetic and knowledgeable health assistant for the MedVault app. Provide helpful medical information but always include a disclaimer that you are an AI and not a doctor. Be concise and use a warm, supportive tone. Focus on helping patients understand their records and giving general health advice.";

type Message = {
  role: "user" | "model";
  parts: { text: string }[];
};

export const ChatScreen: React.FC<{ profile: UserProfile | null; lang: Language }> = ({ profile, lang }) => {
  const t = useTranslation(lang);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      parts: [{ text: input }],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMessage],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          maxOutputTokens: 1000,
        },
      });

      const botMessage: Message = {
        role: "model",
        parts: [{ text: response.text || "I couldn't generate a response." }],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        role: "model",
        parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again later." }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-4 pt-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 opacity-70">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Bot className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold">I'm Healthu</h3>
            <p className="text-sm text-gray-500">Ask me anything about your symptoms, records, or general health advice.</p>
            <div className="grid grid-cols-1 gap-2 w-full mt-4">
              <button 
                onClick={() => setInput("What should I do for a common cold?")}
                className="p-3 bg-white border border-gray-100 rounded-xl text-xs text-left hover:bg-blue-50 transition-colors"
              >
                "What should I do for a common cold?"
              </button>
              <button 
                onClick={() => setInput("Explain my blood group A+ significance.")}
                className="p-3 bg-white border border-gray-100 rounded-xl text-xs text-left hover:bg-blue-50 transition-colors"
              >
                "Explain my blood group A+ significance."
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {m.role === "user" ? (
                    <UserIcon className="w-3 h-3 text-blue-200" />
                  ) : (
                    <Bot className="w-3 h-3 text-blue-500" />
                  )}
                  <span className="text-[10px] font-bold uppercase opacity-70 tracking-wider">
                    {m.role === "user" ? "You" : "Healthu"}
                  </span>
                </div>
                <div className="text-sm prose prose-sm max-w-none">
                   <ReactMarkdown>{m.parts[0].text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-xs text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-4 pr-16 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-xl disabled:opacity-50 transition-all active:scale-90"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
