"use client";

import { motion } from "framer-motion";
import { Delete, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NumpadProps {
  onInput: (value: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  className?: string;
}

const keys = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "backspace"],
];

export function Numpad({ onInput, onBackspace, onClear, className }: NumpadProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-3 gap-2">
        {keys.flat().map((key) => {
          if (key === "backspace") {
            return (
              <motion.button
                key="backspace"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackspace}
                className="h-14 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-150 flex items-center justify-center"
              >
                <Delete className="h-5 w-5" />
              </motion.button>
            );
          }

          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onInput(key)}
              className={cn(
                "h-14 rounded-xl border text-lg font-semibold transition-all duration-150 flex items-center justify-center",
                key === "."
                  ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  : "border-white/10 bg-white/[0.04] text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              {key}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={onClear}
        className="mt-2 h-10 w-full rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-150 flex items-center justify-center gap-2 text-sm font-medium"
      >
        <X className="h-4 w-4" />
        Clear
      </motion.button>
    </div>
  );
}
