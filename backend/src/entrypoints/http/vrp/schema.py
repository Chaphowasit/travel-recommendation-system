from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, validator

from common.type import PlaceIdStr


class VrpProcessRequest(BaseModel):
    accommodation_id: str = Field(..., description="ID of the accommodation place")
    intervals: Dict[Literal["breakfast", "travel1", "lunch", "travel2", "dinner"], 
                    Dict[Literal["start", "end"], float]]
    desired_places: Dict[Literal["breakfast", "travel1", "lunch", "travel2", "dinner"], List[PlaceIdStr]]
    
    # Custom Pydantic validator for PlaceIdStr
    @validator('accommodation_id', pre=True)
    def validate_accommodation_id(cls, v):
        return PlaceIdStr(v)

    # Validator for lists of PlaceIdStr in desired_places
    @validator('desired_places', each_item=True, pre=True)
    def validate_desired_places(cls, v):
        return [PlaceIdStr(item) for item in v]

    class Config:
        arbitrary_types_allowed = True

class SomeResponse(BaseModel):
    something: str = "hello"