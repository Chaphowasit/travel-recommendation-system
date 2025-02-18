export interface RouteItem {
    arrival_time: number;
    departure_time: number;
    index: number;
    node: string;
    travel_time: number;
    waiting_time: number;
}

export interface RouteData {
    routes: RouteItem[][];
    total_time: number;
    total_waiting_time: number;
}


