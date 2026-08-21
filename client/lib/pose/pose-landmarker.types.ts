export interface PosePoint {
    x: number;
    y: number;
    visibility: number;
}

export interface UpperBodyLandmarks {
    leftShoulder: PosePoint;
    rightShoulder: PosePoint;
    leftElbow: PosePoint;
    rightElbow: PosePoint;
}

export type PoseWorkerRequest =
    | {
          type: "init";
          modelAssetPath: string;
          wasmBasePath: string;
      }
    | {
          type: "frame";
          bitmap: ImageBitmap;
          timestamp: number;
      }
    | { type: "close" };

export type PoseWorkerResponse =
    | { type: "ready" }
    | { type: "result"; landmarks: UpperBodyLandmarks | null }
    | { type: "error"; message: string };
