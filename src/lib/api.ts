const API_BASE_URL = 'http://localhost:8034';

export interface GenerateConfig {
  uuid: string;
  task: string;
  prompt: string;
  accent: string;
  gender: boolean;
  speed: number;
  pitch: number;
}

export interface TrainingJobConfig {
  uuid: string;
}

export interface JobResponse {
  uuid: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  audioUrl?: string;
}

export interface AudioUploadResponse {
  uuid: string;
  success: boolean;
}

export const API = {
  async uploadAudio(file: File): Promise<AudioUploadResponse> {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload audio: ${response.statusText}`);
    }

    return await response.json();
  },

  async postGenerate(config: GenerateConfig): Promise<JobResponse> {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to start generation: ${response.statusText}`);
    }

    return await response.json();
  },

  async postTrainingJob(config: TrainingJobConfig): Promise<JobResponse> {
    const response = await fetch(`${API_BASE_URL}/training`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to start training: ${response.statusText}`);
    }

    return await response.json();
  },

  async getGenerateStatus(uuid: string): Promise<JobResponse> {
    const response = await fetch(`${API_BASE_URL}/generate/${uuid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get generation status: ${response.statusText}`);
    }

    return await response.json();
  },

  async getTrainingStatus(uuid: string): Promise<JobResponse> {
    const response = await fetch(`${API_BASE_URL}/training/${uuid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get training status: ${response.statusText}`);
    }

    return await response.json();
  }
};