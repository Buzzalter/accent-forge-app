import { useRef, useEffect, useState } from "react";
import { Play, Pause, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioFile } from "@/pages/AudioProcessor";
import { cn } from "@/lib/utils";

interface TrainingAudioPreviewProps {
  audioFile: AudioFile;
  onRemove?: () => void;
  showRemove?: boolean;
}

export const TrainingAudioPreview = ({ audioFile, onRemove, showRemove = true }: TrainingAudioPreviewProps) => {
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
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;

    const initAudioContext = async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = context.createMediaElementSource(audio);
        const analyserNode = context.createAnalyser();
        
        analyserNode.fftSize = 256;
        source.connect(analyserNode);
        analyserNode.connect(context.destination);
        
        setAudioContext(context);
        setAnalyser(analyserNode);
      } catch (error) {
        console.error("Failed to initialize audio context:", error);
      }
    };

    initAudioContext();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isPlaying) return;

    const drawVisualizer = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = 'rgb(245, 245, 245)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
          
          // Training theme colors - orange to sea green gradient
          const ratio = i / bufferLength;
          const r = Math.floor(255 * (1 - ratio) + 56 * ratio);
          const g = Math.floor(165 * (1 - ratio) + 178 * ratio);
          const b = Math.floor(0 * (1 - ratio) + 142 * ratio);
          
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
        
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(draw);
        }
      };
      
      draw();
    };

    drawVisualizer();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

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
    const link = document.createElement('a');
    link.href = audioFile.url;
    link.download = audioFile.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="border border-training-primary/20 rounded-lg p-4 bg-training-primary/5">
      <audio ref={audioRef} src={audioFile.url} />
      
      <div className="flex items-center gap-3 mb-4">
        <Button
          onClick={togglePlayPause}
          size="sm"
          className="h-10 w-10 rounded-full bg-training-primary hover:bg-training-primary/90 text-training-primary-foreground"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-training-primary truncate">
              {audioFile.file.name}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-training-accent/30 hover:border-training-accent hover:bg-training-accent/10"
          >
            <Download className="h-3 w-3 text-training-accent" />
          </Button>
          
          {showRemove && onRemove && (
            <Button
              onClick={onRemove}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 border-red-300 hover:border-red-500 hover:bg-red-50"
            >
              <X className="h-3 w-3 text-red-500" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Audio Visualizer */}
      <div className="mb-3">
        <canvas
          ref={canvasRef}
          width={300}
          height={60}
          className="w-full h-15 rounded border border-training-accent/20"
        />
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-training-primary to-training-accent transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};