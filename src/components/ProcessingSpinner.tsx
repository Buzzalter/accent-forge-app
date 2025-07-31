import { useEffect, useState } from "react";
import { checkStatus } from "@/lib/api";

interface ProcessingSpinnerProps {
  uuid?: string | null;
}

export const ProcessingSpinner = ({ uuid }: ProcessingSpinnerProps) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState("Spinning up some AI magic...");

  useEffect(() => {
    if (!uuid) return;

    const pollStatus = async () => {
      try {
        const status = await checkStatus(uuid);
        setProgress(status.progress);
        
        // Update status text based on progress
        if (status.progress < 25) {
          setStatusText("Initializing audio processing...");
        } else if (status.progress < 50) {
          setStatusText("Analyzing audio patterns...");
        } else if (status.progress < 75) {
          setStatusText("Applying transformations...");
        } else {
          setStatusText("Finalizing output...");
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    // Poll status every 2 seconds
    const interval = setInterval(pollStatus, 2000);
    
    // Initial check
    pollStatus();

    return () => clearInterval(interval);
  }, [uuid]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Main Audio-Themed Spinner */}
      <div className="relative">
        {/* Vinyl Record Base */}
        <div className="w-24 h-24 bg-gray-700/60 rounded-full animate-spin flex items-center justify-center shadow-2xl">
          {/* Record Grooves */}
          <div className="w-20 h-20 border-2 border-gray-500/70 rounded-full"></div>
          <div className="absolute w-16 h-16 border border-gray-400/60 rounded-full"></div>
          <div className="absolute w-12 h-12 border border-gray-500/70 rounded-full"></div>
          {/* Center Label */}
          <div className="absolute w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Radiating Sound Waves - More Pronounced */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute border-4 border-accent/50 rounded-full animate-ping"
              style={{
                width: `${40 + i * 20}px`,
                height: `${40 + i * 20}px`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Processing Text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-primary animate-pulse">🎵 Processing Audio</h3>
        <p className="text-sm text-muted-foreground">
          {statusText}
        </p>
        {uuid && progress > 0 && (
          <div className="w-full max-w-xs mx-auto">
            <div className="text-xs text-muted-foreground mb-1">{Math.round(progress)}% complete</div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};