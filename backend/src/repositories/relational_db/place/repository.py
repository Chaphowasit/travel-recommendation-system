from typing import Callable, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import delete, func, insert, select, update

from common.type import PlaceIdStr
from models.exception import PlaceAlreadyExists, PlaceNotFound
from models.place import (
    FoodAndDrinkModel,
    AccommodationModel,
    ActivityModel,
)

from ...abstraction import AbstractPlaceRepository
from .mapper import FoodAndDrinkOrmMapper, ActivityOrmMapper, AccommodationOrmMapper
from .orm import FoodAndDrink, Activity, Accommodation

func: Callable


class RelationalDBPlaceRepository(AbstractPlaceRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_foodAndDrink(self, id: PlaceIdStr) -> FoodAndDrinkModel:
        stmt = select(FoodAndDrink).where(FoodAndDrink.id == id)
        place = (await self.session.execute(stmt)).scalars().one_or_none()
        if not place:
            raise PlaceNotFound(id)
        return FoodAndDrinkOrmMapper.orm_to_entity(place)
    
    async def get_activity(self, id: PlaceIdStr) -> ActivityModel:
        stmt = select(Activity).where(Activity.id == id)
        place = (await self.session.execute(stmt)).scalars().one_or_none()
        if not place:
            raise PlaceNotFound(id)
        return ActivityOrmMapper.orm_to_entity(place)
    
    async def get_accommodation(self, id: PlaceIdStr) -> AccommodationModel:
        stmt = select(Accommodation).where(Accommodation.id == id)
        place = (await self.session.execute(stmt)).scalars().one_or_none()
        if not place:
            raise PlaceNotFound(id)
        return AccommodationOrmMapper.orm_to_entity(place)

    async def list_foodAndDrink(self, ids: List[PlaceIdStr]) -> List[FoodAndDrinkModel]:
        stmt = select(FoodAndDrink).where(FoodAndDrink.id.in_(ids))
        places = (await self.session.execute(stmt)).scalars().all()
        return [FoodAndDrinkOrmMapper.orm_to_entity(place) for place in places]

    async def list_activity(self, ids: List[PlaceIdStr]) -> List[ActivityModel]:
        """
        Lists multiple ActivityModels by their IDs.
        """
        stmt = select(Activity).where(Activity.id.in_(ids))
        activities = (await self.session.execute(stmt)).scalars().all()
        return [ActivityOrmMapper.orm_to_entity(activity) for activity in activities]

    async def list_accommodation(self, ids: List[PlaceIdStr]) -> List[AccommodationModel]:
        """
        Lists multiple AccommodationModels by their IDs.
        """
        stmt = select(Accommodation).where(Accommodation.id.in_(ids))
        accommodations = (await self.session.execute(stmt)).scalars().all()
        return [AccommodationOrmMapper.orm_to_entity(accommodation) for accommodation in accommodations]