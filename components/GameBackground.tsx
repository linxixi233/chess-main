
import React, { memo } from 'react';
import { motion } from 'framer-motion';

export const GameBackground = memo(() => {
  return (
    <div className="fixed inset-0 overflow-hidden z-0 bg-slate-50 font-sans pointer-events-none select-none perspective-[1200px] translate-z-0">
      
      {/* 1. Static Gradient Mesh (Optimized: No background interpolation) */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ 
          background: "radial-gradient(circle at 0% 0%, #22d3ee 0%, transparent 50%), radial-gradient(circle at 100% 100%, #f472b6 0%, transparent 50%)"
        }}
      />
      {/* 1.1 Pulse Overlay (Cheaper than animating gradients) */}
      <motion.div 
         className="absolute inset-0 opacity-0 bg-gradient-to-tr from-cyan-100/20 to-pink-100/20"
         animate={{ opacity: [0, 0.5, 0] }}
         transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 2. Fast Speed Lines / Data Stream (High Energy) - REDUCED COUNT FOR PERFORMANCE */}
      <div className="hidden md:block">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`speed-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            style={{
              width: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              rotate: -45,
              opacity: 0.4,
              willChange: 'transform' // Force GPU layer
            }}
            animate={{
              x: [-500, 500],
              y: [500, -500],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: Math.random() * 2 + 1.5, // Slower duration
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* 3. Floating "Confetti" Shapes - REDUCED COUNT */}
      <div className="hidden md:block">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`confetti-${i}`}
            className={`absolute w-3 h-3 ${i % 2 === 0 ? 'bg-cyan-400' : 'bg-pink-400'} rounded-sm`}
            style={{
              left: `${Math.random() * 100}%`,
              top: 0,
              y: '110vh',
              willChange: 'transform'
            }}
            animate={{
              y: '-10vh',
              rotate: [0, 360],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: Math.random() * 5 + 5, // Slower
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* 4. Floor Grid (Virtual Space) */}
      <div className="absolute inset-x-0 bottom-0 h-[50vh] opacity-20 origin-bottom" style={{ transform: 'rotateX(60deg) translateZ(0)', backfaceVisibility: 'hidden' }}>
         <div 
            className="w-full h-full bg-[linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)] bg-[size:40px_40px]"
            style={{ maskImage: 'linear-gradient(to top, black, transparent)' }}
         />
      </div>

      {/* 5. Warning / Boundary Strips - Static is fine */}
      <div className="absolute top-0 left-0 bottom-0 w-4 md:w-8 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#22d3ee_10px,#22d3ee_20px)] opacity-10" style={{ transform: 'translateZ(0)' }} />
      <div className="absolute top-0 right-0 bottom-0 w-4 md:w-8 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,#f472b6_10px,#f472b6_20px)] opacity-10" style={{ transform: 'translateZ(0)' }} />

      {/* 6. Active Pulse Rings - Simplified animation */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
         <motion.div 
           className="absolute inset-0 border-2 border-cyan-500/10 rounded-full border-dashed"
           style={{ willChange: 'transform' }}
           animate={{ rotate: 360 }}
           transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
         />
         <motion.div 
           className="absolute inset-10 border-2 border-pink-500/10 rounded-full border-dotted"
           style={{ willChange: 'transform' }}
           animate={{ rotate: -360 }}
           transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
         />
      </div>

      {/* 7. Vignette for focus */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-white/60 pointer-events-none" />
    </div>
  );
});
