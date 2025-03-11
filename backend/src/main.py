import logging
from flask import Flask, Response, jsonify, request, render_template
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from controllers.ventical_n_day.vrp import VRPSolver
from adapters.Weaviate import Weaviate_Adapter
from adapters.MariaDB import MariaDB_Adaptor
from controllers.chatbot import Chatbot
from controllers.streaming_chatbot import StreamingChatbot
from controllers.interface import fetch_place_detail
from common.mariadb_schema import Base
from common.utils import rename_field
from flask_socketio import SocketIO, emit

# Initialize Flask app
app = Flask(__name__)
app.config["APP_NAME"] = "Travel Recommendation System"

socketio = SocketIO(app)

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

@app.route('/page')
def index():
    return render_template('index.html')

# # Root endpoint
@app.route("/", methods=["GET"])
def root():
    # logger.info("Root endpoint accessed")
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

        print(place_ids)

        # Ensure place_ids is provided
        if not place_ids:
            return jsonify({"error": "place_ids parameter is required"}), 400

        # Split the place_ids string by commas to create a list of strings
        place_ids_list = place_ids.split(",")

        # Fetch place details from the MariaDB_Adaptor
        with MariaDB_Adaptor() as mariadb_adaptor:
            accommodation_place_details = mariadb_adaptor.fetch_accommodations(
                place_ids=place_ids_list
            )

            activity_place_details = mariadb_adaptor.fetch_activities(
                place_ids=place_ids_list
            )

        # Initialize the transformed data structure as a list
        result = []

        # Transform and rearrange fields
        for place_id in place_ids_list:
            data = activity_place_details.get(
                place_id, None
            ) or accommodation_place_details.get(place_id, None)

            entry = rename_field(place_id, data)

            # Append entry to the list
            result.append(entry)

        # Return the transformed data as a JSON array
        print(result)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


payload = {
    "accommodation": {
        "place_id": "H0491",
        "sleep_times": [
            {
                "start": 0,
                "end": 32
            },
            {
                "start": 96,
                "end": 128
            }
        ]
    },
    "activities": [
        {
            "place_id": "A2291",
            "stay_time": 50,
            "visit_range": [
                {
                    "start": 0,
                    "end": 96
                },
                {
                    "start": 96,
                    "end": 192
                }
            ],
            "must": False
        },
        {
            "place_id": "A0736",
            "stay_time": 32,
            "visit_range": [
                {
                    "start": 40,
                    "end": 76
                },
                {
                    "start": 136,
                    "end": 172
                }
            ],
            "must": False
        },
        {
            "place_id": "A0265",
            "stay_time": 12,
            "visit_range": [
                {
                    "start": 32,
                    "end": 68
                },
                {
                    "start": 128,
                    "end": 164
                }
            ],
            "must": False
        },
        {
            "place_id": "A0314",
            "stay_time": 16,
            "visit_range": [
                {
                    "start": 48,
                    "end": 88
                },
                {
                    "start": 144,
                    "end": 184
                }
            ],
            "must": False
        }
    ]
}

@socketio.on('connect')
def handle_connect():
    print("Client connected")

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")
    
@socketio.on('message')
def handle_message(message):
    for response in streaming_chatbot.response(message, payload):
        socketio.emit("message", str(response))

if __name__ == "__main__":
    # Initialize dependencies
    chatbot = Chatbot()
    
    weaviate_adapter = Weaviate_Adapter()
    with MariaDB_Adaptor() as mariadb_adaptor:
        Base.metadata.create_all(mariadb_adaptor.get_engine())

    streaming_chatbot = StreamingChatbot(weaviate_adapter, mariadb_adaptor)

    logger.info("Starting Flask application")
    # app.run(debug=True)
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
