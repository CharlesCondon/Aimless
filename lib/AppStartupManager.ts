import { Platform } from 'react-native';

class AppStartupManager {
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  
  init(): Promise<void> {
    if (this.initialized) {
      return Promise.resolve();
    }
    
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.initPromise = new Promise<void>((resolve) => {
      // Stage 1: Basic initialization
      setTimeout(() => {
        // Allow the JS thread to breathe
        setTimeout(() => {
          // Stage 2: More expensive operations
          this.initialized = true;
          resolve();
        }, 500);
      }, 500);
    });
    
    return this.initPromise;
  }
  
  // Helper for deferring heavy operations
  async runWhenReady(operation: () => any): Promise<any> {
    await this.init();
    return operation();
  }
}

export default new AppStartupManager();