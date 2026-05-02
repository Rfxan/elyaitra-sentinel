import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import ChatTutor from "@/components/tutor/ChatTutor";
import FlowchartCanvas from "@/components/tutor/FlowchartCanvas";
import FlashcardViewer from "@/components/tutor/FlashcardViewer";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

/* --------------------------------------------------
   SUBJECT CONFIG (UI)
-------------------------------------------------- */
const SUBJECTS: Record<string, { title: string; description: string }> = {
  ai: {
    title: "Artificial Intelligence",
    description: "AI concepts, machine learning basics, and exam-oriented preparation.",
  },
  chemistry: {
    title: "Chemistry",
    description: "Exam-focused chemistry explanations with diagrams and revision.",
  },
  mechanical: {
    title: "Mechanical Engineering",
    description: "Core mechanical concepts explained clearly for exams.",
  },
  programming: {
    title: "Python Programming",
    description: "Python logic, coding practice, and exam-focused preparation.",
  },
};

/* --------------------------------------------------
   SUBJECT → BACKEND MAP (CRITICAL)
-------------------------------------------------- */
const SUBJECT_MAP: Record<string, string> = {
  ai: "artificial-intelligence",
  chemistry: "chemistry",
  mechanical: "mechanical",
  programming: "python",
};

/* --------------------------------------------------
   SUBJECT → UNITS
-------------------------------------------------- */
const SUBJECT_UNITS: Record<string, string[]> = {
  ai: ["1", "2", "3", "4"],
  chemistry: ["1", "2", "3", "4", "5"],
  mechanical: ["1", "2", "3", "4", "5"],
  programming: ["1", "2", "3", "4", "5"],
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Tutor() {
  const { subject } = useParams();
  const navigate = useNavigate();

  const subjectData = subject ? SUBJECTS[subject] : null;
  const backendSubject = subject ? SUBJECT_MAP[subject] : null;

  /* --------------------------------------------------
     AUTH + PAYMENT GUARD
  -------------------------------------------------- */
  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      navigate("/signup", { replace: true });
    }
  }, [navigate]);

  /* --------------------------------------------------
     SUBJECT GUARD
  -------------------------------------------------- */
  useEffect(() => {
    if (!subjectData || !backendSubject) {
      navigate("/subjects", { replace: true });
    }
  }, [subjectData, backendSubject, navigate]);

  /* --------------------------------------------------
     STATE
  -------------------------------------------------- */
  const [activeTab, setActiveTab] =
    useState<"chat" | "flowcharts" | "flashcards">("chat");

  const [unit, setUnit] = useState(
    SUBJECT_UNITS[subject ?? ""]?.[0] ?? "1"
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  /* --------------------------------------------------
     CHAT HANDLER (BACKEND CONNECTED)
  -------------------------------------------------- */
  async function handleSend(message: string) {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(localStorage.getItem("user_id")),
          subject: backendSubject,
          unit,
          topic: unit,
          mode: "chat",
          message,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "No answer received.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to reach the AI tutor. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!subjectData || !backendSubject) return null;

  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* LEFT / MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-14 border-b border-border/50 bg-card/30 backdrop-blur flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/subjects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>

            <div>
              <h1 className="text-sm font-semibold">{subjectData.title}</h1>
              <p className="text-xs text-muted-foreground">
                {subjectData.description}
              </p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            {["chat", "flowcharts", "flashcards"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  activeTab === tab
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "chat" && "Chat"}
                {tab === "flowcharts" && "Flowcharts"}
                {tab === "flashcards" && "Flashcards"}
              </button>
            ))}
          </div>
        </header>

        {/* UNIT SELECTOR */}
        <div className="px-4 py-3 border-b border-border/50">
          <label className="text-xs text-muted-foreground mr-2">Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            {SUBJECT_UNITS[subject]?.map((u) => (
              <option key={u} value={u}>
                Unit {u}
              </option>
            ))}
          </select>
        </div>
        {/* CONTENT */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && (
            <ChatTutor
              subjectName={subjectData.title}
              messages={messages}
              loading={loading}
              onSend={handleSend}
            />
          )}

          {activeTab === "flowcharts" && <FlowchartCanvas />}

          {activeTab === "flashcards" && <FlashcardViewer />}
        </div>
      </div>
    </div>
  );
}
