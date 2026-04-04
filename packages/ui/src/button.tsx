"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { colors } from "./tokens";

type ButtonVariant = "ghost" | "outline" | "solid";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const BASE = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-default";

export function Button({ children, variant = "ghost", className = "", style, ...props }: ButtonProps) {
  const variantStyle =
    variant === "solid"
      ? { background: colors.accent.primary, color: "#000", border: "1px solid transparent" }
      : variant === "outline"
      ? { background: colors.bg.card, color: colors.text.secondary, border: `1px solid ${colors.border.card}` }
      : { background: "transparent", color: colors.text.secondary, border: "1px solid transparent" };

  return (
    <button
      className={`${BASE} ${className}`}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
