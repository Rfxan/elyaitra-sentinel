import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import GetStartedButton from "@/components/GetStartedButton";
import aiChatMockup from "@/assets/ai-chat-mockup.png";
import flowchartMockup from "@/assets/flowchart-mockup.png";
import quizMockup from "@/assets/quiz-mockup.png";
import flashcardsMockup from "@/assets/flashcards-mockup.png";

const featuresData = [
  {
    number: "01",
    subtitle: "INTELLIGENT CONVERSATIONS",
    title: "AI Chat",
    accent: "Instant Clarity",
    description:
      "Get immediate answers to your questions with our advanced AI chat. Whether you're stuck on a complex concept or need quick clarification, ELYAITRA's AI assistant provides detailed, contextual explanations tailored to your learning level.",
    mockup: aiChatMockup,
  },
  {
    number: "02",
    subtitle: "VISUAL LEARNING",
    title: "Smart Flowcharts",
    accent: "See the Path",
    description:
      "Transform complex topics into visual learning paths. Our smart flowcharts break down subjects into digestible steps, showing you exactly how concepts connect and building your understanding systematically.",
    mockup: flowchartMockup,
  },
  {
    number: "03",
    subtitle: "MEMORY RETENTION",
    title: "Flashcards",
    accent: "Remember Everything",
    description:
      "Master any subject with AI-optimized flashcards. Our spaced repetition system learns your patterns and presents cards at the perfect intervals for maximum retention, making revision efficient and effective.",
    mockup: flashcardsMockup,
  },
  {
    number: "04",
    subtitle: "EXAM PREPARATION",
    title: "Smart Quizzes",
    accent: "Test Your Knowledge",
    description:
      "Practice with intelligent quizzes that adapt to your performance. Get instant feedback, identify weak areas, and track your progress with detailed analytics that help you focus on what matters most.",
    mockup: quizMockup,
  },
];

const Features = () => {
  return (
    <div className="dark min-h-screen bg-background">
      {/* Back link */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium uppercase tracking-wide">Features</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Powerful Tools for{" "}
            <span className="text-primary">Smarter Learning</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the AI-powered features that make ELYAITRA the ultimate learning companion
            for students and lifelong learners.
          </p>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-32">
          {featuresData.map((feature, index) => {
            const isReversed = index % 2 === 1;

            return (
              <div
                key={feature.number}
                className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 lg:gap-20 items-center`}
              >
                {/* Text Content */}
                <div className="flex-1 space-y-6">
                  <span className="text-6xl sm:text-7xl font-bold text-primary/20">
                    {feature.number}
                  </span>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary uppercase tracking-widest">
                      {feature.subtitle}
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white">
                      <span className="text-primary">{feature.accent}</span> — {feature.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Mockup Image */}
                <div className="flex-1 w-full max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-3xl" />
                    <img 
                      src={feature.mockup} 
                      alt={feature.title}
                      className="relative w-full rounded-2xl shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Experience the Future of Learning?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start your journey with ELYAITRA today and unlock your full potential.
          </p>
          <GetStartedButton />
        </div>
      </section>
    </div>
  );
};

export default Features;
