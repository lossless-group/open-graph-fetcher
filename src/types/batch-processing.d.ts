export interface BatchOptions {
  overwriteExisting: boolean;
  createNewProperties: boolean;
  writeErrors: boolean;
  updateFetchDate: boolean;
  batchDelay: number;
}

export interface BatchProgress {
  currentFileIndex: number;
  totalFiles: number;
  successCount: number;
  errorCount: number;
  currentFileName: string;
  isProcessing: boolean;
  isPaused: boolean;
}

export interface ProcessingResult {
  success: boolean;
  error?: string;
  filePath: string;
}
