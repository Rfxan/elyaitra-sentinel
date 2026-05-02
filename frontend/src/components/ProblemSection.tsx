import { useEffect, useRef, useState } from "react";

interface ProblemCard {
  text: string;
  position: { x: string; y: string };
  variant: "default" | "highlight" | "emphasis";
  delay: number;
}

const problemCards: ProblemCard[] = [
  { text: "Struggling to understand?", position: { x: "10%", y: "18%" }, variant: "default", delay: 0 },
  { text: "Can't crack concepts?", position: { x: "70%", y: "12%" }, variant: "emphasis", delay: 0.2 },
  { text: "Confused?", position: { x: "3%", y: "50%" }, variant: "highlight", delay: 0.4 },
  { text: "Too many resources, no direction?", position: { x: "55%", y: "38%" }, variant: "default", delay: 0.6 },
  { text: "Feeling left behind", position: { x: "65%", y: "62%" }, variant: "emphasis", delay: 0.8 },
  { text: "Exams coming, nothing's clear", position: { x: "15%", y: "72%" }, variant: "default", delay: 1 },
];

const ProblemSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 px-6 overflow-hidden bg-[#0a0c10]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(7,186,255,0.05)_0%,_transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white italic">Every Student's Struggle</h2>
        </div>

        {/* Main container */}
        <div className={`relative aspect-[16/10] max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Outer frame with gradient border */}
          <div className="absolute inset-0 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0d1117] to-[#0a0c10]" />
          
          {/* Animated SVG dashed lines connecting to center */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {problemCards.map((card, i) => {
              const startX = parseFloat(card.position.x) + 10;
              const startY = parseFloat(card.position.y) + 5;
              return (
                <line
                  key={i}
                  x1={startX}
                  y1={startY}
                  x2="50"
                  y2="50"
                  stroke="rgba(100,120,140,0.3)"
                  strokeWidth="0.2"
                  strokeDasharray="1.5 1.5"
                  className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transitionDelay: `${card.delay + 0.5}s` }}
                />
              );
            })}
          </svg>

          {/* Floating dots on lines */}
          {[
            { x: "30%", y: "30%" },
            { x: "62%", y: "25%" },
            { x: "25%", y: "52%" },
            { x: "45%", y: "58%" },
            { x: "70%", y: "48%" },
            { x: "55%", y: "55%" },
            { x: "50%", y: "8%" },
            { x: "78%", y: "42%" },
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full bg-primary/50 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ left: pos.x, top: pos.y, transitionDelay: `${i * 0.15}s` }}
            />
          ))}

          {/* Central element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            {/* Main box */}
            <div className="relative w-24 h-24 rounded-2xl bg-[#0d1117] border border-white/10 flex items-center justify-center shadow-[0_0_60px_rgba(7,186,255,0.15)]">
              <span className="text-5xl font-bold text-primary">?</span>
            </div>
          </div>

          {/* Problem cards */}
          {problemCards.map((card, index) => (
            <div
              key={index}
              className={`absolute transition-all duration-700 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{
                left: card.position.x,
                top: card.position.y,
                transitionDelay: `${card.delay + 0.3}s`
              }}
            >
              <div
                className={`
                  px-5 py-3 rounded-xl border
                  transition-all duration-300 hover:scale-105 cursor-default
                  ${card.variant === 'highlight' 
                    ? 'bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(7,186,255,0.3)]' 
                    : card.variant === 'emphasis'
                    ? 'bg-[#1a1f2e] border-white/15'
                    : 'bg-[#13161d] border-white/10'
                  }
                `}
              >
                <p className={`text-sm font-medium whitespace-nowrap ${
                  card.variant === 'highlight' ? 'text-primary' : 'text-white/90'
                }`}>
                  {card.text}
                </p>
              </div>
            </div>
          ))}

          {/* Top center dot */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/40" />
          
          {/* Bottom accent line */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
