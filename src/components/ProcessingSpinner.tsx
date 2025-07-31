import { Volume2 } from "lucide-react";

export const ProcessingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Main Funky Spinner */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-20 h-20 border-8 border-transparent border-t-primary border-r-accent rounded-full animate-spin"></div>
        
        {/* Middle pulsing ring */}
        <div className="absolute inset-2 w-16 h-16 border-6 border-transparent border-b-accent border-l-primary rounded-full animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }}></div>
        
        {/* Moving wiggly sound wave line */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" className="animate-pulse">
            <path
              d="M2,16 Q8,8 16,16 T30,16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-primary animate-bounce"
              style={{ animationDuration: '0.8s' }}
            />
            <path
              d="M2,16 Q8,24 16,16 T30,16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-accent animate-bounce"
              style={{ animationDuration: '1.2s', animationDelay: '0.4s' }}
            />
          </svg>
        </div>
      </div>
      
      {/* Wobbling Sound Wave Bars */}
      <div className="flex items-end space-x-1 h-12">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-t from-primary to-accent rounded-full animate-pulse"
            style={{
              width: '4px',
              height: `${20 + Math.sin(i) * 15}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${0.8 + i * 0.1}s`,
            }}
          />
        ))}
      </div>
      
      {/* Processing Text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-primary animate-pulse">Processing Audio</h3>
        <p className="text-sm text-muted-foreground">
          AI is working its magic on your voice...
        </p>
      </div>
      
      {/* Animated Progress Dots */}
      <div className="flex space-x-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-accent rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
    </div>
  );
};