from flask import Blueprint, jsonify, request


blueprint = Blueprint("app", __name__)


@blueprint.route("/send", methods= ["POST"])
def recieved_message():
    message = request.form.get("message")

    return jsonify({"message": "No id provided", "user_message": message}), 200