export class PayloadResponse {
    Payload: RootObjectResponse;
}

export class RootObjectResponse {
    M: StationResponse;
}

export class StationResponse {
    id: ObjResponse;
    timestamp: ObjResponse;
    humidity: ObjResponse;
    temperature: ObjResponse;
    rainHeight: ObjResponse;
    windIntensity: ObjResponse;
    windDirection: ObjResponse;
}

export class ObjResponse {
    N?: number | string;
    S?: number | string;
}