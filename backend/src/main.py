import logging
from controllers.ventical_n_day.vrp import vehicle_routing_problem
from flask import Flask, jsonify, request
from flask_cors import CORS
from adapters.Weaviate import Weaviate_Adapter
from adapters.MariaDB import MariaDB_Adaptor
from controllers.chatbot import Chatbot
from controllers.interface import fetch_place_detail
import logging
from common.mariadb_schema import Base
import logging

# Initialize Flask app
app = Flask(__name__)
app.config["APP_NAME"] = "Travel Recommendation System"
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        activity_response_json, accommodation_response_json = fetch_place_detail(
            message, weaviate_adapter, mariadb_adaptor
        )

        # Summarize the description
        activity_response_json = summarize_description(activity_response_json)
        accommodation_response_json = summarize_description(accommodation_response_json)

        # NER for create tags
        activity_response_json = NER(activity_response_json)
        accommodation_response_json = NER(accommodation_response_json)

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


def summarize_description(response_json):
    for item in response_json:
        item["description"] = chatbot.summarize_description(
            des=item["description"]
        ).content
    return response_json


def NER(response_json):
    for item in response_json:
        item["tag"] = chatbot.name_entity_recognition(text=item["tag"])
    return response_json


# route for vrp
@app.route("/vrp/generate-route", methods=["GET"])
def vrp():
    vrp_result = vehicle_routing_problem(
        {
            "accommodation": "H0021",
            "activities": [
                {
                    "day": 1,
                    "place": [
                        {
                            "linked_id": "1",
                            "id": "A0423",
                            "visit_time": [{"start": 40, "end": 48}],
                            "must": True,
                        },
                        {
                            "linked_id": "2",
                            "id": "A0153",
                            "visit_time": [{"start": 56, "end": 68}],
                            "must": False,
                        },
                        {
                            "linked_id": "3",
                            "id": "A0155",
                            "visit_time": [{"start": 56, "end": 68}],
                            "must": True,
                        },
                        {
                            "linked_id": "4",
                            "id": "A0512",
                            "visit_time": [{"start": 64, "end": 72}],
                            "must": False,
                        },
                    ],
                    "time_anchor": {"morning": 28, "evening": 72},
                },
                {
                    "day": 2,
                    "place": [
                        {
                            "linked_id": "1",
                            "id": "A0527",
                            "visit_time": [
                                {"start": 30, "end": 34},
                                {"start": 38, "end": 48},
                            ],
                            "must": True,
                        },
                        {
                            "linked_id": "2",
                            "id": "A0444",
                            "visit_time": [{"start": 52, "end": 60}],
                            "must": True,
                        },
                        {
                            "linked_id": "3",
                            "id": "A0002",
                            "visit_time": [{"start": 60, "end": 64}],
                            "must": True,
                        },
                        {
                            "linked_id": "4",
                            "id": "A0238",
                            "visit_time": [{"start": 68, "end": 72}],
                            "must": False,
                        },
                    ],
                    "time_anchor": {"morning": 30, "evening": 72},
                },
                {
                    "day": 3,
                    "place": [
                        {
                            "linked_id": "1",
                            "id": "A0055",
                            "visit_time": [{"start": 40, "end": 48}],
                            "must": True,
                        },
                        {
                            "linked_id": "2",
                            "id": "A0815",
                            "visit_time": [{"start": 52, "end": 60}],
                            "must": False,
                        },
                        {
                            "linked_id": "3",
                            "id": "A0809",
                            "visit_time": [{"start": 68, "end": 72}],
                            "must": True,
                        },
                        {
                            "linked_id": "4",
                            "id": "A0234",
                            "visit_time": [{"start": 68, "end": 72}],
                            "must": False,
                        },
                    ],
                    "time_anchor": {"morning": 28, "evening": 72},
                },
            ],
        }
    )
    print(vrp_result)
    return jsonify(vrp_result)


if __name__ == "__main__":
    # init chatbot
    chatbot = Chatbot()
    # setup weaviate
    weaviate_adapter = Weaviate_Adapter()

    # setup mariadb
    mariadb_adaptor = MariaDB_Adaptor()
    Base.metadata.create_all(mariadb_adaptor.get_engine())

    logger.info("Starting Flask application")
    app.run(debug=True)
