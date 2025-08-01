import { useEffect, useState } from "react";
import { API } from "@/lib/api";

interface TrainingSpinnerProps {
  uuid?: string | null;
}

export const TrainingSpinner = ({ uuid }: TrainingSpinnerProps) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState("Cooking up some AI magic...");

  useEffect(() => {
    if (!uuid) return;

    const pollStatus = async () => {
      try {
        const status = await API.getTrainingStatus(uuid);
        setProgress(status.progress);
        
        // Update status text based on progress for training
        if (status.progress < 25) {
          setStatusText("Initializing training process...");
        } else if (status.progress < 50) {
          setStatusText("Learning voice patterns...");
        } else if (status.progress < 75) {
          setStatusText("Training neural networks...");
        } else {
          setStatusText("Finalizing model...");
        }
      } catch (error) {
        console.error('Error checking training status:', error);
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
      {/* Main Audio-Themed Spinner with Sea Green Theme */}
      <div className="relative">
        {/* Vinyl Record Base */}
        <div className="w-24 h-24 bg-gray-700/60 rounded-full animate-spin flex items-center justify-center shadow-2xl">
          {/* Record Grooves */}
          <div className="w-20 h-20 border-2 border-gray-500/70 rounded-full"></div>
          <div className="absolute w-16 h-16 border border-gray-400/60 rounded-full"></div>
          <div className="absolute w-12 h-12 border border-gray-500/70 rounded-full"></div>
          {/* Center Label - Sea Green themed */}
          <div className="absolute w-8 h-8 bg-gradient-to-br from-training-primary to-training-accent rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Radiating Sound Waves - Sea Green themed */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute border-4 border-training-accent/50 rounded-full animate-ping"
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
        <h3 className="text-lg font-semibold text-training-primary animate-pulse">🌊 Training Model</h3>
        <p className="text-sm text-muted-foreground">
          {statusText}
        </p>
        {uuid && progress > 0 && (
          <div className="w-full max-w-xs mx-auto">
            <div className="text-xs text-muted-foreground mb-1">{Math.round(progress)}% complete</div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-training-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};