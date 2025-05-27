
// Background analysis utilities for non-blocking face recognition tasks
export interface BackgroundAnalysisTask {
  id: string;
  type: 'detailed_analysis' | 'learning_update' | 'template_management';
  data: any;
  priority: number;
}

class BackgroundProcessor {
  private queue: BackgroundAnalysisTask[] = [];
  private processing = false;

  async addTask(task: Omit<BackgroundAnalysisTask, 'id'>): Promise<void> {
    const taskWithId = {
      ...task,
      id: `${task.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Insert task based on priority (higher priority first)
    const insertIndex = this.queue.findIndex(t => t.priority < task.priority);
    if (insertIndex === -1) {
      this.queue.push(taskWithId);
    } else {
      this.queue.splice(insertIndex, 0, taskWithId);
    }

    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) continue;

      try {
        await this.processTask(task);
      } catch (error) {
        console.error(`Background task ${task.id} failed:`, error);
      }
    }

    this.processing = false;
  }

  private async processTask(task: BackgroundAnalysisTask): Promise<void> {
    console.log(`Processing background task: ${task.type}`);
    
    switch (task.type) {
      case 'detailed_analysis':
        await this.handleDetailedAnalysis(task.data);
        break;
      case 'learning_update':
        await this.handleLearningUpdate(task.data);
        break;
      case 'template_management':
        await this.handleTemplateManagement(task.data);
        break;
    }
  }

  private async handleDetailedAnalysis(data: any): Promise<void> {
    // Defer detailed lighting and environmental analysis
    const { analyzeFaceQuality } = await import('./enhancedFaceRecognition');
    if (data.imageData) {
      const detailedAnalysis = await analyzeFaceQuality(data.imageData);
      console.log('Background detailed analysis completed:', detailedAnalysis?.qualityScore);
    }
  }

  private async handleLearningUpdate(data: any): Promise<void> {
    // Update learning metrics in background
    const { updateUserLearningMetrics } = await import('../services/learningService');
    await updateUserLearningMetrics(
      data.userEmail,
      data.success,
      data.confidence,
      data.qualityScore
    );
  }

  private async handleTemplateManagement(data: any): Promise<void> {
    // Manage face templates in background
    const { manageFaceTemplates } = await import('../services/faceTemplateService');
    await manageFaceTemplates(
      data.userEmail,
      data.descriptor,
      data.qualityScore,
      data.confidenceScore,
      data.lightingConditions
    );
  }
}

export const backgroundProcessor = new BackgroundProcessor();
