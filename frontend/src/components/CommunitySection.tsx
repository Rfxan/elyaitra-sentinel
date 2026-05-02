import { useEffect, useRef, useState } from "react";

const CommunitySection = () => {
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
    <section
      ref={sectionRef}
      className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-background via-background to-card"
    >
      {/* Animated glowing orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Left orb */}
        <div className="absolute -left-32 top-1/2 -translate-y-1/2">
          <div className="relative w-[400px] h-[400px]">
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse-glow" style={{ animationDuration: "4s" }} />
            <div className="absolute inset-8 rounded-full bg-primary/10 animate-pulse-glow" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
            <div className="absolute inset-16 rounded-full bg-primary/15 animate-pulse-glow" style={{ animationDuration: "2s", animationDelay: "1s" }} />
            <div className="absolute inset-24 rounded-full bg-primary/20 animate-pulse-glow" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
          </div>
        </div>

        {/* Right orb */}
        <div className="absolute -right-32 top-1/2 -translate-y-1/2">
          <div className="relative w-[400px] h-[400px]">
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse-glow" style={{ animationDuration: "4s", animationDelay: "1s" }} />
            <div className="absolute inset-8 rounded-full bg-primary/10 animate-pulse-glow" style={{ animationDuration: "3s", animationDelay: "1.5s" }} />
            <div className="absolute inset-16 rounded-full bg-primary/15 animate-pulse-glow" style={{ animationDuration: "2s", animationDelay: "0.8s" }} />
            <div className="absolute inset-24 rounded-full bg-primary/20 animate-pulse-glow" style={{ animationDuration: "2s", animationDelay: "1.3s" }} />
          </div>
        </div>

        {/* Subtle center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center px-5 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <span className="text-sm font-medium text-primary">
            Join Our Community
          </span>
        </div>

        {/* Heading */}
        <h2
          className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="text-white italic">Start Learning Smarter</span>
          <br />
          <span className="text-primary italic">Today</span>
        </h2>

        {/* Subtitle */}
        <p
          className={`text-muted-foreground text-lg max-w-xl mx-auto mb-12 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Join thousands of learners in our vibrant community. Get instant help,
          share knowledge, and grow together.
        </p>

        {/* WhatsApp ONLY */}
        <div
          className={`flex items-center justify-center transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <a
            href="https://wa.me/YOUR_NUMBER"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-44 h-16 rounded-full bg-[#25D366] text-white overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(37,211,102,0.6)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg
              viewBox="0 0 32 32"
              fill="currentColor"
              className="w-8 h-8 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12"
            >
              <path d="M16.003 3.2c-7.072 0-12.8 5.728-12.8 12.8 0 2.256.592 4.464 1.728 6.416L3.2 28.8l6.528-1.696a12.742 12.742 0 0 0 6.272 1.632c7.072 0 12.8-5.728 12.8-12.8s-5.728-12.736-12.8-12.736zm0 23.168c-1.984 0-3.904-.512-5.6-1.472l-.4-.224-3.872 1.024 1.024-3.776-.256-.384a10.368 10.368 0 0 1-1.6-5.6c0-5.728 4.672-10.4 10.4-10.4 5.728 0 10.4 4.672 10.4 10.4s-4.672 10.432-10.4 10.432zm5.728-7.84c-.32-.16-1.888-.928-2.176-1.024-.288-.096-.512-.16-.736.16-.224.32-.832 1.024-1.024 1.248-.192.224-.384.256-.704.096-.32-.16-1.344-.48-2.56-1.536-.96-.832-1.6-1.856-1.792-2.176-.192-.32-.032-.48.128-.64.16-.16.32-.384.48-.576.16-.192.224-.32.32-.544.096-.224.048-.416-.032-.576-.08-.16-.736-1.792-1.024-2.464-.288-.672-.576-.576-.8-.576h-.672c-.224 0-.576.096-.864.416-.288.32-1.12 1.088-1.12 2.656 0 1.568 1.152 3.072 1.312 3.296.16.224 2.272 3.456 5.504 4.864.768.32 1.376.512 1.856.656.768.224 1.472.192 2.016.128.608-.096 1.888-.768 2.144-1.504.256-.736.256-1.376.192-1.504-.064-.128-.256-.192-.576-.352z" />
            </svg>
          </a>
        </div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/40 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-primary/30 animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-white/20 animate-float" />
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full bg-primary/20 animate-float" />
      </div>
    </section>
  );
};

export default CommunitySection;
