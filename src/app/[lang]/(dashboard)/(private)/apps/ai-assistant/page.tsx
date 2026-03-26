"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import * as mammoth from "mammoth";
import Tesseract from "tesseract.js";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "ur-PK", label: "Urdu" },
  { code: "hi-IN", label: "Hindi" },
  { code: "roman", label: "Roman Urdu" },
];

function MelodyAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [doctorImg, setDoctorImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();

    img.src = "/images/apps/doctor.png";
    img.onload = () => setDoctorImg(img);
  }, []);

  useEffect(() => {
    let animationId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!ctx || !doctorImg) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(doctorImg, 0, 0, canvas.width, canvas.height);
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isSpeaking, doctorImg]);

  return (
    <canvas
      ref={canvasRef}
      width={128}
      height={160}
      className="rounded-xl border border-cyan-400"
    />
  );
}

export default function MelodyAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [callMode, setCallMode] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // ── SCROLL TO BOTTOM ONLY CHAT BODY ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);

      utter.rate = 1;
      utter.pitch = 1.1;
      utter.lang = language.code !== "roman" ? language.code : "ur-PK";

      const voices = window.speechSynthesis.getVoices();

      const femaleVoice = voices.find(
        (v) =>
          v.lang.includes(language.code.split("-")[0]) &&
          v.name.toLowerCase().includes("female")
      );

      if (femaleVoice) utter.voice = femaleVoice;

      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utter);
    },
    [language]
  );

  const startListening = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) return alert("Voice input not supported");

    const recognition = new SpeechRecognition();

    recognition.lang = language.code !== "roman" ? language.code : "ur-PK";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onend = () => {
      setIsListening(false);
      if (callMode) recognition.start();
    };

    recognition.onresult = async (e: any) => {
      const lastResult = e.results[e.results.length - 1];

      if (!lastResult.isFinal) return;
      const text = lastResult[0].transcript.trim();

      if (text) await handleSend(text);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleSend = async (content?: string) => {
    const msgText = content || input;

    if (!msgText.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msgText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setIsThinking(true);
    const reply = await askAI([...messages, userMsg]);

    const aiMsg: Message = {
      id: Date.now().toString(),
      role: "ai",
      content: reply,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);

    if (callMode) speakText(reply);
    setIsThinking(false);
  };

  const askAI = async (msgs: Message[]) => {
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs.map((m) => ({
            role: m.role === "ai" ? "assistant" : m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      setTimeout(() => speakText(data.reply), 100);

      return data.reply;
    } catch {
      return "⚠️ AI error";
    }
  };

  const extractSection = (text: string, section: string) => {
    const regex = new RegExp(
      `${section}:([\\s\\S]*?)(?=(🧾|💊|🏠|⚠️|$))`,
      "i"
    );

    const match = text.match(regex);


    return match ? match[1].trim() : "";
  };

  return (
    <div className="h-[810px] relative w-full h-[700px]  relative flex flex-col">
      <div className="absolute inset-0 animate-grid-pan pointer-events-none" />
      <div className="relative z-10 w-full h-full border border-cyan-900/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* SIDEBAR */}
        <div className="w-full md:w-56 border-r border-cyan-900/30 p-6 flex flex-col items-center gap-4">
          <MelodyAvatar isSpeaking={isSpeaking} />
          <div className="text-cyan-400 font-bold">Dr. Melody</div>
          <div className="text-xs text-cyan-600">AI Medical Assistant</div>

          <select
            value={language.code}
            onChange={(e) =>
              setLanguage(
                LANGUAGES.find((l) => l.code === e.target.value)!
              )
            }
            className="mt-2 px-2 py-1 rounded bg-cyan-950 border border-cyan-700 text-cyan-400 text-xs"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          {isThinking && <div className="text-amber-400 text-xs">Analyzing...</div>}
          {isListening && <div className="text-green-400 text-xs">Listening...</div>}
          {isSpeaking && <div className="text-cyan-400 text-xs">Speaking...</div>}
        </div>

        {/* CHAT */}
        <div className="flex-1 flex flex-col h-full">
          {/* Messages list with scroll */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-xl ${m.role === "user" ? "bg-cyan-400" : "border border-cyan-800"
                    }`}
                >
                  <p>{m.content}</p>
                  <div className="text-[10px] text-cyan-700/70 mt-1 text-right">
                    {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!callMode && (
            <div className="p-5 border-t flex flex-col gap-3">
              <input type="file" />
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your symptoms..."
                  className="flex-1 border bg-primary rounded-xl p-3"
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())
                  }
                />
                <button onClick={() => handleSend()} className="bg-primary px-4 rounded-xl">Send</button>
                <button onClick={startListening} className="bg-primary px-4 rounded-xl">🎤</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes grid-pan {0%{background-position:0 0}100%{background-position:40px 40px}}
        .animate-grid-pan{animation:grid-pan 20s linear infinite;}
      `}</style>
    </div>
  );
}
