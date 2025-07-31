import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioUploadProps {
  onUpload: (file: File) => void;
}

export const AudioUpload = ({ onUpload }: AudioUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300",
        isDragActive 
          ? "border-accent bg-accent/10 scale-105 shadow-lg" 
          : "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 hover:shadow-md"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <div className="relative">
            <Upload className="h-14 w-14 text-accent animate-bounce" />
            <div className="absolute inset-0 h-14 w-14 rounded-full bg-accent/20 animate-ping" />
          </div>
        ) : (
          <div className="relative">
            <Music className="h-14 w-14 text-primary" />
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-sm" />
          </div>
        )}
        <div className="space-y-2">
          <p className="text-base font-medium text-primary">
            {isDragActive ? "Drop your audio file here" : "Click to upload or drag audio file"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports MP3, WAV, M4A, OGG, FLAC • Max 50MB
          </p>
        </div>
      </div>
    </div>
  );
};