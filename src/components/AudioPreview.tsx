import { useRef, useEffect, useState } from "react";
import { Play, Pause, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioFile } from "@/pages/AudioProcessor";
import { cn } from "@/lib/utils";

interface AudioPreviewProps {
  audioFile: AudioFile;
  onRemove?: () => void;
  showRemove?: boolean;
}

export const AudioPreview = ({ audioFile, onRemove, showRemove = true }: AudioPreviewProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioFile]);

  useEffect(() => {
    const setupAudioContext = async () => {
      if (!audioRef.current) return;

      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = ctx.createMediaElementSource(audioRef.current);
        const analyserNode = ctx.createAnalyser();
        
        analyserNode.fftSize = 256;
        source.connect(analyserNode);
        analyserNode.connect(ctx.destination);
        
        setAudioContext(ctx);
        setAnalyser(analyserNode);
      } catch (error) {
        console.error('Error setting up audio context:', error);
      }
    };

    setupAudioContext();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioFile]);

  useEffect(() => {
    if (isPlaying && analyser && canvasRef.current) {
      drawVisualizer();
    } else if (!isPlaying && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [isPlaying, analyser]);

  const drawVisualizer = () => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Simplified bar visualization
      const barCount = 32; // Reduced from full buffer length
      const barWidth = canvas.width / barCount;
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const barHeight = (dataArray[dataIndex] / 255) * canvas.height;
        
        // Simple gradient from primary to accent
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'hsl(200, 95%, 55%)');
        gradient.addColorStop(1, 'hsl(195, 100%, 65%)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
      }
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };
    
    draw();
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioContext?.state === 'suspended') {
      await audioContext.resume();
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioFile.url;
    a.download = audioFile.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4">
      <audio ref={audioRef} src={audioFile.url} />
      
      <div className="flex items-center gap-3 mb-4">
        <Button
          size="sm"
          variant="outline"
          onClick={togglePlayPause}
          className="p-2 border-primary/30 hover:bg-primary/10 hover:border-primary"
        >
          {isPlaying ? <Pause className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary" />}
        </Button>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">{audioFile.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>
        
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="p-2 hover:bg-primary/10"
          >
            <Download className="h-4 w-4 text-primary" />
          </Button>
          
          {showRemove && onRemove && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="p-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Simplified Audio Visualizer */}
      <div className="h-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded border border-primary/20 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={300}
          height={64}
          className="w-full h-full"
        />
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-100"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};