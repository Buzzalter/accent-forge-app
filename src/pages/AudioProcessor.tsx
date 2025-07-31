import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AudioUpload } from "@/components/AudioUpload";
import { AudioPreview } from "@/components/AudioPreview";
import { ProcessingSpinner } from "@/components/ProcessingSpinner";
import { RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface AudioFile {
  file: File;
  uuid: string;
  url: string;
}

const accents = [
  { value: "american", label: "American" },
  { value: "british", label: "British" },
  { value: "australian", label: "Australian" },
  { value: "canadian", label: "Canadian" },
  { value: "irish", label: "Irish" },
];

const AudioProcessor = () => {
  const [referenceAudio, setReferenceAudio] = useState<AudioFile | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedAccent, setSelectedAccent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputAudio, setOutputAudio] = useState<AudioFile | null>(null);

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
    if (!referenceAudio || !selectedAccent || !prompt.trim()) return;

    setIsProcessing(true);
    setOutputAudio(null);

    try {
      // TODO: Replace with actual API call
      const payload = {
        audioUuid: referenceAudio.uuid,
        prompt: prompt.trim(),
        accent: selectedAccent,
      };
      
      console.log("Generating audio with payload:", payload);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock output audio (using same file for demo)
      const outputAudioFile: AudioFile = {
        file: referenceAudio.file,
        uuid: `output-${Date.now()}`,
        url: referenceAudio.url,
      };
      
      setOutputAudio(outputAudioFile);
      toast({
        title: "Audio generated successfully",
        description: "Your audio has been processed with the selected accent.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error processing your audio.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setReferenceAudio(null);
    setPrompt("");
    setSelectedAccent("");
    setOutputAudio(null);
    setIsProcessing(false);
    toast({
      title: "Cleared",
      description: "All inputs and outputs have been cleared.",
    });
  };

  const isGenerateDisabled = !referenceAudio || !selectedAccent || !prompt.trim() || isProcessing;

  return (
    <div className="bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">
            Voice Accent Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Transform your voice with AI-powered accent generation
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
              <CardTitle className="text-primary">Input</CardTitle>
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
                <Label htmlFor="prompt">Prompt</Label>
                <Input
                  id="prompt"
                  placeholder="Enter your text prompt..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Accent Selection */}
              <div className="space-y-2">
                <Label>Accent</Label>
                <Select value={selectedAccent} onValueChange={setSelectedAccent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an accent" />
                  </SelectTrigger>
                  <SelectContent>
                    {accents.map((accent) => (
                      <SelectItem key={accent.value} value={accent.value}>
                        {accent.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full"
                size="lg"
              >
                Generate
              </Button>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-primary">Output</CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <ProcessingSpinner />
              ) : outputAudio ? (
                <AudioPreview audioFile={outputAudio} showRemove={false} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Generated audio will appear here
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AudioProcessor;