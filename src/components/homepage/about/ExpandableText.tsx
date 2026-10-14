"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExpandableTextProps {
  children: React.ReactNode;
}

export const ExpandableText = ({ children }: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative flex flex-col items-start w-full">
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : "3.2rem" }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="overflow-hidden relative w-full"
      >
        <div className="w-full space-y-3 pb-2">{children}</div>

        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[rgb(14,19,29)] to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors inline-flex items-center gap-1.5 ml-auto cursor-none"
      >
        {isExpanded ? "Show less" : "Read more"}
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>
    </div>
  );
};