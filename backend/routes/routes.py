from flask import Blueprint, jsonify, request

blueprint = Blueprint("app", __name__)

@blueprint.route("/sendMessage", methods=["POST"])
def received_message():
    data = request.get_json()  # Get the JSON data from the request body
    message = data.get("message")  # Extract the message field from the JSON

    return jsonify({"message": "No id provided", "user_message": message}), 200