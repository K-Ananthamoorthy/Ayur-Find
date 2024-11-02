// src/components/LoadingSpinner.tsx
"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex space-x-2"
      >
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
            animate={{
              y: [-5, 5, -5],
              backgroundColor: [
                "#3b82f6",
                "#a855f7",
                "#ec4899",
                "#3b82f6",
              ],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
