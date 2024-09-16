from dataclasses import dataclass, field
from typing import List, Optional

from common.type import PlaceIdStr

@dataclass
class FoodAndDrinkModel:
    id: PlaceIdStr
    name: str
    about_and_tags: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    start_time: Optional[float]
    end_time: Optional[float]
    reviews: List[str]
    best_nearby_accommodations: Optional[List[str]]
    best_nearby_foodAndDrinks: Optional[List[str]]
    best_nearby_activities: Optional[List[str]]
    
    
@dataclass
class ActivityModel:
    id: PlaceIdStr
    name: str
    about_and_tags: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    start_time: Optional[float]
    end_time: Optional[float]
    duration: Optional[int]
    reviews: List[str]
    best_nearby_foodAndDrinks: Optional[List[str]]
    best_nearby_activities: Optional[List[str]]
    
@dataclass
class AccommodationModel:
    id: PlaceIdStr
    name: str
    about_and_tags: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    start_time: Optional[float] 
    end_time: Optional[float]
    reviews: List[str]
    best_nearby_foodAndDrinks: Optional[List[str]]
    best_nearby_activities: Optional[List[str]]