"use client";

import { Fragment, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

function Dialog({ open, onClose, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#0d1117] border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.3)] max-w-md w-full max-h-[90vh] overflow-auto pointer-events-auto"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner accents */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[15px] border-l-transparent border-t-[15px] border-t-cyan-400" />
              <div className="absolute bottom-0 left-0 w-0 h-0 border-r-[15px] border-r-transparent border-b-[15px] border-b-cyan-400" />
              {children}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}

interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

function DialogHeader({ children, className = "" }: DialogHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-cyan-400/30 bg-gradient-to-r from-cyan-900/20 to-transparent ${className}`}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

function DialogTitle({ children, className = "" }: DialogTitleProps) {
  return (
    <h2
      className={`text-xl font-black text-white uppercase tracking-wider ${className}`}
      style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.6)' }}
    >
      {children}
    </h2>
  );
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

function DialogContent({ children, className = "" }: DialogContentProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

function DialogFooter({ children, className = "" }: DialogFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-cyan-400/30 flex justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter };
