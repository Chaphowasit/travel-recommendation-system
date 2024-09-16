from common.utils import convert_string_to_list, convert_time_to_float, create_list_notNone
from common.docstring import MAPPER_DOCSTRING
from models.place import FoodAndDrinkModel, ActivityModel, AccommodationModel

from .orm import FoodAndDrink, Activity, Accommodation

__doc__ = MAPPER_DOCSTRING


class FoodAndDrinkOrmMapper:
    @staticmethod
    def orm_to_entity(foodAndDrink: FoodAndDrink) -> (FoodAndDrinkModel):
        return FoodAndDrinkModel(
            id=foodAndDrink.id,
            name=foodAndDrink.name,
            about_and_tags=foodAndDrink.about_and_tags,
            latitude=foodAndDrink.latitude,
            longitude=foodAndDrink.longitude,
            start_time=convert_time_to_float(foodAndDrink.start_time),
            end_time=convert_time_to_float(foodAndDrink.end_time),
            reviews=convert_string_to_list(foodAndDrink.reviews),
            best_nearby_accommodations=create_list_notNone(
                foodAndDrink.nearby_accommodation1,
                foodAndDrink.nearby_accommodation2,
                foodAndDrink.nearby_accommodation3,
                ),
            best_nearby_foodAndDrinks=create_list_notNone(
                foodAndDrink.nearby_foodAndDrink1,
                foodAndDrink.nearby_foodAndDrink2,
                foodAndDrink.nearby_foodAndDrink3,
                ),
            best_nearby_activities=create_list_notNone(
                foodAndDrink.nearby_activity1,
                foodAndDrink.nearby_activity2,
                foodAndDrink.nearby_activity3,
                )
        )


class ActivityOrmMapper:
    @staticmethod
    def orm_to_entity(activity: Activity) -> (ActivityModel):
        return ActivityModel(
            id=activity.id,
            name=activity.name,
            about_and_tags=activity.about_and_tags,
            latitude=activity.latitude,
            longitude=activity.longitude,
            start_time=convert_time_to_float(activity.start_time),
            end_time=convert_time_to_float(activity.end_time),
            duration=activity.duration,
            reviews=convert_string_to_list(activity.reviews),
            best_nearby_foodAndDrinks=create_list_notNone(
                activity.nearby_foodAndDrink1,
                activity.nearby_foodAndDrink2,
                activity.nearby_foodAndDrink3,
                ),
            best_nearby_activities=create_list_notNone(
                activity.nearby_activity1,
                activity.nearby_activity2,
                activity.nearby_activity3,
                )
        )


class AccommodationOrmMapper:
    @staticmethod
    def orm_to_entity(accommodation: Accommodation) -> (AccommodationModel):
        return AccommodationModel(
            id=accommodation.id,
            name=accommodation.name,
            about_and_tags=accommodation.about_and_tags,
            latitude=accommodation.latitude,
            longitude=accommodation.longitude,
            start_time=convert_time_to_float(accommodation.start_time),
            end_time=convert_time_to_float(accommodation.end_time),
            reviews=convert_string_to_list(accommodation.reviews),
            best_nearby_foodAndDrinks=create_list_notNone(
                accommodation.nearby_foodAndDrink1,
                accommodation.nearby_foodAndDrink2,
                accommodation.nearby_foodAndDrink3,
                ),
            best_nearby_activities=create_list_notNone(
                accommodation.nearby_activity1,
                accommodation.nearby_activity2,
                accommodation.nearby_activity3,
                )
        )