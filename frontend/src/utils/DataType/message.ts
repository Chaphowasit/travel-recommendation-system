import { Accommodation, Activity } from "./place";

export interface Message {
    sender: string;
    text: string;
    accommodations?: Accommodation[],  
    activities?: Activity[]
}
