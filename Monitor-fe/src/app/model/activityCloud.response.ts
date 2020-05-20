import { ActivityEdgeResponse } from './activityEdge.response';
import { ObjResponse } from './rootDynamoObj.model';

export class ActivityCloudResponse extends ActivityEdgeResponse {
    latestZ: ObjResponse;
    latestX: ObjResponse;
    latestY: ObjResponse;
    motionOverall: ObjResponse;
}
