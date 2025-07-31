import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTrainingJobs } from '@/contexts/TrainingJobContext';
import { toast } from '@/hooks/use-toast';

interface TrainModelDialogProps {
  onTrainStart: (jobId: string) => void;
}

export const TrainModelDialog = ({ onTrainStart }: TrainModelDialogProps) => {
  const [open, setOpen] = useState(false);
  const [modelName, setModelName] = useState('');
  const { addJob } = useTrainingJobs();

  const handleConfirm = () => {
    if (!modelName.trim()) {
      toast({
        title: "Model name required",
        description: "Please enter a name for your model.",
        variant: "destructive",
      });
      return;
    }

    const jobId = addJob(modelName.trim());
    onTrainStart(jobId);
    
    toast({
      title: "Training started",
      description: `Model "${modelName.trim()}" has been queued for training.`,
    });
    
    setModelName('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-training-primary hover:bg-training-primary/90 text-training-primary-foreground">
          Train Model
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Train New Model</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model-name">Model Name</Label>
            <Input
              id="model-name"
              placeholder="Enter a name for your model..."
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="bg-training-primary hover:bg-training-primary/90 text-training-primary-foreground"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};