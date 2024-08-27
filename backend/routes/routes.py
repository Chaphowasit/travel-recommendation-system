from flask import Blueprint, jsonify, request

from controllers.vrp import VrpController
from models.FoodAndDrink_Detail import FoodAndDrinkDetail, FoodAndDrinkDetail_Engine

blueprint = Blueprint("app", __name__)

@blueprint.route("/sendMessage", methods=["POST"])
def sendMessage():
    data = request.get_json()  # Get the JSON data from the request body
    message = data.get("message")  # Extract the message field from the JSON

    return jsonify({"message": "No id provided", "user_message": message}), 200

@blueprint.route("/sendIntervals", methods=["POST"])
def sendIntervals():
    data = request.get_json()  # Get the JSON data from the request body
    
    desired_places = data.get("desired_places")
    intervals = data.get("intervals")
    
    VrpController.process_vrp(desired_places=desired_places, intervals=intervals)

    return jsonify({"message": "No id provided", "intervals": intervals}), 200

@blueprint.route("/getRestaurant", methods=["GET"])
def getRestaurant():
    
    FoodAndDrinkDetail_instance = FoodAndDrinkDetail_Engine()
    
    results = FoodAndDrinkDetail_instance.query(columns=["id", "foodAndDrink_name"]);
    output = [str(result.id) + " " + result.foodAndDrink_name for result in results]

    return jsonify({"message": "No id provided", "restaurants": output}), 200