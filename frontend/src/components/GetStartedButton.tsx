import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GetStartedButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const GetStartedButton = ({
  className,
  children = "Get Started",
}: GetStartedButtonProps) => {
  return (
    <Link
      to="/signup"
      className={cn(
        "group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg transition-all duration-300 glow-primary hover:glow-primary-hover hover:brightness-110 active:scale-[0.98]",
        className
      )}
    >
      <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
      {children}
    </Link>
  );
};

export default GetStartedButton;
