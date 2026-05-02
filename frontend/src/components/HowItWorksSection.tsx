import { useEffect, useRef, useState } from "react";
import { UserPlus, Target, Rocket, TrendingUp } from "lucide-react";

const steps = [
  { 
    number: "01", 
    title: "Sign Up", 
    description: "Create your free account in seconds",
    icon: UserPlus,
    gradient: "from-blue-500 to-cyan-400"
  },
  { 
    number: "02", 
    title: "Choose Path", 
    description: "Pick your subjects & learning goals",
    icon: Target,
    gradient: "from-purple-500 to-pink-400"
  },
  { 
    number: "03", 
    title: "Learn & Practice", 
    description: "Use AI tools to master any topic",
    icon: Rocket,
    gradient: "from-orange-500 to-yellow-400"
  },
  { 
    number: "04", 
    title: "Track Progress", 
    description: "Watch your improvement soar",
    icon: TrendingUp,
    gradient: "from-green-500 to-emerald-400"
  },
];

const HowItWorksSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
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
      className="relative py-32 px-6 overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        
        {/* Floating grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <div
            className={`inline-flex items-center px-5 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <span className="text-sm font-medium text-primary">Simple Process</span>
          </div>
          
          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-white">From Confused to </span>
            <span className="text-primary relative">
              Confident
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path 
                  d="M2 10C50 2 150 2 198 10" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="text-primary/50"
                />
              </svg>
            </span>
          </h2>
          
          <p
            className={`text-muted-foreground text-lg max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Your journey with ELYAITRA in 4 simple steps
          </p>
        </div>

        {/* Steps container */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-1">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent rounded-full" />
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary rounded-full transition-all duration-1000 ease-out ${
                  isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                }`}
                style={{ 
                  transformOrigin: 'left',
                  transitionDelay: '0.5s'
                }}
              />
              {/* Animated pulse along the line */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full blur-sm ${
                  isVisible ? "animate-[slideRight_3s_ease-in-out_infinite]" : "opacity-0"
                }`}
                style={{ animationDelay: '1s' }}
              />
            </div>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`relative transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${300 + index * 150}ms` }}
                  onMouseEnter={() => setActiveStep(index)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  <div className={`relative flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-500 ${
                    activeStep === index 
                      ? "bg-card/80 shadow-2xl shadow-primary/20 scale-105" 
                      : "bg-transparent hover:bg-card/40"
                  }`}>
                    {/* Number badge with icon */}
                    <div className="relative mb-6">
                      {/* Outer ring animation */}
                      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        activeStep === index 
                          ? `bg-gradient-to-r ${step.gradient} opacity-20 scale-150 blur-xl`
                          : "opacity-0 scale-100"
                      }`} />
                      
                      {/* Pulsing rings */}
                      <div className={`absolute inset-0 rounded-full border-2 border-primary/30 transition-all duration-500 ${
                        activeStep === index ? "scale-150 opacity-0" : "scale-100 opacity-100"
                      }`} style={{ animation: activeStep === index ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none' }} />
                      
                      {/* Main circle */}
                      <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                        activeStep === index 
                          ? `bg-gradient-to-br ${step.gradient}` 
                          : "bg-primary/20 border-2 border-primary/30"
                      }`}>
                        <Icon className={`w-8 h-8 transition-all duration-300 ${
                          activeStep === index ? "text-white scale-110" : "text-primary"
                        }`} />
                      </div>
                      
                      {/* Step number badge */}
                      <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        activeStep === index 
                          ? "bg-white text-gray-900 shadow-lg"
                          : "bg-primary/30 text-primary"
                      }`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <h4 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                      activeStep === index ? "text-primary" : "text-white"
                    }`}>
                      {step.title}
                    </h4>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>

                    {/* Arrow indicator for mobile */}
                    {index < steps.length - 1 && (
                      <div className="lg:hidden mt-6 text-primary/50">
                        <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA at bottom */}
        <div
          className={`text-center mt-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: '900ms' }}
        >
          <a
            href="/signup"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(var(--primary)/0.4)]"
          >
            Get Started Free
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-1/4 left-[10%] w-2 h-2 rounded-full bg-primary/40 animate-float" />
      <div className="absolute top-1/3 right-[15%] w-1.5 h-1.5 rounded-full bg-primary/30 animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/4 left-[20%] w-1 h-1 rounded-full bg-white/20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/3 right-[10%] w-2 h-2 rounded-full bg-primary/20 animate-float" style={{ animationDelay: '1.5s' }} />

      <style>{`
        @keyframes slideRight {
          0%, 100% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorksSection;
