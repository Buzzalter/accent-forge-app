// Training API service for external API calls
export interface TrainingJobConfig {
  task: string; // which system to post the job to
  referenceAudioFile: File;
  prompt: string;
  // Add other config parameters as needed
}

export interface TrainingJobResponse {
  uuid: string;
  status: 'queued' | 'training' | 'completed' | 'failed';
  progress: number;
  task: string;
  createdAt: string;
  // Add other response fields as needed
}

export interface TrainingJobStatus {
  uuid: string;
  status: 'queued' | 'training' | 'completed' | 'failed';
  progress: number;
  task: string;
  updatedAt: string;
  // Add other status fields as needed
}

class TrainingAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = process.env.VITE_TRAINING_API_URL || '', apiKey: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Set API configuration
  setConfig(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Start a new training job
  async startTrainingJob(config: TrainingJobConfig): Promise<TrainingJobResponse> {
    const formData = new FormData();
    formData.append('task', config.task);
    formData.append('referenceAudio', config.referenceAudioFile);
    formData.append('prompt', config.prompt);

    const response = await fetch(`${this.baseUrl}/training/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to start training job: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      uuid: data.uuid,
      status: data.status || 'queued',
      progress: data.progress || 0,
      task: config.task,
      createdAt: data.createdAt || new Date().toISOString(),
      ...data,
    };
  }

  // Get status of a specific training job
  async getTrainingJobStatus(uuid: string): Promise<TrainingJobStatus> {
    const response = await fetch(`${this.baseUrl}/training/status/${uuid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get training job status: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      uuid: data.uuid,
      status: data.status,
      progress: data.progress || 0,
      task: data.task,
      updatedAt: data.updatedAt || new Date().toISOString(),
      ...data,
    };
  }

  // Get all training jobs
  async getAllTrainingJobs(): Promise<TrainingJobStatus[]> {
    const response = await fetch(`${this.baseUrl}/training/jobs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get training jobs: ${response.statusText}`);
    }

    const data = await response.json();
    return data.jobs || [];
  }

  // Cancel a training job
  async cancelTrainingJob(uuid: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/training/cancel/${uuid}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel training job: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success || false;
  }

  // Get training result/output
  async getTrainingResult(uuid: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/training/result/${uuid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get training result: ${response.statusText}`);
    }

    return await response.json();
  }

  // Utility method to check if API is configured
  isConfigured(): boolean {
    return !!this.baseUrl && !!this.apiKey;
  }

  // Utility method to validate API connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const trainingAPI = new TrainingAPI();

// Export utility functions
export const setTrainingAPIConfig = (baseUrl: string, apiKey: string) => {
  trainingAPI.setConfig(baseUrl, apiKey);
};

export const isTrainingAPIConfigured = () => {
  return trainingAPI.isConfigured();
};

// Example usage functions
export const submitTrainingJob = async (
  task: string,
  referenceAudioFile: File,
  prompt: string
): Promise<TrainingJobResponse> => {
  return await trainingAPI.startTrainingJob({
    task,
    referenceAudioFile,
    prompt,
  });
};

export const checkJobStatus = async (uuid: string): Promise<TrainingJobStatus> => {
  return await trainingAPI.getTrainingJobStatus(uuid);
};

export const fetchAllJobs = async (): Promise<TrainingJobStatus[]> => {
  return await trainingAPI.getAllTrainingJobs();
};