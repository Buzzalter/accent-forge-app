import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TrainingJob {
  id: string;
  name: string;
  status: 'queued' | 'training' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
}

interface TrainingJobContextType {
  jobs: TrainingJob[];
  addJob: (name: string) => string;
  updateJobProgress: (id: string, progress: number, status: TrainingJob['status']) => void;
  getJob: (id: string) => TrainingJob | undefined;
}

const TrainingJobContext = createContext<TrainingJobContextType | undefined>(undefined);

export const useTrainingJobs = () => {
  const context = useContext(TrainingJobContext);
  if (!context) {
    throw new Error('useTrainingJobs must be used within a TrainingJobProvider');
  }
  return context;
};

export const TrainingJobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<TrainingJob[]>([]);

  // Load jobs from localStorage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('training-jobs');
    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs).map((job: any) => ({
          ...job,
          createdAt: new Date(job.createdAt),
          completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
        }));
        setJobs(parsedJobs);
      } catch (error) {
        console.error('Failed to load training jobs from localStorage:', error);
      }
    }
  }, []);

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    localStorage.setItem('training-jobs', JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (name: string): string => {
    const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newJob: TrainingJob = {
      id,
      name,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
    };
    
    setJobs(prev => [newJob, ...prev]);
    
    // Simulate training progress
    simulateTrainingProgress(id);
    
    return id;
  };

  const updateJobProgress = (id: string, progress: number, status: TrainingJob['status']) => {
    setJobs(prev => prev.map(job => 
      job.id === id 
        ? { 
            ...job, 
            progress, 
            status,
            completedAt: status === 'completed' || status === 'failed' ? new Date() : job.completedAt
          }
        : job
    ));
  };

  const getJob = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  // Simulate training progress for demo purposes
  const simulateTrainingProgress = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      
      if (progress >= 100) {
        updateJobProgress(id, 100, 'completed');
        clearInterval(interval);
      } else {
        updateJobProgress(id, Math.min(progress, 95), 'training');
      }
    }, 1000);
  };

  return (
    <TrainingJobContext.Provider value={{ jobs, addJob, updateJobProgress, getJob }}>
      {children}
    </TrainingJobContext.Provider>
  );
};