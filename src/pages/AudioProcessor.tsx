import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AudioUpload } from "@/components/AudioUpload";
import { AudioPreview } from "@/components/AudioPreview";
import { ProcessingSpinner } from "@/components/ProcessingSpinner";
import { RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateAudioSample, checkSampleStatus, isTrainingAPIConfigured, setTrainingAPIConfig } from "@/lib/api";

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
  const [processingUuid, setProcessingUuid] = useState<string | null>(null);
  
  // Creation tab state
  const [voiceGender, setVoiceGender] = useState(false); // false = Masculine, true = Feminine
  const [pitch, setPitch] = useState([3]);
  const [speed, setSpeed] = useState([3]);

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


  const handleGenerate = async (useCreationMode = false) => {
    if (useCreationMode) {
      if (!selectedAccent || !prompt.trim()) return;
    } else {
      if (!referenceAudio || !selectedAccent || !prompt.trim()) return;
    }

    if (!isTrainingAPIConfigured()) {
      toast({
        title: "API not configured",
        description: "Please configure your API settings first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setOutputAudio(null);
    setProcessingUuid(null);

    try {
      const config = useCreationMode 
        ? { 
            accent: selectedAccent, 
            gender: voiceGender ? 'feminine' : 'masculine',
            pitch: pitch[0],
            speed: speed[0],
            generationType: 'creation'
          }
        : { 
            accent: selectedAccent,
            generationType: 'reference'
          };

      const response = await generateAudioSample(
        useCreationMode ? 'voice_creation' : 'accent_generation',
        `${prompt} (Accent: ${selectedAccent})`,
        undefined,
        config
      );
      
      setProcessingUuid(response.uuid);
      
      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const status = await checkSampleStatus(response.uuid);
          
          if (status.status === 'completed' && status.audioUrl) {
            const audioResponse = await fetch(status.audioUrl);
            const audioBlob = await audioResponse.blob();
            const audioFile = new File([audioBlob], 'generated-audio.wav', { type: 'audio/wav' });
            
            const outputAudioFile: AudioFile = {
              file: audioFile,
              uuid: status.uuid,
              url: status.audioUrl,
            };
            
            setOutputAudio(outputAudioFile);
            setIsProcessing(false);
            clearInterval(pollInterval);
            
            toast({
              title: "Audio generated successfully",
              description: useCreationMode ? "Your audio has been created." : "Your audio has been processed with the selected accent.",
            });
          } else if (status.status === 'failed') {
            setIsProcessing(false);
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
      
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isProcessing) {
          setIsProcessing(false);
          toast({
            title: "Generation timeout",
            description: "Audio generation took too long. Please try again.",
            variant: "destructive",
          });
        }
      }, 300000);
      
    } catch (error) {
      console.error('Error generating audio:', error);
      setIsProcessing(false);
      toast({
        title: "Generation failed",
        description: "There was an error processing your audio.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setReferenceAudio(null);
    setPrompt("");
    setSelectedAccent("");
    setOutputAudio(null);
    setIsProcessing(false);
    setProcessingUuid(null);
    setVoiceGender(false);
    setPitch([3]);
    setSpeed([3]);
    toast({
      title: "Cleared",
      description: "All inputs and outputs have been cleared.",
    });
  };

  const [activeTab, setActiveTab] = useState("reference");
  
  const isGenerateDisabledReference = !referenceAudio || !selectedAccent || !prompt.trim() || isProcessing;
  const isGenerateDisabledCreation = !selectedAccent || !prompt.trim() || isProcessing;

  return (
    <div className="bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
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
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="reference">Reference</TabsTrigger>
                  <TabsTrigger value="creation">Creation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="reference" className="space-y-6 mt-6">
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
                    onClick={() => handleGenerate(false)}
                    disabled={isGenerateDisabledReference}
                    className="w-full"
                    size="lg"
                  >
                    Generate
                  </Button>
                </TabsContent>

                <TabsContent value="creation" className="space-y-6 mt-6">
                  {/* Voice Gender Toggle */}
                  <div className="space-y-2">
                    <Label className="text-center block">Voice Gender</Label>
                    <div className="flex justify-center gap-3">
                      <div
                        onClick={() => setVoiceGender(false)}
                        className={`flex-1 max-w-24 p-3 text-center rounded-lg border-2 cursor-pointer transition-all ${
                          !voiceGender 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-sm font-medium">Masculine</div>
                      </div>
                      <div
                        onClick={() => setVoiceGender(true)}
                        className={`flex-1 max-w-24 p-3 text-center rounded-lg border-2 cursor-pointer transition-all ${
                          voiceGender 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-sm font-medium">Feminine</div>
                      </div>
                    </div>
                  </div>

                  {/* Pitch Slider */}
                  <div className="space-y-2">
                    <Label>Pitch: {pitch[0]}</Label>
                    <Slider
                      value={pitch}
                      onValueChange={setPitch}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Speed Slider */}
                  <div className="space-y-2">
                    <Label>Speed: {speed[0]}</Label>
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt-creation">Prompt</Label>
                    <Input
                      id="prompt-creation"
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
                    onClick={() => handleGenerate(true)}
                    disabled={isGenerateDisabledCreation}
                    className="w-full"
                    size="lg"
                  >
                    Generate
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-primary">Output</CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <ProcessingSpinner uuid={processingUuid} />
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