export interface Range {
    start: number;
    end: number;
}

export interface Accommodation {
    id: string;
    name: string;
    description: string;
    tag: string;
    business_hour: Range;
    image: string;
}

export interface Activity {
    id: string;
    name: string;
    description: string;
    tag: string;
    business_hour: Range;
    duration: number,
    image: string;
}