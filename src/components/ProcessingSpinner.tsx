import { Loader2, Waves, Zap } from "lucide-react";

export const ProcessingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* Main Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary"></div>
        <div className="absolute inset-2 w-12 h-12 border-4 border-muted rounded-full animate-spin animate-reverse border-t-accent"></div>
        <div className="absolute inset-4 w-8 h-8 border-4 border-muted rounded-full animate-spin border-t-primary"></div>
      </div>
      
      {/* Animated Icons */}
      <div className="flex space-x-4">
        <Waves className="h-6 w-6 text-primary animate-pulse" />
        <Zap className="h-6 w-6 text-accent animate-bounce" />
        <Waves className="h-6 w-6 text-primary animate-pulse animation-delay-150" />
      </div>
      
      {/* Processing Text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-primary">Processing Audio</h3>
        <p className="text-sm text-muted-foreground">
          Generating your voice with AI magic...
        </p>
      </div>
      
      {/* Progress Dots */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-200"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-400"></div>
      </div>
    </div>
  );
};