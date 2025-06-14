
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";

/**
 * FancyButton: UI microinteractions + glass effect + animated gradient
 */
export const FancyButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", children, ...props }, ref) => (
    <Button
      ref={ref}
      {...props}
      className={`
        fancy-btn
        px-6 py-2
        text-base font-bold
        rounded-full
        border border-white/30
        bg-gradient-to-br from-green-300 via-blue-200 to-purple-300
        dark:from-green-700 dark:via-blue-900 dark:to-purple-900
        text-black dark:text-white
        shadow-xl
        ring-2 ring-primary/0
        focus-visible:ring-4 focus-visible:ring-primary/40
        transition-all duration-200
        hover:scale-105 hover:shadow-glass hover:brightness-110 active:scale-98 active:shadow-innerGlass
        group
        ${className}
      `}
      style={{
        backdropFilter: "blur(12px) saturate(120%)",
        WebkitBackdropFilter: "blur(12px) saturate(120%)",
      }}
    >
      <span className="transition-all group-hover:tracking-wide">{children}</span>
      {/* Light animated reflection */}
      <span className="absolute left-2 top-1 w-2/3 h-2 rounded-full bg-white/20 blur-md opacity-60 animate-glassReflect pointer-events-none" />
    </Button>
  )
);
FancyButton.displayName = "FancyButton";
