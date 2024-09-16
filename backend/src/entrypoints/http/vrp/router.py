from flask import Blueprint, request, jsonify, abort

from common.type import PlaceIdStr
from di.dependency_injection import injector
from di.unit_of_work import AbstractUnitOfWork
from usecases import vrp as vrp_ucase

from .mapper import VrpRequestMapper
from .schema import VrpProcessRequest, SomeResponse

vrp_router = Blueprint('vrp', __name__)

@vrp_router.route('/vrp/process', methods=['POST'])
async def process():
    print("hello")
    body = request.get_json()
    create_pokemon_request = VrpProcessRequest(**body)
    
    # Using sync calls since Flask is synchronous
    # async_unit_of_work = injector.get(AbstractUnitOfWork)
    vrp_process_data = VrpRequestMapper.process_vrp_request_to_entity(create_pokemon_request)
    data = await vrp_ucase.retrieve_data(vrp_process_data)
    print(data.accommodation)

    return "helloworld"
    # return jsonify(VrpResponseMapper.entity_to_response(created_pokemon)), 201