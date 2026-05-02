import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Check,
  X,
  Edit3,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  status: "unknown" | "known" | "revision";
}

const mockFlashcards: Flashcard[] = [
  { id: "1", front: "Second generation solar cells are commonly known as _____ solar cells.", back: "thin-film solar cells", status: "unknown" },
  { id: "2", front: "How are thin-film solar cells constructed?", back: "They are made by depositing one or more very thin layers of photovoltaic materials onto substrates like glass, plastic, or metal.", status: "unknown" },
  { id: "3", front: "What is a key advantage of the thin-film construction of second generation solar cells?", back: "t reduces material use and allows for the creation of flexible and lightweight solar panels.", status: "unknown" },
  { id: "4", front: "What is the main technological goal of third generation solar cells?", back: "They are designed to surpass the efficiency and cost limitations of earlier generations, aiming to break the Shockley-Queisser limit.", status: "unknown" },
  { id: "5", front: "How do Dye-Sensitized Solar Cells (DSSCs) function to generate charge?", back: "They use a photosensitive dye to capture sunlight and create electron-hole pairs, often with a semiconductor like titanium dioxide.", status: "unknown" },
];

const FlashcardViewer = () => {
  const [cards, setCards] = useState<Flashcard[]>(mockFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const currentCard = cards[currentIndex];
  const knownCount = cards.filter((c) => c.status === "known").length;
  const revisionCount = cards.filter((c) => c.status === "revision").length;

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const shuffleCards = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const resetCards = () => {
    setCards(cards.map((c) => ({ ...c, status: "unknown" })));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const markCard = (status: "known" | "revision") => {
    setCards((prev) =>
      prev.map((card, index) =>
        index === currentIndex ? { ...card, status } : card
      )
    );
    nextCard();
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Flashcards</h3>
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1} of {cards.length} cards
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <Check className="w-3 h-3 mr-1" />
            {knownCount} Known
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
            <RotateCcw className="w-3 h-3 mr-1" />
            {revisionCount} Review
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted/50 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full max-w-lg h-72 cursor-pointer perspective-1000"
        >
          <div
            className={cn(
              "absolute inset-0 transition-all duration-500 transform-style-3d",
              isFlipped && "rotate-y-180"
            )}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className={cn(
                "absolute inset-0 rounded-2xl border-2 p-6 flex flex-col items-center justify-center text-center backface-hidden",
                currentCard.status === "known"
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : currentCard.status === "revision"
                  ? "border-amber-500/50 bg-amber-500/5"
                  : "border-primary/30 bg-card"
              )}
              style={{ backfaceVisibility: "hidden" }}
            >
              <Badge variant="outline" className="mb-4">Question</Badge>
              <p className="text-xl font-medium">{currentCard.front}</p>
              <p className="text-sm text-muted-foreground mt-4">Click to flip</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl border-2 border-primary/30 bg-card p-6 flex flex-col items-center justify-center text-center backface-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <Badge variant="default" className="mb-4">Answer</Badge>
              <p className="text-lg">{currentCard.back}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4 mt-6">
        {/* Mark as Known/Revision */}
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            className="gap-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            onClick={() => markCard("revision")}
          >
            <X className="w-4 h-4" />
            Need Revision
          </Button>
          <Button
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => markCard("known")}
          >
            <Check className="w-4 h-4" />
            Got It!
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={prevCard}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={shuffleCards}>
            <Shuffle className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetCards}>
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextCard}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardViewer;
