from repositories.relational_db.place.repository import RelationalDBPlaceRepository
from models.vrp import EntryVrpProcessModel, ResultVrpProcessModel, RetrieveDataResult
from di.unit_of_work import AbstractUnitOfWork


# async def process_vrp(
#     async_unit_of_work: AbstractUnitOfWork, data: EntryVrpProcessModel
# ) -> ResultVrpProcessModel:
#     async with async_unit_of_work as auow:
#         no = await auow.place_repo.get_accommodation(data)
#         await auow.pokemon_repo.replace_types(no, data.type_names)

#         if data.previous_evolution_numbers:
#             if not await auow.pokemon_repo.are_existed(data.previous_evolution_numbers):
#                 raise PokemonNotFound(data.previous_evolution_numbers)
#             await auow.pokemon_repo.replace_previous_evolutions(no, data.previous_evolution_numbers)
#         if data.next_evolution_numbers:
#             if not await auow.pokemon_repo.are_existed(data.next_evolution_numbers):
#                 raise PokemonNotFound(data.next_evolution_numbers)
#             await auow.pokemon_repo.replace_next_evolutions(no, data.next_evolution_numbers)

#         return await auow.pokemon_repo.get(no)
    
async def retrieve_data( data: EntryVrpProcessModel) -> RetrieveDataResult:
    # async with async_unit_of_work as auow:
    from settings.db import get_async_session
    place_repo = RelationalDBPlaceRepository(get_async_session())
    accomodation = {data.accommodation_id: await place_repo.get_accommodation(data.accommodation_id)}
    
    foodAndDrinks = dict()
    activities = dict()
    for interval, place_ids in data.desired_places.items():
        if interval in ["breakfast", "lunch", "dinner"]:
            for place_id in place_ids:
                if place_id in foodAndDrinks:
                    continue
                
                foodAndDrinks[place_id] = await place_repo.get_foodAndDrink(place_id)
        if interval in ["travel1", "travel2"]:
            for place_id in place_ids:
                if place_id in activities:
                    continue
                
                activities[place_id] = await place_repo.get_activity(place_id)
                
    return RetrieveDataResult(accomodation, foodAndDrinks, activities)