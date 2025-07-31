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

export interface SampleGenerationConfig {
  task: string;
  modelId?: string; // for completed training models
  prompt: string;
  voiceSettings?: {
    speed?: number;
    pitch?: number;
    emotion?: string;
  };
}

export interface SampleGenerationResponse {
  uuid: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  task: string;
  audioUrl?: string; // available when completed
  createdAt: string;
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

  // Generate audio sample
  async generateSample(config: SampleGenerationConfig): Promise<SampleGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/samples/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: config.task,
        modelId: config.modelId,
        prompt: config.prompt,
        voiceSettings: config.voiceSettings || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate sample: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      uuid: data.uuid,
      status: data.status || 'queued',
      progress: data.progress || 0,
      task: config.task,
      audioUrl: data.audioUrl,
      createdAt: data.createdAt || new Date().toISOString(),
      ...data,
    };
  }

  // Get sample generation status
  async getSampleStatus(uuid: string): Promise<SampleGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/samples/status/${uuid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get sample status: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      uuid: data.uuid,
      status: data.status,
      progress: data.progress || 0,
      task: data.task,
      audioUrl: data.audioUrl,
      createdAt: data.createdAt || new Date().toISOString(),
      ...data,
    };
  }

  // Get general status (for any UUID - training or sample)
  async getStatus(uuid: string): Promise<{ status: string; progress: number; type: 'training' | 'sample' }> {
    const response = await fetch(`${this.baseUrl}/status/${uuid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      status: data.status,
      progress: data.progress || 0,
      type: data.type || 'sample',
      ...data,
    };
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

// Training job functions
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

// Sample generation functions
export const generateAudioSample = async (
  task: string,
  prompt: string,
  modelId?: string,
  voiceSettings?: any
): Promise<SampleGenerationResponse> => {
  return await trainingAPI.generateSample({
    task,
    prompt,
    modelId,
    voiceSettings,
  });
};

export const checkSampleStatus = async (uuid: string): Promise<SampleGenerationResponse> => {
  return await trainingAPI.getSampleStatus(uuid);
};

// Universal status check for spinners
export const checkStatus = async (uuid: string) => {
  return await trainingAPI.getStatus(uuid);
};