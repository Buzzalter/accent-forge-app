import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioWaveform, Mic } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-accent">
            AI Voice Studio
          </h1>
          <p className="text-xl text-muted-foreground">
            Transform your voice with cutting-edge AI technology
          </p>
        </div>

        <div className="grid gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/audio-processor")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-primary">
                <AudioWaveform className="h-6 w-6" />
                Voice Accent Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Upload your reference audio and generate speech with different accents using AI
              </p>
              <Button className="w-full">
                <Mic className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-muted-foreground">
                <Mic className="h-6 w-6" />
                Coming Soon - Feature 2
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                More exciting AI voice features coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
