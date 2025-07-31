export const ProcessingSpinner = () => {
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
          Spinning up some AI magic...
        </p>
      </div>
    </div>
  );
};