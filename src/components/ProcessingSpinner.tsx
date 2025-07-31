export const ProcessingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Main Audio-Themed Spinner */}
      <div className="relative">
        {/* Vinyl Record Base */}
        <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full animate-spin flex items-center justify-center shadow-2xl">
          {/* Record Grooves */}
          <div className="w-20 h-20 border-2 border-gray-600 rounded-full"></div>
          <div className="absolute w-16 h-16 border border-gray-500 rounded-full"></div>
          <div className="absolute w-12 h-12 border border-gray-600 rounded-full"></div>
          {/* Center Label */}
          <div className="absolute w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Spinning Needle/Tonearm */}
        <div className="absolute top-2 right-2 w-6 h-1 bg-gradient-to-r from-accent to-primary rounded-full animate-pulse origin-left transform rotate-45"></div>
        
        {/* Radiating Sound Waves */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute border-2 border-accent/30 rounded-full animate-ping"
              style={{
                width: `${32 + i * 16}px`,
                height: `${32 + i * 16}px`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s',
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Dancing Equalizer Bars */}
      <div className="flex items-end space-x-2 h-16">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-t from-primary via-accent to-primary rounded-t-full animate-bounce"
            style={{
              width: '6px',
              height: `${10 + Math.sin(i * 0.5) * 20 + 15}px`,
              animationDelay: `${i * 0.08}s`,
              animationDuration: `${0.4 + (i % 3) * 0.1}s`,
              transform: `scaleY(${0.3 + Math.sin(i * 0.8) * 0.7})`,
            }}
          />
        ))}
      </div>
      
      {/* Audio Waveform */}
      <div className="w-48 h-8 relative overflow-hidden rounded-lg bg-muted/20">
        <svg width="192" height="32" viewBox="0 0 192 32" className="absolute">
          {[...Array(24)].map((_, i) => (
            <rect
              key={i}
              x={i * 8}
              y={16 - Math.sin(i * 0.5) * 12}
              width="6"
              height={Math.abs(Math.sin(i * 0.5) * 24) + 4}
              fill="currentColor"
              className="text-primary animate-pulse"
              style={{
                animationDelay: `${i * 0.05}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </svg>
        
        {/* Moving Progress Line */}
        <div 
          className="absolute top-0 w-0.5 h-full bg-accent animate-pulse"
          style={{
            left: '25%',
            animationDuration: '0.8s',
          }}
        />
      </div>
      
      {/* Processing Text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-primary animate-pulse">🎵 Processing Audio</h3>
        <p className="text-sm text-muted-foreground">
          Spinning up some AI magic...
        </p>
      </div>
      
      {/* Floating Musical Notes */}
      <div className="flex space-x-8 text-2xl">
        {['♪', '♫', '♪', '♫'].map((note, i) => (
          <span
            key={i}
            className="text-accent animate-bounce"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s',
            }}
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );
};