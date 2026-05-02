import { MessageSquare, GitBranch, BookOpen, Brain } from "lucide-react";
import Navbar from "@/components/Navbar";
import GetStartedButton from "@/components/GetStartedButton";
import FeatureSection from "@/components/FeatureSection";
import ProblemSection from "@/components/ProblemSection";
import CommunitySection from "@/components/CommunitySection";
import HowItWorksSection from "@/components/HowItWorksSection";

import aiChatMockup from "@/assets/ai-chat-mockup.png";
import flowchartMockup from "@/assets/flowchart-mockup.png";
import flashcardsMockup from "@/assets/flashcards-mockup.png";
import quizMockup from "@/assets/quiz-mockup.png";

const features = [
  {
    number: "01",
    tagline: "Instant Doubt Solving",
    title: "AI Chat — Get Answers in Seconds",
    description:
      "ELYAITRA's AI Chat understands your questions and provides crystal-clear explanations. Whether you're stuck on calculus or confused about concepts, get instant, human-like help 24/7.",
    icon: MessageSquare,
    mockupImage: aiChatMockup,
  },
  {
    number: "02",
    tagline: "Visual Learning Paths",
    title: "Smart Flowcharts — See the Big Picture",
    description:
      "Transform complex topics into beautiful visual roadmaps. Our AI creates step-by-step flowcharts that show exactly how concepts connect, making learning intuitive and memorable.",
    icon: GitBranch,
    mockupImage: flowchartMockup,
  },
  {
    number: "03",
    tagline: "Memory Mastery",
    title: "Flashcards — Remember Everything",
    description:
      "AI-optimized flashcards that adapt to your learning patterns. Our spaced repetition system presents cards at the perfect intervals for maximum retention.",
    icon: BookOpen,
    mockupImage: flashcardsMockup,
  },
  {
    number: "04",
    tagline: "Exam Ready",
    title: "Smart Quizzes — Test Your Knowledge",
    description:
      "Adaptive quizzes that evolve based on your performance. Get instant feedback, identify weak spots, and track your progress with detailed analytics.",
    icon: Brain,
    mockupImage: quizMockup,
  },
];

const Index = () => {
  return (
    <div className="dark min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
        
        {/* Animated background glow beam */}
        <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-32 h-full bg-gradient-to-b from-primary via-primary/50 to-transparent blur-[100px] opacity-40 animate-pulse-glow" />
          <div className="absolute top-0 right-1/4 w-16 h-[80%] bg-gradient-to-b from-primary via-primary to-transparent blur-[40px] opacity-60" />
          <div className="absolute top-0 right-1/4 w-4 h-[70%] bg-primary blur-sm animate-beam" />
        </div>

        {/* Left glow */}
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-float opacity-40" style={{ animationDelay: "0s" }} />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-primary/40 rounded-full animate-float" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-primary/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/10 rounded-full animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-2/3 left-1/5 w-1.5 h-1.5 bg-primary/30 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">AI-Powered Learning Platform</span>
          </div>

          {/* Main heading with refined typography */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] mb-8 tracking-tight">
            <span className="inline-block opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <span className="text-white">Learn Smarter with</span>
            </span>
            <br />
            <span className="inline-block opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">Artificial Intelligence</span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto opacity-0 animate-fade-in leading-relaxed" style={{ animationDelay: "0.6s" }}>
            Master any subject with AI-powered tools that adapt to your learning style. 
            Build real understanding, ace your exams, and unlock your full potential.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <GetStartedButton>Start Learning Free</GetStartedButton>
            <a href="#features" className="group flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-white transition-colors duration-300">
              <span>See how it works</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1.2s" }}>
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
              <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <ProblemSection />

      {/* Features Section - Light Theme */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-white to-gray-50 dark:from-white dark:to-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Features</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Everything you need to excel</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Powerful AI tools designed to transform how you learn, study, and master any subject.</p>
          </div>
          
          {features.map((feature, index) => (
            <FeatureSection
              key={feature.number}
              number={feature.number}
              tagline={feature.tagline}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              reversed={index % 2 === 1}
              lightMode
              mockupImage={feature.mockupImage}
            />
          ))}
        </div>
      </section>


      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Community Section */}
      <CommunitySection />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/20 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">E</span>
                </div>
                <span className="text-lg font-semibold text-white">Elyaitra</span>
              </div>
              <span className="text-sm text-muted-foreground">
                © 2025 ELYAITRA. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
