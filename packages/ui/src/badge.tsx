"use client";

import { type ReactNode } from "react";
import { colors } from "./tokens";

type BadgeVariant = "default" | "accent" | "success" | "error";

const VARIANT_STYLES: Record<BadgeVariant, { background: string; color: string; border: string }> = {
  default: {
    background: colors.bg.card,
    color:      colors.text.secondary,
    border:     colors.border.card,
  },
  accent: {
    background: colors.accent.soft,
    color:      colors.accent.hover,
    border:     `${colors.accent.primary}44`,
  },
  success: {
    background: colors.semantic.successBg,
    color:      colors.semantic.success,
    border:     colors.semantic.successBorder,
  },
  error: {
    background: colors.semantic.errorBg,
    color:      colors.semantic.error,
    border:     colors.semantic.errorBorder,
  },
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${className}`}
      style={{ background: s.background, color: s.color, borderColor: s.border }}
    >
      {children}
    </span>
  );
}
