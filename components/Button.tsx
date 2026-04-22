
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { playSfx } from '../services/sound';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'schale';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  onClick,
  onMouseEnter,
  ...props 
}) => {


  const baseStyle = "relative px-8 py-3 font-bold flex items-center justify-center gap-2 transition-all duration-300 group overflow-hidden disabled:opacity-50 disabled:grayscale cursor-pointer";
  

  const isSkewed = variant !== 'schale' && variant !== 'ghost';

  const variants = {
    primary: "bg-cyan-500 text-white shadow-[4px_4px_0px_rgba(6,182,212,0.3)] hover:shadow-[6px_6px_0px_rgba(6,182,212,0.4)] hover:bg-cyan-400 transform -skew-x-12 hover:-translate-y-1 active:translate-y-0 disabled:hover:translate-y-0",
    secondary: "bg-white text-slate-600 border-2 border-slate-200 shadow-[4px_4px_0px_rgba(203,213,225,0.5)] hover:border-cyan-300 hover:text-cyan-500 transform -skew-x-12 hover:-translate-y-1 active:translate-y-0 disabled:hover:translate-y-0",
    danger: "bg-pink-500 text-white shadow-[4px_4px_0px_rgba(236,72,153,0.3)] hover:bg-pink-400 transform -skew-x-12 hover:-translate-y-1 active:translate-y-0 disabled:hover:translate-y-0",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100/50 shadow-none hover:text-cyan-600",
    schale: "bg-white/90 backdrop-blur-md text-slate-700 border-l-4 border-cyan-400 shadow-md hover:shadow-lg hover:pl-10 hover:bg-white transition-all rounded-r-xl"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!props.disabled) {
      playSfx('click');
      if (onClick) onClick(e);
    } else {
      playSfx('cancel');
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!props.disabled) {
      playSfx('hover');
    }
    if (onMouseEnter) onMouseEnter(e);
  }

  return (
    <motion.button
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {/* Un-skew content for skewed buttons */}
      <div className={`flex items-center gap-2 ${isSkewed ? 'transform skew-x-12' : ''}`}>
        {icon && <span className="w-5 h-5">{icon}</span>}
        {children}
      </div>
      
      {/* Shine effect */}
      {!props.disabled && variant !== 'ghost' && (
        <div className={`absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent ${isSkewed ? 'skew-x-12' : ''}`} />
      )}
    </motion.button>
  );
};
