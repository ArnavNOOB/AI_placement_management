import React from "react";
import { cn } from "@/lib/utils";

/**
 * Premium dark mode glassmorphism card component.
 * Features a semi-transparent dark background, blur filter, and subtle border accent.
 * 
 * @param {Object} params React properties containing className and children elements
 * @returns {React.ReactElement} Div element structured as a glass card
 * @author Arnav Garg
 * @version 1.0.0
 */
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl transition-all duration-300 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-cyan-950/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
