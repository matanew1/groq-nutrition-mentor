
import React from "react";

export const GlassCard = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`glass-card shadow-xl rounded-2xl border border-white/30 bg-white/30 dark:bg-gray-900/40 backdrop-blur-lg p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Add a CSS class for advanced glassmorphism in index.css (see below).
