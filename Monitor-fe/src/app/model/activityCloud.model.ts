import { ActivityEdge } from './activityEdge.model';

export class ActivityCloud extends ActivityEdge {
    latestZ: number;
    latestX: number;
    latestY: number;
    motionOverall: number;
}
