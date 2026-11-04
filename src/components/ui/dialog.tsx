"use client";

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

function Dialog({ open, onClose, children }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-ink/65"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="tray relative max-h-[90dvh] w-full max-w-md overflow-auto"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DialogHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pt-5 ${className}`}>{children}</div>;
}

function DialogTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display text-2xl leading-tight text-ink ${className}`}>{children}</h2>;
}

function DialogContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-3 text-ink ${className}`}>{children}</div>;
}

function DialogFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex justify-end gap-2 px-5 pb-5 pt-1 ${className}`}>{children}</div>;
}

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter };
