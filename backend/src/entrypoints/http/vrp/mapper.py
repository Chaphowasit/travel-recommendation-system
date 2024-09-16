from models.vrp import EntryVrpProcessModel
from common.docstring import MAPPER_DOCSTRING
from models.place import (
    AccommodationModel,
    ActivityModel,
    FoodAndDrinkModel
)

from .schema import (
    VrpProcessRequest
)

__doc__ = MAPPER_DOCSTRING


class VrpRequestMapper:
    @staticmethod
    def process_vrp_request_to_entity(instance: VrpProcessRequest) -> (EntryVrpProcessModel):
        return EntryVrpProcessModel(
            accommodation_id=instance.accommodation_id,
            intervals=instance.intervals,
            desired_places=instance.desired_places
        )


# class PokemonResponseMapper:
#     @staticmethod
#     def entity_to_response(instance: PokemonModel) -> PokemonResponse:
#         return PokemonResponse(
#             no=instance.no,
#             name=instance.name,
#             types=list(map(TypeResponseMapper.entity_to_response, instance.types)),
#             previous_evolutions=list(
#                 map(EvolutionResponseMapper.entity_to_response, instance.previous_evolutions)
#             ),
#             next_evolutions=list(
#                 map(EvolutionResponseMapper.entity_to_response, instance.next_evolutions)
#             ),
#         )
