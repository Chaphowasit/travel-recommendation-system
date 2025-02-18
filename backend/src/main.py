import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from controllers.ventical_n_day.vrp import VRPSolver
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
        
        if message == "Generate route from my note":
            if "note_payload" not in data:
                logger.warning("No places note provided in request")
                return jsonify({"error": "No place provided"}), 400

            vrp_solver = VRPSolver(data["note_payload"])
            vrp_result = vrp_solver.solve()
            return jsonify({"user_message": "Here's your optimize traveling route!!!", "route": vrp_result})

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

        place_type = chatbot.classify_place_type(message)
        logger.info(f"{place_type} type detected for recommendation")

        if place_type == "Activity":
            response = chatbot.recommend_place(activity_response_json, message)
        else:
            response = chatbot.recommend_place(accommodation_response_json, message)

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




vrp_payload = {
            "accommodation": {
                "id": "H0021",
                "sleepTimes": [
                    {"morning": 28, "evening": 74, "sleepTime": 32},
                    {"morning": 30, "evening": 72, "sleepTime": 32},
                    {"morning": 30, "evening": 64, "sleepTime": 32},
                ]
            },
            "activities": [
                [
                    {
                        "id": "A0423",
                        "visit_time": [
                            {"start": 22, "end": 44},
                            {"start": 60, "end": 72}
                        ],
                    },
                    {
                        "id": "A0153",
                        "visit_time": [
                            {"start": 26, "end": 68}
                        ],
                    },
                    {
                        "id": "A0155",
                        "visit_time": [
                            {"start": 30, "end": 52},
                            {"start": 56, "end": 78}
                        ],
                    },
                    {
                        "id": "A0512",
                        "visit_time": [
                            {"start": 25, "end": 40},
                            {"start": 54, "end": 72}
                        ],
                    }, 
                ],
                [
                    {
                        "id": "A0527",
                        "visit_time": [
                            {"start": 20, "end": 34},
                            {"start": 38, "end": 58},
                        ],

                    },
                    {
                        "id": "A0444",
                        "visit_time": [
                            {"start": 42, "end": 60}, 
                            {"start": 72, "end": 94}
                        ],

                    },
                    {
                        "id": "A0002",
                        "visit_time": [
                            {"start": 50, "end": 64}
                        ],

                    },
                    {
                        "id": "A0238",
                        "visit_time": [
                            {"start": 48, "end": 72}
                        ],

                    },
                ],
                [
                    {
                        "id": "A0055",
                        "visit_time": [
                            {"start": 40, "end": 68},
                            {"start": 28, "end": 64},
                        ],

                    },
                    {
                        "id": "A0787",
                        "visit_time": [
                            {"start": 22, "end": 40},
                            {"start": 36, "end": 74},
                        ],

                    },
                    {
                        "id": "A0786",
                        "visit_time": [
                            {"start": 28, "end": 42}
                        ],

                    },
                    {
                        "id": "A0234",
                        "visit_time": [
                            {"start": 58, "end": 72}
                        ],
                    },
                ]
            ],
            "activities_stayTime": {
                "A0423": 8,
                "A0153": 12,
                "A0155": 16,
                "A0512": 20,
                "A0527": 8,
                "A0444": 15,
                "A0002": 19,
                "A0238": 21,
                "A0055": 4,
                "A0787": 8,
                "A0786": 13,
                "A0234": 11,
            }
        }

if __name__ == "__main__":
    # Initialize dependencies
    chatbot = Chatbot()
    weaviate_adapter = Weaviate_Adapter()
    mariadb_adaptor = MariaDB_Adaptor()
    Base.metadata.create_all(mariadb_adaptor.get_engine())

    logger.info("Starting Flask application")
    app.run(debug=True)
