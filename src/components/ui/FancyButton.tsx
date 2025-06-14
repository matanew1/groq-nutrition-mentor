
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";

export const FancyButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", children, ...props }, ref) => (
    <Button
      ref={ref}
      {...props}
      className={`fancy-btn px-5 py-2 text-base shadow-lg font-semibold transition-all duration-200 
        bg-gradient-to-br from-green-400 via-blue-300 to-purple-400 dark:from-green-800 dark:via-blue-900 dark:to-purple-900
        text-white hover:scale-105 hover:brightness-110 hover:shadow-2xl ring-2 ring-primary/0 focus-visible:ring-4 focus-visible:ring-primary/30
        ${className}`}
    >
      {children}
    </Button>
  )
);

FancyButton.displayName = "FancyButton";
