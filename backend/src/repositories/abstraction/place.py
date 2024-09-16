import abc
from typing import Any, List, Optional

from common.type import PlaceIdStr
from models.place import (
    FoodAndDrinkModel,
    AccommodationModel,
    ActivityModel
)


class AbstractPlaceRepository(abc.ABC):
    session: Any

    @abc.abstractmethod
    async def get_foodAndDrink(self, id: PlaceIdStr) -> FoodAndDrinkModel:
        raise NotImplementedError
    
    @abc.abstractmethod
    async def get_activity(self, id: PlaceIdStr) -> ActivityModel:
        raise NotImplementedError
    
    @abc.abstractmethod
    async def get_accommodation(self, id: PlaceIdStr) -> AccommodationModel:
        raise NotImplementedError

    @abc.abstractmethod
    async def list_foodAndDrink(self, ids: List[PlaceIdStr]) -> List[FoodAndDrinkModel]:
        raise NotImplementedError
    
    @abc.abstractmethod
    async def list_activity(self, ids: List[PlaceIdStr]) -> List[ActivityModel]:
        """
        Lists multiple ActivityModels by their IDs.

        :param ids: A list of PlaceIdStr representing the IDs of the activities.
        :return: A list of ActivityModel instances corresponding to the provided IDs.
        """
        raise NotImplementedError

    @abc.abstractmethod
    async def list_accommodation(self, ids: List[PlaceIdStr]) -> List[AccommodationModel]:
        """
        Lists multiple AccommodationModels by their IDs.

        :param ids: A list of PlaceIdStr representing the IDs of the accommodations.
        :return: A list of AccommodationModel instances corresponding to the provided IDs.
        """
        raise NotImplementedError