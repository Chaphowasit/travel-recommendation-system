import logging

# Third-party imports
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO

# Local application imports
from adapters.Weaviate import Weaviate_Adapter
from adapters.MariaDB import MariaDB_Adaptor
from controllers.streaming_chatbot import StreamingChatbot
from common.mariadb_schema import Base
from common.utils import rename_field


# Initialize Flask app
app = Flask(__name__, static_folder="../dist")
app.config["APP_NAME"] = "Travel Recommendation System"

# Apply CORS
CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(app, cors_allowed_origins="*")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(app.config["APP_NAME"])
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

# Error handler
@app.errorhandler(Exception)
def universal_exception_handler(exc):
    logger.error(f"Exception occurred: {type(exc).__name__}: {exc}", exc_info=True)
    return jsonify({"error": f"{type(exc).__name__}: {exc}"}), 500

# Restful api
# Root endpoint
@app.route("/")
def serve():
    """function to serve the index.html file from the frontend folder"""
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    """function to serve the static files from the frontend folder"""
    return send_from_directory(app.static_folder, path)
# @app.route("/", methods=["GET"])
# def root():
#     # logger.info("Root endpoint accessed")
#     return jsonify({"service": app.config["APP_NAME"]})

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
        with MariaDB_Adaptor() as mariadb_adaptor:
            activity_place_details = mariadb_adaptor.fetch_activities(
                place_ids=place_ids_list
            )
            
            accommodation_place_details = mariadb_adaptor.fetch_accommodations(
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
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# websocket
@socketio.on('connect')
def handle_connect():
    print("Client connected")

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")
    
@socketio.on('message')
def handle_message(message):
    print(message)
    for response in streaming_chatbot.response(message.get("text", ""), message.get("payload", {})):
        socketio.emit("message", response)

if __name__ == "__main__":
    
    weaviate_adapter = Weaviate_Adapter()
    with MariaDB_Adaptor() as mariadb_adaptor:
        Base.metadata.create_all(mariadb_adaptor.get_engine())

    streaming_chatbot = StreamingChatbot(weaviate_adapter, mariadb_adaptor)

    logger.info("Starting Flask application")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
