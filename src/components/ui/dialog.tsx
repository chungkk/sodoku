"use client";

import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const DialogTitleIdContext = createContext<string | undefined>(undefined);

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Dialog({ open, onClose, children }: DialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusFirst = () => {
      const root = dialogRef.current;
      if (!root) return;
      if (root.contains(document.activeElement)) return;
      const first = root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? root).focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first || !root.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last || !root.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <DialogTitleIdContext.Provider value={titleId}>
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
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              initial={{ opacity: 0, y: 60, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="tray relative max-h-[90dvh] w-full max-w-md overflow-auto focus:outline-none"
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DialogTitleIdContext.Provider>
  );
}

function DialogHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pt-5 ${className}`}>{children}</div>;
}

function DialogTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  const titleId = useContext(DialogTitleIdContext);
  return <h2 id={titleId} className={`font-display text-2xl leading-tight text-ink ${className}`}>{children}</h2>;
}

function DialogContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-3 text-ink ${className}`}>{children}</div>;
}

function DialogFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex justify-end gap-2 px-5 pb-5 pt-1 ${className}`}>{children}</div>;
}

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter };
