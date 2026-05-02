import { useEffect, useRef, useState } from "react";
import { Sparkles, Zap, Brain, Target, TrendingUp, Clock } from "lucide-react";

import aiChatMockup from "@/assets/ai-chat-mockup.png";
import flowchartMockup from "@/assets/flowchart-mockup.png";
import flashcardsMockup from "@/assets/flashcards-mockup.png";
import quizMockup from "@/assets/quiz-mockup.png";

const features = [
  { icon: Zap, title: "Instant Answers", desc: "Get help in seconds, not hours" },
  { icon: Brain, title: "AI-Powered", desc: "Smart learning that adapts to you" },
  { icon: Target, title: "Focused Learning", desc: "Master concepts step by step" },
  { icon: TrendingUp, title: "Track Progress", desc: "See your improvement daily" },
  { icon: Clock, title: "24/7 Available", desc: "Learn anytime, anywhere" },
  { icon: Sparkles, title: "Personalized", desc: "Tailored to your goals" },
];

const showcaseItems = [
  { image: aiChatMockup, title: "AI Chat", subtitle: "Ask anything, get instant explanations" },
  { image: flowchartMockup, title: "Smart Flowcharts", subtitle: "Visualize complex topics easily" },
  { image: flashcardsMockup, title: "Flashcards", subtitle: "Remember everything with spaced repetition" },
  { image: quizMockup, title: "Smart Quizzes", subtitle: "Test your knowledge adaptively" },
];

const ShowcaseSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate through showcase items
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % showcaseItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-6 overflow-hidden bg-background"
    >
      {/* Animated matrix/code rain background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Vertical animated lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-px h-full"
            style={{
              left: `${(i + 1) * 5}%`,
              background: `linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.3) 20%, hsl(var(--primary) / 0.6) 50%, hsl(var(--primary) / 0.3) 80%, transparent 100%)`,
              animation: `matrixFall ${3 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}

        {/* Glowing orbs on sides */}
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        
        {/* Top center glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-wider mb-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            }`}
          >
            <span className="text-white">What You </span>
            <span className="text-primary">Get</span>
          </h2>
          <p
            className={`text-muted-foreground text-lg max-w-2xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Everything you need to supercharge your learning journey
          </p>
        </div>

        {/* Main showcase area */}
        <div
          className={`relative transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Image showcase */}
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effects */}
            <div className="absolute -inset-8 bg-gradient-to-b from-primary/20 via-transparent to-primary/20 rounded-[40px] blur-3xl opacity-60" />
            
            {/* Image carousel - no frame */}
            <div className="relative">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                {showcaseItems.map((item, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-out ${
                      index === activeIndex
                        ? "opacity-100 scale-100 blur-0"
                        : "opacity-0 scale-110 blur-sm"
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating animated label */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-card via-card to-card border border-primary/40 shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(var(--primary)/0.3)]">
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-50" />
              </div>
              <span className="text-white font-bold text-xl tracking-wide">
                {showcaseItems[activeIndex].title}
              </span>
            </div>
          </div>

          {/* Feature title below device */}
          <div className="text-center mt-16">
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-wider">
              <span className="text-primary">{showcaseItems[activeIndex].title.split(' ')[0]}</span>
              <span className="text-white"> {showcaseItems[activeIndex].title.split(' ').slice(1).join(' ') || ''}</span>
            </h3>
            <p className="text-muted-foreground mt-2 text-lg">
              {showcaseItems[activeIndex].subtitle}
            </p>
          </div>

          {/* Dots navigation */}
          <div className="flex justify-center gap-3 mt-8">
            {showcaseItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "bg-primary scale-125 shadow-lg shadow-primary/50"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Advantage cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative p-4 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm text-center transition-all duration-500 hover:border-primary/50 hover:bg-card/60 hover:-translate-y-1 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">{feature.title}</h4>
                <p className="text-muted-foreground text-xs">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes matrixFall {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default ShowcaseSection;
