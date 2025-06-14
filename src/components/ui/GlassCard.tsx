
import React from "react";

/**
 * Advanced GlassCard: Ultra glassmorphism with layered effect, animated shadow, and touch feedback
 */
export const GlassCard = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`
      glass-card
      rounded-3xl
      border border-white/30
      bg-white/30 dark:bg-gray-900/50
      backdrop-blur-2xl
      p-8
      shadow-xl
      relative
      overflow-hidden
      transition-all
      duration-300
      hover:shadow-2xl hover:scale-105
      before:absolute before:inset-0
      before:-z-10
      before:bg-gradient-to-br before:from-cyan-200/60 before:to-purple-100/20 dark:before:from-cyan-900/30 dark:before:to-purple-900/30
      before:opacity-60
      ${className}
    `}
    {...props}
  >
    {/* Animated floating blobs for extra glass effect */}
    <span className="absolute -top-2 -left-2 w-32 h-32 bg-cyan-200/20 dark:bg-cyan-800/30 rounded-full blur-2xl animate-floatBlob pointer-events-none" />
    <span className="absolute -bottom-8 -right-8 w-40 h-32 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-2xl animate-floatBlobReverse pointer-events-none" />
    {children}
  </div>
);
