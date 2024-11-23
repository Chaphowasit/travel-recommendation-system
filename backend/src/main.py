import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from adapters.Weaviate import Weaviate_Adapter
from adapters.MariaDB import MariaDB_Adaptor
from controllers.chatbot import Chatbot
from controllers.interface import fetch_place_detail
import logging
from common.mariadb_schema import Base

# Initialize Flask app
app = Flask(__name__)
app.config["APP_NAME"] = "Travel Recommendation System"

# Apply CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Set up logger
logger = logging.getLogger(app.config["APP_NAME"])
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


# Register the Blueprint
@app.errorhandler(Exception)
def universal_exception_handler(exc):
    logger.error(f"Exception occurred: {type(exc).__name__}: {exc}", exc_info=True)
    return jsonify({"error": f"{type(exc).__name__}: {exc}"}), 500


@app.route("/", methods=["GET"])
def root():
    logger.info("Root endpoint accessed")
    return jsonify({"service": app.config["APP_NAME"]})



import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
import os

@app.route("/sendMessage", methods=["POST"])
def send_message():
    logger.info("sendMessage endpoint accessed")
    try:
        # Extract data from the request
        data = request.json  # Assuming you're sending JSON data in the body
        if "message" not in data:
            logger.warning("No message provided in request")
            return (
                jsonify({"error": "No message provided"}),
                400,
            )  # Return error if message is missing

        message = data["message"]
        logger.debug(f"User message received: {message}")

        intent_result = chatbot.classify_intent(message)
        logger.debug(f"Intent classified as: {intent_result}")

        if "Recommended" not in intent_result:
            logger.info("Non-recommendation intent detected")
            response = chatbot.answer_etc(message)
            return jsonify({"user_message": response})

        logger.info("Recommendation intent detected")
        activity_response_json, accommodation_response_json = fetch_place_detail(message, weaviate_adapter, mariadb_adaptor)
        # # Fetch and process activity recommendations
        # activity_response_json = weaviate_adapter.remove_dup_and_get_id(
        #     "Activity_Embedded",
        #     "activity_name",
        #     message,
        #     "Activity_Bridge",
        #     "activity_id"
        # )

        # # Fetch and process accommodation recommendations
        # accommodation_response_json = weaviate_adapter.remove_dup_and_get_id(
        #     "Accommodation_Embedded",
        #     "accommodation_name",
        #     message,
        #     "Accommodation_Bridge",
        #     "accommodation_id"
        # )

        # # Fetch business hours for activities
        # activity_response_json = mariadb_adaptor.get_place_detail(activity_response_json)

        # activity_response_json = [rename_field(item) for item in activity_response_json]

        # # Fetch business hours for accommodations
        # accommodation_response_json = mariadb_adaptor.get_place_detail(accommodation_response_json)

        # accommodation_response_json = [
        #     rename_field(item) for item in accommodation_response_json
        # ]

        # # Sort results by score
        # activity_response_json.sort(key=lambda x: x.get("score", 0), reverse=True)
        # accommodation_response_json.sort(key=lambda x: x.get("score", 0), reverse=True)

        # # Determine response based on place type
        # results = {
        #     "activities": activity_response_json,
        #     "accommodations": accommodation_response_json,
        # }

        place_type = chatbot.classify_place_type(message)
        logger.info(f"{place_type} type detected for recommendation")

        if place_type == "Activity":
            response = chatbot.recommend_place(activity_response_json, message).content
        else:
            response = chatbot.recommend_place(
                accommodation_response_json, message
            ).content

        # Prepare and return the result
        result = {
            "user_message": response,
            "accommodations": accommodation_response_json,
            "activities": activity_response_json,
        }

        print("====" * 10)
        print(result)

        logger.debug(f"Response generated: {result}")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in sendMessage: {e}", exc_info=True)
        return jsonify({"error": "An error occurred"}), 500


if __name__ == "__main__":
    # init chatbot
    chatbot = Chatbot()
    # setup weaviate
    weaviate_adapter = Weaviate_Adapter()

    # setup mariadb
    mariadb_adaptor = MariaDB_Adaptor()
    Base.metadata.create_all(mariadb_adaptor.get_engine())
    # id = "A0201"
    # act = mariadb_adaptor.select_activity_by_id(id)
    # print(f"query with {id} got {act.name}")
    
    logger.info("Starting Flask application")
    app.run(debug=True)