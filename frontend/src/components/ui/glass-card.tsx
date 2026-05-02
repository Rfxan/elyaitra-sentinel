import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "dark" | "cyan";
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  variant = "default", 
  ...props 
}) => {
  return (
    <div
      className={cn(
        "glass-card animate-scale-in overflow-hidden",
        variant === "cyan" && "border-primary/20 bg-primary/5",
        variant === "dark" && "bg-black/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
