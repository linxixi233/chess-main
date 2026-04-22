
import React, { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Wifi, Database, Activity } from 'lucide-react';

// Isolated Clock Component to prevent re-rendering the whole background
const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-6 right-8 z-10 text-right hidden md:block">
       <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-md px-5 py-2 rounded-full border border-white shadow-sm group hover:bg-white/90 transition-all">
          <span className="font-mono font-bold text-xl text-slate-600 tracking-widest group-hover:text-cyan-600 transition-colors">
            {time.toLocaleTimeString([], {hour12: false})}
          </span>
          <div className="w-px h-5 bg-slate-300" />
          <div className="flex gap-2 text-slate-400">
            <Wifi size={16} />
            <Database size={16} />
          </div>
       </div>
    </div>
  );
};

export const GeometricBackground = memo(() => {
  return (
    <div className="fixed inset-0 overflow-hidden z-0 bg-sky-50 font-sans pointer-events-none select-none translate-z-0">
      
      {/* 1. Sky Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white" />

      {/* 2. The "Sanctum Tower" Light Beam */}
      <div className="absolute left-[15%] bottom-0 w-[8vw] h-[140vh] -skew-x-12 origin-bottom z-0 opacity-80">
         <div className="absolute inset-0 bg-gradient-to-t from-white via-cyan-100/30 to-transparent blur-xl" />
         <div className="absolute inset-x-[30%] bottom-0 top-0 bg-gradient-to-t from-white via-white/40 to-transparent blur-md" />
         {/* Particles in beam - Reduced movement complexity */}
         <motion.div 
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(white 2px, transparent 2px)', backgroundSize: '40px 40px' }}
         />
      </div>

      {/* 3. Clouds - Simplified */}
      <div className="absolute inset-0 z-0">
         {/* Large bottom cloud layer */}
         <div 
            className="absolute -bottom-[20%] left-0 right-0 h-[50vh] bg-white blur-[80px] opacity-90 rounded-[100%]" 
         />
         
         {/* Floating clouds - Reduced count */}
         {[...Array(3)].map((_, i) => (
           <motion.div
             key={i}
             className="absolute bg-white/40 blur-[40px] rounded-full"
             style={{
               width: `${Math.random() * 30 + 30}vw`,
               height: `${Math.random() * 15 + 10}vh`,
               top: `${Math.random() * 50}%`,
               left: `${Math.random() * 100}%`,
               willChange: 'transform'
             }}
             animate={{ x: [0, 30, 0] }}
             transition={{ duration: 60 + Math.random() * 40, repeat: Infinity, ease: "easeInOut" }}
           />
         ))}
      </div>

      {/* 4. Large Rotating Particle Halo (Dual Layer: White & Yellow) */}
      <div className="absolute top-[-25%] right-[-15%] w-[140vh] h-[140vh] z-0 pointer-events-none">
          
          {/* Layer A: White Outer Ring (Clockwise) */}
          <motion.div 
            className="absolute inset-0 z-10 opacity-70"
            style={{ willChange: 'transform' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          >
             {/* Main Dashed Ring */}
             <div className="absolute inset-0 border-[2px] border-dashed border-white rounded-full opacity-50" />
             
             {/* Satellite Particles - Reduced Count */}
             {[...Array(4)].map((_, i) => (
                <div 
                  key={`pA-${i}`}
                  className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full blur-[1px] shadow-sm"
                  style={{ 
                     marginLeft: '-6px', marginTop: '-6px',
                     transformOrigin: `50% 70vh`, // Radius = 70vh (half of 140vh)
                     transform: `rotate(${i * 90}deg)`
                  }} 
                />
             ))}
          </motion.div>

          {/* Layer B: Yellow Middle Ring (Counter-Clockwise) */}
          <motion.div 
            className="absolute inset-[12%] z-20 opacity-90"
            style={{ willChange: 'transform' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          >
             {/* Solid Yellow Ring */}
             <div className="absolute inset-0 border-[1px] border-yellow-300/60 rounded-full" />
             
             {/* Tech Segments */}
             <div className="absolute inset-0 border-[8px] border-yellow-300/30 rounded-full border-t-transparent border-b-transparent rotate-12" />
             
             {/* Yellow Particles - Reduced Count */}
             {[...Array(2)].map((_, i) => (
                <div 
                  key={`pB-${i}`}
                  className="absolute top-0 left-1/2 w-3 h-3 bg-yellow-400 rounded-full blur-[1px] shadow-sm"
                  style={{ 
                     marginLeft: '-6px', marginTop: '-6px',
                     transformOrigin: `50% 53.2vh`,
                     transform: `rotate(${i * 180}deg)`
                  }} 
                />
             ))}
          </motion.div>

          {/* Layer C: Inner Core (Static/Slow) */}
          <div className="absolute inset-[25%] opacity-40 z-0">
             <div className="absolute inset-0 border-[30px] border-cyan-100/20 rounded-full border-l-transparent border-r-transparent" />
          </div>
          
      </div>

      {/* 5. Hexagon Array Left - Static Rotation */}
      <motion.div 
         className="absolute top-[40%] -left-[10%] opacity-20"
         style={{ willChange: 'transform' }}
         animate={{ rotate: -360 }}
         transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
       >
          <div className="relative w-[50vh] h-[50vh] border border-cyan-200 rounded-full flex items-center justify-center">
             <Hexagon size={250} strokeWidth={0.5} className="text-cyan-600" />
          </div>
       </motion.div>

      {/* 6. HUD Overlay Elements */}
      <div className="absolute top-6 left-8 z-10 flex items-center gap-4">
        <div className="bg-white/80 p-2 rounded-lg shadow-sm backdrop-blur-sm">
           <Hexagon className="text-cyan-500 fill-cyan-50" strokeWidth={2} size={32} />
        </div>
        <div>
           <h1 className="font-black text-slate-700 text-2xl italic tracking-tighter leading-none">SCHALE</h1>
           <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
             <span className="text-[10px] text-slate-500 font-bold tracking-widest">FEDERAL INVESTIGATION CLUB</span>
           </div>
        </div>
      </div>

      {/* Clock extracted to prevent re-renders */}
      <Clock />

      {/* Bottom Right Decoration */}
      <div className="absolute bottom-8 right-8 z-10 hidden md:block">
         <div className="flex flex-col items-end gap-1">
             <div className="flex gap-1">
                <div className="w-16 h-2 bg-cyan-400/80 skew-x-12" />
                <div className="w-4 h-2 bg-slate-300/80 skew-x-12" />
             </div>
             <div className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">System Stable</div>
         </div>
      </div>

      {/* Bottom Ticker - Clean Style */}
      <div className="hidden md:flex absolute bottom-0 left-0 right-0 h-10 bg-white/40 backdrop-blur-md border-t border-white/60 items-center z-10">
         <div className="w-20 h-full bg-cyan-500 flex items-center justify-center shrink-0">
            <Activity className="text-white w-5 h-5" />
         </div>
         <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap flex gap-16 text-xs font-bold text-slate-600 uppercase tracking-widest px-4">
              <span>Welcome to Kivotos</span>
              <span className="text-cyan-600">★ Connect to Schale</span>
              <span>Tactical Challenge Ready</span>
              <span className="text-pink-500">♥ Aris waiting for command</span>
              <span>System Integrity: 100%</span>
            </div>
         </div>
      </div>
    </div>
  );
});
