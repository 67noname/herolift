'use client';

import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingButtonProps {
  onClick: () => void;
}

export function FloatingButton({ onClick }: FloatingButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-32 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/50 flex items-center justify-center hover:shadow-xl transition-shadow"
    >
      <Plus size={32} />
    </motion.button>
  );
}
