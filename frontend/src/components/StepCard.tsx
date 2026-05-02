import { useEffect, useRef, useState } from "react";

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  delay?: number;
}

const StepCard = ({ number, title, description, delay = 0 }: StepCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col items-center text-center p-6 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Number circle */}
      <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110 hover:bg-primary/30">
        <span className="text-xl font-bold text-primary">{number}</span>
      </div>
      
      <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default StepCard;
