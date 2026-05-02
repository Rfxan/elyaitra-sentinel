import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  BookOpen,
  Sparkles,
  Layers,
  Check,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  pages: number;
}

interface NotesPanelProps {
  onNoteSelect: (note: Note | null) => void;
  onGenerateSummary: () => void;
  onGenerateFlashcards: () => void;
  onStartTutoring: () => void;
  selectedNote: Note | null;
  subjectFilter?: string;
}

const preloadedNotes: Note[] = [
  { id: "1", title: "Introduction to Machine Learning", subject: "AI", topic: "ML Basics", difficulty: "Beginner", pages: 24 },
  { id: "2", title: "Neural Networks Deep Dive", subject: "AI", topic: "Deep Learning", difficulty: "Advanced", pages: 48 },
  { id: "3", title: "Python Data Structures", subject: "Programming", topic: "Python", difficulty: "Intermediate", pages: 32 },
  { id: "4", title: "Organic Chemistry Fundamentals", subject: "Chemistry", topic: "Organic", difficulty: "Beginner", pages: 56 },
  { id: "5", title: "Thermodynamics Principles", subject: "Mechanical", topic: "Thermodynamics", difficulty: "Intermediate", pages: 40 },
];

const difficultyColors = {
  Beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const NotesPanel = ({ onNoteSelect, onGenerateSummary, onGenerateFlashcards, onStartTutoring, selectedNote, subjectFilter }: NotesPanelProps) => {
  // If subjectFilter is provided, use it directly; otherwise allow manual filtering
  const baseNotes = subjectFilter 
    ? preloadedNotes.filter((note) => note.subject === subjectFilter)
    : preloadedNotes;
  
  const filteredNotes = baseNotes;

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-r border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Study Notes</h2>
            <p className="text-xs text-muted-foreground">Select notes to study</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Notes List */}
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onNoteSelect(note)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all group",
                  selectedNote?.id === note.id
                    ? "bg-primary/10 border-primary/50 shadow-md"
                    : "bg-background/50 border-border/50 hover:bg-accent/50 hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    selectedNote?.id === note.id ? "bg-primary/20" : "bg-muted/50 group-hover:bg-primary/10"
                  )}>
                    <FileText className={cn(
                      "w-5 h-5",
                      selectedNote?.id === note.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{note.title}</span>
                      {selectedNote?.id === note.id && (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{note.topic}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{note.pages} pages</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("mt-2 text-xs", difficultyColors[note.difficulty])}
                    >
                      {note.difficulty}
                    </Badge>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
                    selectedNote?.id === note.id && "text-primary rotate-90"
                  )} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <Button
          className="w-full gap-2"
          disabled={!selectedNote}
          onClick={onStartTutoring}
        >
          <BookOpen className="w-4 h-4" />
          Use for Tutoring
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={onGenerateSummary}
            disabled={!selectedNote}
          >
            <Sparkles className="w-4 h-4" />
            Summary
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={onGenerateFlashcards}
            disabled={!selectedNote}
          >
            <Layers className="w-4 h-4" />
            Flashcards
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
