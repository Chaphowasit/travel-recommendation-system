import { Accommodation, Activity } from "./place";
import { RouteData } from "./route";

export const CALL_ACTIVITY = "activity"
export const CALL_ACCOMMODATION = "accommodation"
export const GENERATE_ROUTE = "generate"

export type CALL_ACCOMMODATION = typeof CALL_ACCOMMODATION;
export type CALL_ACTIVITY = typeof CALL_ACTIVITY;
export type GENERATE_ROUTE = typeof GENERATE_ROUTE

export const CALL_ACTIVITY_MESSAGE = "Give me any activities"
export const CALL_ACCOMMODATION_MESSAGE = "Give me any accommodations"
export const GENERATE_ROUTE_MESSAGE = "Generate route from my note"


export interface Message {
    sender: string;
    text: string;
    accommodations?: Accommodation[];
    activities?: Activity[];
    route?: RouteData;
    state?: string;
}
