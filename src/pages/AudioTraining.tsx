import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AudioUpload } from "@/components/AudioUpload";
import { TrainingAudioUpload } from "@/components/TrainingAudioUpload";
import { AudioPreview } from "@/components/AudioPreview";
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
}

const AudioTraining = () => {
  const [referenceAudio, setReferenceAudio] = useState<AudioFile | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputAudio, setOutputAudio] = useState<AudioFile | null>(null);
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [generationUuid, setGenerationUuid] = useState<string | null>(null);

  const handleAudioUpload = async (file: File) => {
    try {
      // Simulate API call to upload audio and get UUID
      const formData = new FormData();
      formData.append("audio", file);
      
      // TODO: Replace with actual API call
      const mockUuid = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const audioFile: AudioFile = {
        file,
        uuid: mockUuid,
        url: URL.createObjectURL(file),
      };
      
      setReferenceAudio(audioFile);
      toast({
        title: "Audio uploaded successfully",
        description: "Your reference audio has been processed.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your audio file.",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!referenceAudio || !prompt.trim()) return;

    if (!API.isConfigured()) {
      toast({
        title: "API not configured",
        description: "Please configure your API settings first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setOutputAudio(null);
    setGenerationUuid(null);

    try {
      // Start sample generation for training
      const response = await API.generateSample({
        task: 'voice_training_sample',
        prompt: prompt.trim(),
        voiceSettings: { referenceAudioUuid: referenceAudio.uuid }
      });
      
      setGenerationUuid(response.uuid);
      
      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const status = await API.getSampleStatus(response.uuid);
          
          if (status.status === 'completed' && status.audioUrl) {
            // Create audio file from URL
            const audioResponse = await fetch(status.audioUrl);
            const audioBlob = await audioResponse.blob();
            const audioFile = new File([audioBlob], 'training-sample.wav', { type: 'audio/wav' });
            
            const outputAudioFile: AudioFile = {
              file: audioFile,
              uuid: status.uuid,
              url: status.audioUrl,
            };
            
            setOutputAudio(outputAudioFile);
            setIsGenerating(false);
            clearInterval(pollInterval);
            
            toast({
              title: "Audio generated successfully",
              description: "Your training audio sample has been generated.",
            });
          } else if (status.status === 'failed') {
            setIsGenerating(false);
            clearInterval(pollInterval);
            
            toast({
              title: "Generation failed",
              description: "There was an error processing your audio.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }, 2000);
      
      // Clean up interval after 5 minutes max
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isGenerating) {
          setIsGenerating(false);
          toast({
            title: "Generation timeout",
            description: "Audio generation took too long. Please try again.",
            variant: "destructive",
          });
        }
      }, 300000);
      
    } catch (error) {
      console.error('Error generating audio:', error);
      setIsGenerating(false);
      toast({
        title: "Generation failed",
        description: "There was an error processing your audio.",
        variant: "destructive",
      });
    }
  };

  const handleTrainStart = async (jobId: string) => {
    if (!referenceAudio || !outputAudio) return;

    try {
      // Start actual training job
      const response = await API.startTrainingJob({
        task: 'voice_model_training',
        referenceAudioFile: referenceAudio.file,
        prompt: prompt.trim()
      });
      
      setTrainingJobId(response.uuid);
      
      toast({
        title: "Training job started",
        description: `Training job ${response.uuid} has been queued.`,
      });
    } catch (error) {
      console.error('Error starting training job:', error);
      toast({
        title: "Training failed to start",
        description: "There was an error starting the training job.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setReferenceAudio(null);
    setPrompt("");
    setOutputAudio(null);
    setIsGenerating(false);
    setTrainingJobId(null);
    setGenerationUuid(null);
    toast({
      title: "Cleared",
      description: "All inputs and outputs have been cleared.",
    });
  };

  const isGenerateDisabled = !referenceAudio || !prompt.trim() || isGenerating;

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

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full bg-training-primary hover:bg-training-primary/90 text-training-primary-foreground"
                size="lg"
              >
                Generate Sample
              </Button>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-training-primary">Output</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating ? (
                <TrainingSpinner uuid={generationUuid} />
              ) : outputAudio ? (
                <>
                  <TrainingAudioPreview audioFile={outputAudio} showRemove={false} />
                  <TrainModelDialog onTrainStart={handleTrainStart} />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Generated training sample will appear here
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