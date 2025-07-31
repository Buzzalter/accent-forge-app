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
        "border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition-all duration-200 hover:border-primary hover:bg-muted/50",
        isDragActive && "border-primary bg-muted/50 scale-105"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isDragActive ? (
          <Upload className="h-12 w-12 text-primary animate-bounce" />
        ) : (
          <Music className="h-12 w-12 text-muted-foreground" />
        )}
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isDragActive ? "Drop your audio file here" : "Click to upload or drag audio file"}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports MP3, WAV, M4A, OGG, FLAC
          </p>
        </div>
      </div>
    </div>
  );
};