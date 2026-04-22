
import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Hexagon, Zap } from 'lucide-react';

export type TransitionType = 'heavy' | 'light';

interface Props {
  isVisible: boolean;
  type?: TransitionType;
}

// --- HEAVY ANIMATION VARIANTS (Sliding Panels) ---
const slideVariants: Variants = {
  initial: { x: '100%' },
  animate: { x: '0%' },
  exit: { x: '-100%' }
};

const textVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// --- LIGHT ANIMATION VARIANTS (Fast Shutters) ---
const shutterContainerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

const shutterVariants: Variants = {
  initial: { scaleY: 0, transformOrigin: "top" },
  animate: { scaleY: 1, transition: { duration: 0.3, ease: "circOut" } },
  exit: { scaleY: 0, transformOrigin: "bottom", transition: { duration: 0.3, ease: "circIn" } }
};

export const TransitionOverlay: React.FC<Props> = ({ isVisible, type = 'heavy' }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <div className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center">
          
          {/* ================= HEAVY TRANSITION (Battle Start / Main Entry) ================= */}
          {type === 'heavy' && (
            <motion.div className="absolute inset-0 w-full h-full" initial="initial" animate="animate" exit="exit">
               {/* Layer 1: Background Base (White) */}
              <motion.div 
                 className="absolute inset-0 bg-white"
                 variants={{
                    initial: { opacity: 0 },
                    animate: { opacity: 1, transition: { duration: 0.1 } },
                    exit: { opacity: 0, transition: { delay: 0.4, duration: 0.2 } }
                 }}
              />

              {/* Layer 2: Deep Blue Panel */}
              <motion.div
                className="absolute inset-0 bg-blue-600 transform skew-x-[-10deg] scale-x-150"
                variants={slideVariants}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} 
              />

              {/* Layer 3: Bright Cyan Panel */}
              <motion.div
                className="absolute inset-0 bg-cyan-400 transform skew-x-[-10deg] scale-x-150"
                variants={slideVariants}
                transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Layer 4: Final Cover Panel (Fresh White) */}
              <motion.div
                className="absolute inset-0 bg-slate-50 transform skew-x-[-10deg] scale-x-150"
                variants={slideVariants}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Content Layer: Logo & Text */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center z-10 flex-col gap-6"
                variants={textVariants}
                transition={{ delay: 0.3, duration: 0.2 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-[-12px] border-2 border-dashed border-cyan-500/50 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Hexagon className="text-cyan-500 w-16 h-16 fill-cyan-50" strokeWidth={1.5} />
                  </motion.div>
                  <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>

                <div className="flex flex-col items-center">
                   <span className="text-slate-800 font-black italic tracking-tighter text-3xl">SCHALE</span>
                   <div className="flex items-center gap-3 mt-1">
                      <span className="h-px w-8 bg-cyan-500/50" />
                      <span className="text-cyan-600 font-mono text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
                        Connecting
                      </span>
                      <span className="h-px w-8 bg-cyan-500/50" />
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ================= LIGHT TRANSITION (Menu Navigation) ================= */}
          {type === 'light' && (
            <motion.div 
              className="absolute inset-0 w-full h-full flex flex-col"
              variants={shutterContainerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
               {/* 4 Vertical Strips acting as shutters */}
               {[...Array(4)].map((_, i) => (
                 <motion.div 
                   key={i} 
                   className="flex-1 w-full bg-slate-50 relative border-b border-cyan-100/50"
                   variants={shutterVariants}
                 >
                    {/* Add a subtle cyan flash on the edge */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400/20" />
                    {i === 1 && (
                      <div className="absolute right-10 bottom-2 flex items-center gap-2 opacity-50">
                        <div className="h-1 w-12 bg-cyan-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-cyan-600">PROCESSING</span>
                      </div>
                    )}
                 </motion.div>
               ))}
               
               {/* Simple Center Icon that appears briefly */}
               <motion.div 
                 className="absolute inset-0 flex items-center justify-center pointer-events-none"
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
                 exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.2 } }}
               >
                  <div className="bg-white p-3 rounded-xl shadow-xl border border-cyan-100 flex items-center gap-2">
                     <Zap size={20} className="text-cyan-500 fill-cyan-500" />
                     <span className="font-bold text-slate-600 text-sm tracking-widest">LOADING...</span>
                  </div>
               </motion.div>
            </motion.div>
          )}

        </div>
      )}
    </AnimatePresence>
  );
};
