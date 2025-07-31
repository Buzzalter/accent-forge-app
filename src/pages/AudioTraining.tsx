import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AudioUpload } from "@/components/AudioUpload";
import { AudioPreview } from "@/components/AudioPreview";
import { TrainingSpinner } from "@/components/TrainingSpinner";
import { TrainModelDialog } from "@/components/TrainModelDialog";
import { RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

    setIsGenerating(true);
    setOutputAudio(null);

    try {
      // TODO: Replace with actual API call
      const payload = {
        audioUuid: referenceAudio.uuid,
        prompt: prompt.trim(),
      };
      
      console.log("Generating training audio with payload:", payload);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock output audio (using same file for demo)
      const outputAudioFile: AudioFile = {
        file: referenceAudio.file,
        uuid: `training-output-${Date.now()}`,
        url: referenceAudio.url,
      };
      
      setOutputAudio(outputAudioFile);
      toast({
        title: "Audio generated successfully",
        description: "Your training audio sample has been generated.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error processing your audio.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTrainStart = (jobId: string) => {
    setTrainingJobId(jobId);
  };

  const handleClear = () => {
    setReferenceAudio(null);
    setPrompt("");
    setOutputAudio(null);
    setIsGenerating(false);
    setTrainingJobId(null);
    toast({
      title: "Cleared",
      description: "All inputs and outputs have been cleared.",
    });
  };

  const isGenerateDisabled = !referenceAudio || !prompt.trim() || isGenerating;

  return (
    <div className="bg-background p-6">
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
                <Label>Reference Audio</Label>
                {!referenceAudio ? (
                  <AudioUpload onUpload={handleAudioUpload} />
                ) : (
                  <AudioPreview 
                    audioFile={referenceAudio} 
                    onRemove={() => setReferenceAudio(null)}
                  />
                )}
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Training Prompt</Label>
                <Input
                  id="prompt"
                  placeholder="Describe the voice characteristics you want to train..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
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
                <TrainingSpinner />
              ) : outputAudio ? (
                <>
                  <AudioPreview audioFile={outputAudio} showRemove={false} />
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