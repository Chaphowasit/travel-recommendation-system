import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from controllers.ventical_n_day.vrp import vehicle_routing_problem
from adapters.Weaviate import Weaviate_Adapter
from adapters.MariaDB import MariaDB_Adaptor
from controllers.chatbot import Chatbot
from controllers.interface import fetch_place_detail
from common.mariadb_schema import Base

# Initialize Flask app
app = Flask(__name__)
app.config["APP_NAME"] = "Travel Recommendation System"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(app.config["APP_NAME"])
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

# Apply CORS
CORS(app, resources={r"/*": {"origins": "*"}})


# Error handler
@app.errorhandler(Exception)
def universal_exception_handler(exc):
    logger.error(f"Exception occurred: {type(exc).__name__}: {exc}", exc_info=True)
    return jsonify({"error": f"{type(exc).__name__}: {exc}"}), 500


# Root endpoint
@app.route("/", methods=["GET"])
def root():
    logger.info("Root endpoint accessed")
    return jsonify({"service": app.config["APP_NAME"]})


# Send Message endpoint
@app.route("/sendMessage", methods=["POST"])
def send_message():
    logger.info("sendMessage endpoint accessed")
    try:
        data = request.json
        if "message" not in data:
            logger.warning("No message provided in request")
            return jsonify({"error": "No message provided"}), 400

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

        result = {
            "user_message": response,
            "accommodations": accommodation_response_json,
            "activities": activity_response_json,
        }

        logger.debug(f"Response generated: {result}")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in sendMessage: {e}", exc_info=True)
        return jsonify({"error": "An error occurred"}), 500


# Summarize descriptions in the response
def summarize_description(response_json):
    for item in response_json:
        item["description"] = chatbot.summarize_description(
            des=item["description"]
        ).content
    return response_json


# Named Entity Recognition (NER) for tagging
def NER(response_json):
    for item in response_json:
        item["tag"] = chatbot.name_entity_recognition(text=item["tag"])
    return response_json


# Vehicle Routing Problem (VRP) Route Generation
@app.route('/vrp/generate-route', methods=['POST', 'OPTIONS'])
def generate_route():
    logger.info("VRP Generate Route endpoint accessed")
    if request.method == 'OPTIONS':
        logger.info("Handling OPTIONS preflight request")
        return '', 204  # Preflight response for CORS

    try:
        # Sample hardcoded payload for testing
        vrp_payload = {
            "accommodation": "H0021",
            "activities": [
                {
                    "day": 1,
                    "place": [
                        {
                            "id": "A0423",
                            "visit_time": [{"start": 40, "end": 48}],
                            "must": True,
                        },
                        {
                            "id": "A0153",
                            "visit_time": [{"start": 56, "end": 68}],
                            "must": False,
                        },
                        {
                            "id": "A0155",
                            "visit_time": [{"start": 56, "end": 68}],
                            "must": True,
                        },
                        {
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
                            "id": "A0527",
                            "visit_time": [
                                {"start": 30, "end": 34},
                                {"start": 38, "end": 48},
                            ],
                            "must": True,
                        },
                        {
                            "id": "A0444",
                            "visit_time": [
                                {"start": 52, "end": 60}, 
                                {"start": 72, "end": 84}
                            ],
                            "must": True,
                        },
                        {
                            "id": "A0002",
                            "visit_time": [
                                {"start": 60, "end": 64}
                            ],
                            "must": True,
                        },
                        {
                            "id": "A0238",
                            "visit_time": [
                                {"start": 68, "end": 72}
                            ],
                            "must": False,
                        },
                    ],
                    "time_anchor": {"morning": 30, "evening": 72},
                },
                {
                    "day": 3,
                    "place": [
                        {
                            "id": "A0055",
                            "visit_time": [{"start": 40, "end": 48}],
                            "must": True,
                        },
                        {
                            "id": "A0815",
                            "visit_time": [{"start": 52, "end": 60}],
                            "must": False,
                        },
                        {
                            "id": "A0809",
                            "visit_time": [{"start": 68, "end": 72}],
                            "must": True,
                        },
                        {
                            "id": "A0234",
                            "visit_time": [{"start": 68, "end": 72}],
                            "must": False,
                        },
                    ],
                    "time_anchor": {"morning": 28, "evening": 72},
                },
            ],
        }

        logger.debug(f"VRP payload: {vrp_payload}")
        vrp_result = vehicle_routing_problem(vrp_payload)
        logger.info(f"VRP Result: {vrp_result}")
        return jsonify(vrp_result)

    except Exception as e:
        logger.error(f"Error in generate_route: {e}", exc_info=True)
        return jsonify({"error": "An error occurred"}), 500


# fetch data from mariadb
@app.route("/fetch-mariadb", methods=["GET"])
def fetch_mariadb():
    try:
        # Get the 'place_ids' parameter from the query string
        place_ids = request.args.get("place_ids")
        
        # Ensure place_ids is provided
        if not place_ids:
            return jsonify({"error": "place_ids parameter is required"}), 400

        # Split the place_ids string by commas to create a list of strings
        place_ids_list = place_ids.split(",")

        # Fetch place details from the MariaDB_Adaptor
        place_details, business_hours = MariaDB_Adaptor.fetch_place_details(
            mariadb_adaptor, place_ids=place_ids_list
        )

        # Initialize the transformed data structure as a list
        result = []

        # Helper function to format business hours
        def format_business_hours(start_time, end_time):
            return {"start": start_time, "end": end_time}

        # Transform and rearrange fields
        for place_id, details in place_details.items():
            entry = {
                "id": place_id,
                "name": details["name"],
                "description": details["about_and_tags"],
                "tag": details["about_and_tags"],
                "business_hour": format_business_hours(
                    details["start_time_int"], details["end_time_int"]
                ),
                "image": details["image_url"],
            }

            # Append entry to the list
            result.append(entry)

        # Return the transformed data as a JSON array
        print(result)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Initialize dependencies
    chatbot = Chatbot()
    weaviate_adapter = Weaviate_Adapter()
    mariadb_adaptor = MariaDB_Adaptor()
    Base.metadata.create_all(mariadb_adaptor.get_engine())

    logger.info("Starting Flask application")
    app.run(debug=True)
