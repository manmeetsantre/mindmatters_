import React from 'react';
import { cn } from '@/lib/utils';
import './BrainLoading.css';

interface BrainLoadingProps {
  isVisible: boolean;
  className?: string;
}

export function BrainLoading({ isVisible, className }: BrainLoadingProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center",
      "transition-all duration-500",
      isVisible ? "opacity-100" : "opacity-0",
      className
    )}>
      {/* Ripple Effect Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="ripple-container">
          <div className="ripple ripple-1"></div>
          <div className="ripple ripple-2"></div>
          <div className="ripple ripple-3"></div>
          <div className="ripple ripple-4"></div>
        </div>
      </div>

      <div className="relative w-full h-80 flex items-center justify-center">
        {/* Enhanced Brain Animation Container */}
        <div className="brain-orbit-container">
          {/* Outer Glow Ring */}
          <div className="outer-glow-ring"></div>
          
          {/* Middle Pulse Ring */}
          <div className="middle-pulse-ring"></div>
          
          {/* Color Changing Outline Loader */}
          <div className="color-changing-outline">
            <div className="outline-shape shape-1"></div>
            <div className="outline-shape shape-2"></div>
            <div className="outline-shape shape-3"></div>
            <div className="outline-shape shape-4"></div>
            <div className="outline-shape shape-5"></div>
            <div className="outline-shape shape-6"></div>
            <div className="outline-shape shape-7"></div>
            <div className="outline-shape shape-8"></div>
          </div>

          {/* Inner Brain Orbit */}
          <div className="brain-orbit">
            <img 
              src="https://tse2.mm.bing.net/th/id/OIP.ud7CT9D_mQJgTwM9qowUQgHaHa?w=740&h=740&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="Loading Brain"
              className="h-32 w-32 object-contain"
              style={{
                animation: 'brainRevolve 1.2s linear infinite, brainPulse 2s ease-in-out infinite'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'block';
              }}
            />
            <div 
              className="h-32 w-32 flex items-center justify-center text-8xl"
              style={{ display: 'none' }}
            >
              🧠
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Loading Text with Typing Effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-32">
        <div className="loading-text-container">
          <p className="text-lg font-semibold text-primary animate-pulse">
            <span className="typing-text">Loading MAITRI</span>
            <span className="typing-dots">...</span>
          </p>
        </div>
      </div>
      

    </div>
  );
}

export default BrainLoading;
