import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { TrainingAudioUpload } from "@/components/TrainingAudioUpload";
import { TrainingAudioPreview } from "@/components/TrainingAudioPreview";
import { TrainingSpinner } from "@/components/TrainingSpinner";
import { TrainModelDialog } from "@/components/TrainModelDialog";
import { RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API } from "@/lib/api";

export interface AudioFile {
  file: File;
  uuid: string;
  url: string;
  audioUuid?: string; // UUID from API upload
}

const AudioTraining = () => {
  const [referenceAudio, setReferenceAudio] = useState<AudioFile | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<AudioFile | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [previewJobUuid, setPreviewJobUuid] = useState<string | null>(null);
  const [trainingJobUuid, setTrainingJobUuid] = useState<string | null>(null);

  const handleGeneratePreview = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please enter a text prompt to generate preview.",
        variant: "destructive"
      });
      return;
    }

    if (!referenceAudio?.audioUuid) {
      toast({
        title: "Missing reference audio",
        description: "Please upload reference audio first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGeneratingPreview(true);
      setPreviewJobUuid(null);
      setGeneratedPreview(null);

      const config = {
        uuid: referenceAudio.audioUuid,
        task: 'training',
        prompt: prompt.trim(),
        accent: 'american',
        gender: false,
        speed: 3,
        pitch: 3
      };

      const response = await API.postGenerate(config);
      setPreviewJobUuid(response.uuid);

      // Poll for completion
      const pollStatus = async () => {
        try {
          const status = await API.getGenerateStatus(response.uuid);
          
          if (status.status === 'completed' && status.audioUrl) {
            setGeneratedPreview({
              file: new File([], 'preview.mp3'),
              uuid: status.uuid,
              url: status.audioUrl
            });
            setIsGeneratingPreview(false);
            toast({
              title: "Preview generated successfully!",
              description: "Your voice preview is ready."
            });
          } else if (status.status === 'failed') {
            throw new Error('Preview generation failed');
          }
        } catch (error) {
          setIsGeneratingPreview(false);
          setPreviewJobUuid(null);
          toast({
            title: "Preview generation failed",
            description: "Please try again.",
            variant: "destructive"
          });
        }
      };

      // Start polling
      const interval = setInterval(async () => {
        await pollStatus();
        if (!isGeneratingPreview) clearInterval(interval);
      }, 2000);
    } catch (error) {
      console.error('Preview generation error:', error);
      setIsGeneratingPreview(false);
      setPreviewJobUuid(null);
      toast({
        title: "Preview generation failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStartTraining = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please enter a text prompt for training.",
        variant: "destructive"
      });
      return;
    }

    if (!referenceAudio?.audioUuid) {
      toast({
        title: "Missing reference audio",
        description: "Please upload reference audio first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsTraining(true);
      setTrainingJobUuid(null);

      const config = {
        uuid: referenceAudio.audioUuid
      };

      const response = await API.postTrainingJob(config);
      setTrainingJobUuid(response.uuid);

      toast({
        title: "Training started!",
        description: "Your voice model training has begun. This may take several minutes."
      });
    } catch (error) {
      console.error('Training start error:', error);
      setIsTraining(false);
      setTrainingJobUuid(null);
      toast({
        title: "Training failed to start",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAudioUpload = async (file: File) => {
    try {
      const response = await API.uploadAudio(file);
      
      const audioFile: AudioFile = {
        file,
        uuid: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        audioUuid: response.uuid
      };
      setReferenceAudio(audioFile);
      
      // Store in localStorage for persistence
      localStorage.setItem('trainingReferenceAudio', JSON.stringify({
        name: file.name,
        audioUuid: response.uuid,
        url: audioFile.url
      }));
      
      toast({
        title: "Audio uploaded successfully",
        description: "Your audio file is ready for processing."
      });
    } catch (error) {
      console.error('Audio upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try uploading your audio file again.",
        variant: "destructive"
      });
    }
  };

  // Load reference audio from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('trainingReferenceAudio');
    if (stored) {
      const data = JSON.parse(stored);
      // Note: We can't restore the full file, but we can restore the UUID for API calls
      console.log('Stored reference audio found:', data.name);
    }
  }, []);

  const handleClear = () => {
    setReferenceAudio(null);
    setPrompt("");
    setGeneratedPreview(null);
    setIsGeneratingPreview(false);
    setIsTraining(false);
    setPreviewJobUuid(null);
    setTrainingJobUuid(null);
    localStorage.removeItem('trainingReferenceAudio');
    toast({
      title: "Cleared",
      description: "All inputs and outputs have been cleared."
    });
  };

  const isGenerateDisabled = !referenceAudio || !prompt.trim() || isGeneratingPreview;

  return (
    <div className="bg-gradient-to-br from-training-primary/5 via-background to-training-accent/5 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-training-primary mb-2">
            Voice Model Training
          </h1>
          <p className="text-lg text-muted-foreground">
            Train custom AI voice models with your reference audio
          </p>
        </div>

        {/* Clear Button */}
        <div className="flex justify-end mb-6">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Clear All
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-training-primary">Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Upload */}
              <div className="space-y-2">
                <Label className="text-training-primary">Reference Audio</Label>
                {!referenceAudio ? (
                  <TrainingAudioUpload onUpload={handleAudioUpload} />
                ) : (
                  <TrainingAudioPreview 
                    audioFile={referenceAudio} 
                    onRemove={() => setReferenceAudio(null)}
                  />
                )}
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-training-primary">Training Prompt</Label>
                <Input
                  id="prompt"
                  placeholder="Describe the voice characteristics you want to train..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="border-training-primary/30 focus:border-training-primary focus:ring-training-primary bg-training-primary/5 focus:bg-training-primary/10"
                />
              </div>

              {/* Generate Preview Button */}
              <Button 
                onClick={handleGeneratePreview}
                disabled={isGenerateDisabled}
                className="w-full bg-training-primary hover:bg-training-primary/90 text-training-primary-foreground"
                size="lg"
              >
                Generate Preview
              </Button>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-training-primary">Output</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGeneratingPreview ? (
                <TrainingSpinner uuid={previewJobUuid} />
              ) : generatedPreview ? (
                <>
                  <TrainingAudioPreview audioFile={generatedPreview} showRemove={false} />
                  <TrainModelDialog onTrainStart={handleStartTraining} />
                  {isTraining && trainingJobUuid && (
                    <div className="mt-4">
                      <TrainingSpinner uuid={trainingJobUuid} />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Generated training preview will appear here
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AudioTraining;