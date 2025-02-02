export interface BusinessHour {
    start: number; // 0-96 format
    end: number; // 0-96 format
}

export interface Accommodation {
    id: string;
    name: string;
    description: string;
    tag: string;
    business_hour: BusinessHour;
    image: string;
}

export interface Activity {
    id: string;
    name: string;
    description: string;
    tag: string;
    business_hour: BusinessHour;
    image: string;
}