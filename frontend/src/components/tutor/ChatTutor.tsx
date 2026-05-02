import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Brain,
  Lightbulb,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import VoiceInput from "./VoiceInput";

/* ---------------- TYPES ---------------- */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatTutorProps {
  subjectName: string;
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => Promise<void>;
}

/* ---------------- UI DATA ---------------- */

const suggestedPrompts = [
  { icon: BookOpen, text: "Explain this concept in simple terms" },
  { icon: Brain, text: "Give me practice questions" },
  { icon: Lightbulb, text: "What are the key takeaways?" },
  { icon: Sparkles, text: "Create a study guide" },
];

/* ---------------- COMPONENT ---------------- */

export default function ChatTutor({
  subjectName,
  messages,
  loading,
  onSend,
}: ChatTutorProps) {
  const [input, setInput] = useState("");
  const [isTTSActive, setIsTTSActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // TTS Implementation
    if (isTTSActive && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        // Cancel any pending speech
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lastMessage.content.replace(/[#*`]/g, ''));
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, isTTSActive]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    await onSend(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">{subjectName} Tutor</h3>
          <p className="text-xs text-muted-foreground">
            Exam-focused AI assistance
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Start Learning {subjectName}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Ask a syllabus-based question to begin.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handlePromptClick(p.text)}
                    className="flex items-center gap-2 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/50 transition-all text-left"
                  >
                    <p.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    m.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      m.role === "user"
                        ? "bg-primary"
                        : "bg-primary/10"
                    )}
                  >
                    {m.role === "user" ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>

                  <div
                    className={cn(
                      "max-w-[90%] rounded-2xl px-4 py-3 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-card border border-border/50 shadow-sm"
                    )}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words leading-relaxed">
                        <ReactMarkdown>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground text-sm">
                    Thinking…
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 bg-card/30">
        <div className="flex items-end gap-2 bg-background border border-border rounded-2xl p-2 shadow-sm">
          <VoiceInput 
            onTranscript={(text) => setInput(text)}
            isTTSActive={isTTSActive}
            setIsTTSActive={setIsTTSActive}
          />
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a ${subjectName} question…`}
            className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 min-h-[40px] py-2"
            rows={1}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            size="icon"
            className="rounded-xl h-9 w-9 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
