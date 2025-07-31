import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTrainingJobs } from '@/contexts/TrainingJobContext';
import { List, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const TrainingJobList = () => {
  const [open, setOpen] = useState(false);
  const { jobs } = useTrainingJobs();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4" />;
      case 'training':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'training':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <List className="h-4 w-4" />
          Training Jobs
          {jobs.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
              {jobs.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Training Jobs</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No training jobs yet
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{job.name}</h3>
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1 capitalize">{job.status}</span>
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(job.progress)}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Job ID: {job.id}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};