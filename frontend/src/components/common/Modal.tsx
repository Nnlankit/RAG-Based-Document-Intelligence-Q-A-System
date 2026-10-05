import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[90vh]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#30261E]/45 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={clsx(
              'relative w-full bg-[#F7F0E3] dark:bg-[#2B231D] rounded-2xl shadow-[0_20px_60px_rgba(90,70,52,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-[#D4C3A5] dark:border-[#554638] overflow-hidden z-10 flex flex-col',
              sizes[size]
            )}
          >
            {(title || description) && (
              <div className="px-6 py-4 border-b border-[#D4C3A5]/60 dark:border-[#554638]/70 flex items-start justify-between">
                <div>
                  {title && (
                    <h3 className="text-lg font-semibold text-[#5A4634] dark:text-[#E5D5BA]">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-sm text-[#5A4634] dark:text-[#DCC9AA] mt-0.5 font-medium">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F4EBDD] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="p-6 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
