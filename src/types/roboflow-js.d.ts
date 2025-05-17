declare module 'roboflow-js' {
  export class Roboflow {
    constructor(config: { apiKey: string });
    model(config: { model: string; version: number }): Promise<{
      predict: (image: string) => Promise<{
        predictions: Array<{
          x: number;
          y: number;
          width: number;
          height: number;
          confidence: number;
        }>;
      }>;
    }>;
  }
} 