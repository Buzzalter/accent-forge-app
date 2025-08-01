import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { AudioUpload } from "@/components/AudioUpload";
import { AudioPreview } from "@/components/AudioPreview";
import { ProcessingSpinner } from "@/components/ProcessingSpinner";
import { RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API } from "@/lib/api";

export interface AudioFile {
  file: File;
  uuid: string;
  url: string;
  audioUuid?: string; // UUID from API upload
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
  const [promptText, setPromptText] = useState("");
  const [accent, setAccent] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<AudioFile | null>(null);
  const [jobUuid, setJobUuid] = useState<string | null>(null);
  
  // Creation tab state
  const [voiceGender, setVoiceGender] = useState(false); // false = Masculine, true = Feminine
  const [pitch, setPitch] = useState([3]);
  const [speed, setSpeed] = useState([3]);

  // Tab state
  const [generationType, setGenerationType] = useState("reference");

  // Main generation function for both modes
  const handleGenerate = async () => {
    if (!promptText.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please enter a text prompt to generate audio.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      setJobUuid(null);
      setGeneratedAudio(null);

      const config = {
        uuid: referenceAudio?.audioUuid || '',
        task: generationType,
        prompt: promptText,
        accent: accent || 'american',
        gender: voiceGender,
        speed: speed[0],
        pitch: pitch[0]
      };

      const response = await API.postGenerate(config);
      setJobUuid(response.uuid);

      // Poll for completion
      const pollStatus = async () => {
        try {
          const status = await API.getGenerateStatus(response.uuid);
          
          if (status.status === 'completed' && status.audioUrl) {
            setGeneratedAudio({
              file: new File([], 'generated.mp3'),
              uuid: status.uuid,
              url: status.audioUrl
            });
            setIsProcessing(false);
            toast({
              title: "Audio generated successfully!",
              description: "Your AI-generated audio is ready."
            });
          } else if (status.status === 'failed') {
            throw new Error('Generation failed');
          }
        } catch (error) {
          setIsProcessing(false);
          setJobUuid(null);
          toast({
            title: "Generation failed",
            description: "Please try again with different settings.",
            variant: "destructive"
          });
        }
      };

      // Start polling
      const interval = setInterval(async () => {
        await pollStatus();
        if (!isProcessing) clearInterval(interval);
      }, 2000);
    } catch (error) {
      console.error('Generation error:', error);
      setIsProcessing(false);
      setJobUuid(null);
      toast({
        title: "Generation failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAudioUpload = async (audioUuid: string, file: File) => {
    const audioFile: AudioFile = {
      file,
      uuid: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      audioUuid // Store the API UUID
    };
    setReferenceAudio(audioFile);
    
    // Store in localStorage for persistence
    localStorage.setItem('referenceAudio', JSON.stringify({
      name: file.name,
      audioUuid,
      url: audioFile.url
    }));
  };

  // Load reference audio from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('referenceAudio');
    if (stored) {
      const data = JSON.parse(stored);
      // Note: We can't restore the full file, but we can restore the UUID for API calls
      console.log('Stored reference audio found:', data.name);
    }
  }, []);

  const handleClear = () => {
    setReferenceAudio(null);
    setPromptText("");
    setAccent("");
    setGeneratedAudio(null);
    setIsProcessing(false);
    setJobUuid(null);
    setVoiceGender(false);
    setPitch([3]);
    setSpeed([3]);
    localStorage.removeItem('referenceAudio');
    toast({
      title: "Cleared",
      description: "All inputs and outputs have been cleared."
    });
  };

  const isGenerateDisabledReference = !referenceAudio || !promptText.trim() || isProcessing;
  const isGenerateDisabledCreation = !promptText.trim() || isProcessing;

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
              <Tabs value={generationType} onValueChange={setGenerationType} className="w-full">
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
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                    />
                  </div>

                  {/* Accent Selection */}
                  <div className="space-y-2">
                    <Label>Accent</Label>
                    <Select value={accent} onValueChange={setAccent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an accent" />
                      </SelectTrigger>
                      <SelectContent>
                        {accents.map((accentOption) => (
                          <SelectItem key={accentOption.value} value={accentOption.value}>
                            {accentOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerate}
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
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                    />
                  </div>

                  {/* Accent Selection */}
                  <div className="space-y-2">
                    <Label>Accent</Label>
                    <Select value={accent} onValueChange={setAccent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an accent" />
                      </SelectTrigger>
                      <SelectContent>
                        {accents.map((accentOption) => (
                          <SelectItem key={accentOption.value} value={accentOption.value}>
                            {accentOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerate}
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
                <ProcessingSpinner uuid={jobUuid} />
              ) : generatedAudio ? (
                <AudioPreview audioFile={generatedAudio} showRemove={false} />
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