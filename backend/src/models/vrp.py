from dataclasses import dataclass
from typing import Dict, List, Literal, Optional

from common.type import PlaceIdStr
from models.place import AccommodationModel, ActivityModel, FoodAndDrinkModel

@dataclass
class EntryVrpProcessModel:
    accommodation_id: PlaceIdStr
    intervals: Dict[Literal["breakfast", "travel1", "lunch", "travel2", "dinner"], Dict[Literal["start", "end"], float]]
    desired_places: Dict[Literal["breakfast", "travel1", "lunch", "travel2", "dinner"], List[PlaceIdStr]]

@dataclass
class RetrieveDataResult:
    accommodation: Dict[PlaceIdStr, Optional[AccommodationModel]]
    food_and_drinks: Dict[PlaceIdStr, Optional[FoodAndDrinkModel]]
    activities: Dict[PlaceIdStr, Optional[ActivityModel]]

@dataclass
class ResultVrpProcessModel:
    pass