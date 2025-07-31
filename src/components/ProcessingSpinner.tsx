import { Volume2 } from "lucide-react";

export const ProcessingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Main Funky Spinner */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-20 h-20 border-4 border-transparent border-t-primary border-r-accent rounded-full animate-spin"></div>
        
        {/* Middle pulsing ring */}
        <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-accent border-l-primary rounded-full animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }}></div>
        
        {/* Inner bouncing element */}
        <div className="absolute inset-6 w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-full animate-bounce"></div>
        
        {/* Center audio icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Volume2 className="h-6 w-6 text-primary animate-pulse" />
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